import json

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

from .trainmodel import *
from .geoserver_handler import GeoserverHandler

import logging

logging.basicConfig(level=logging.ERROR)


def map_view(request):
    return render(request, 'app_map/index.html')


@csrf_exempt
def save_polygon(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            polygon_coordinates = data.get('polygon', [])
            selected_date = data.get('date', None)
            # resolution = data.get('resolution', None)  # Capture resolution from the request

            if not polygon_coordinates:
                return JsonResponse({"error": "No polygon coordinates provided"}, status=400)
            
            if not selected_date:
                return JsonResponse({"error": "No date provided"}, status=400)

            # Log the received data
            # print("Received Polygon Coordinates:", polygon_coordinates)
            # print("Selected Date:", selected_date)

            # -------------------------------------------------------------------------
            # File paths
            roi_path = r"./map/basic_files/AOI/AOI_polygon.shp"
            points_path = r"./map/basic_files/Sm_Point/SmPoint.shp"

            try:
                # Step 1: Train the model
                train_model_instance = TrainModel(roi_path, points_path)
                model = train_model_instance.main()
                if not model:
                    raise ValueError("Model training failed. The returned model instance is None.")
                print("Model Trained ...")
            except Exception as e:
                logging.error("Step 1 - Model Training failed", exc_info=True)
                return JsonResponse({"error": f"Step 1 - Model Training failed: {str(e)}"}, status=500)

            try:
                # Step 2: Predict the image
                polygon = ee.Geometry.Polygon(polygon_coordinates)

                # print("Polygon created successfully:", polygon.getInfo())

                image = Predict(model, polygon, selected_date).main()
                if not image:
                    raise ValueError("Prediction failed. The returned image instance is None.")
                print("Image Predicted ...")
            except Exception as e:
                logging.error("Step 2 - Image Prediction failed", exc_info=True)
                return JsonResponse({"error": f"Step 2 - Image Prediction failed: {str(e)}"}, status=500)

            try:
                # Step 3: Download the predicted image
                date = datetime.now()
                date_str = date.strftime('%Y%m%d_%H%M')

                # Create directory inside 'downloads'
                save_dir = os.path.abspath(os.path.join("./downloads/", date_str))
                os.makedirs(save_dir, exist_ok=True)

                downloader = DownloadPrediction(image=image, roi=polygon, scale=10, date_str=date_str, save_path=save_dir)
                print("Attempting to download image...")
                downloader.turn_image_to_raster()
                print("Image successfully downloaded to:", save_dir)
            except Exception as e:
                logging.error("Step 3 - Image Download failed", exc_info=True)
                return JsonResponse({"error": f"Step 3 - Image Download failed: {str(e)}"}, status=500)

            try:
                # Step 4: Upload to Geoserver
                print("Initializing Geoserver upload...")
                geoserver = GeoserverHandler(
                    geoserver_url=settings.GEOSERVER_URL,
                    username=settings.GEOSERVER_USERNAME,
                    password=settings.GEOSERVER_PASSWORD,
                )
                print("Connected to Geoserver")

                workspace_name = geoserver.initialize_workspace(workspace='demo')
                if not workspace_name:
                    raise ValueError("Failed to initialize workspace in Geoserver.")

                layer_name = settings.LAYER_NAME
                workspace = settings.WORKSPACE
                geoserver.upload_tiff(images_path=save_dir, layer_name=layer_name, workspace=workspace)

                geoserver.uplod_style(save_dir, layer_name, workspace)

                print("Image uploaded successfully to Geoserver.")
            except Exception as e:
                logging.error("Step 4 - Geoserver upload failed", exc_info=True)
                return JsonResponse({"error": f"Step 4 - Geoserver upload failed: {str(e)}"}, status=500)

            return JsonResponse({
                "layer_info": f"{workspace}:{layer_name}"
                # "message": "Polygon, date, and resolution saved successfully"
            })
        except json.JSONDecodeError:
            logging.error("Invalid JSON format", exc_info=True)
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            logging.error("Unexpected error occurred", exc_info=True)
            return JsonResponse({"error": f"Unexpected error: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)