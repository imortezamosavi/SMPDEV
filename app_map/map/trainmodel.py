import ee
import json
import os
import sys
import requests
import numpy as np
import pandas as pd
import geopandas as gpd
from datetime import datetime
from sklearn.metrics import r2_score as r2, mean_squared_error
# from sklearn.metrics import r2_score as r2, mean_squared_error

###################################################################################################################################

service_account = 'mrsp-476@mrsp-414109.iam.gserviceaccount.com'
file_path = os.path.abspath('map/basic_files/mrsp-414109-d4ddd84517dc.json')
credentials = ee.ServiceAccountCredentials(service_account, file_path)
ee.Initialize(credentials)

###################################################################################################################################

print('Connected to GEE Server')
print('*'*23)


def shapefile_to_ee(path, label):
    """Convert a shapefile to an Earth Engine FeatureCollection."""
    absolute_path = os.path.abspath(path)
    if not os.path.isfile(absolute_path):
        raise ValueError(f"{label} shapefile does not exist: {absolute_path}")

    try:
        frame = gpd.read_file(absolute_path)
    except Exception as exc:
        raise ValueError(f"Unable to read {label} shapefile '{absolute_path}': {exc}") from exc

    if frame.empty:
        raise ValueError(f"{label} shapefile contains no features: {absolute_path}")
    if frame.crs is None:
        raise ValueError(f"{label} shapefile has no coordinate reference system: {absolute_path}")
    if frame.geometry.isna().any() or frame.geometry.is_empty.any():
        raise ValueError(f"{label} shapefile contains missing or empty geometries: {absolute_path}")

    try:
        frame = frame.to_crs(epsg=4326)
        geojson = json.loads(frame.to_json(drop_id=True, na='null'))
        return ee.FeatureCollection(geojson['features'])
    except Exception as exc:
        raise ValueError(
            f"Unable to convert {label} shapefile '{absolute_path}' to Earth Engine: {exc}"
        ) from exc

class IindexExtractor:
    def __init__(self, geometry, scale):
        self.geometry = geometry
        self.scale = scale

    def optram(self, image):
        # Select bands and apply scaling factor
        bands = image.select('B.*').multiply(0.0001)

        # Compute NDVI and STR indices
        NDVI = bands.normalizedDifference(['B8', 'B4']).rename('ndvi')
        STR = bands.expression('((1 - swir) ** 2) / (2 * swir)', {'swir': bands.select('B12')}).rename('str')
        stack = ee.Image.cat([NDVI, STR])

        # Apply thresholds for full vegetation and bare soil
        thr_full = NDVI.gt(0.3)
        str_full = STR.updateMask(thr_full)

        thr_bare = NDVI.gte(0).And(NDVI.lt(0.2))
        str_bare = STR.updateMask(thr_bare)

        # Calculate VW, VD, IW, ID values over the region of interest
        vw = ee.Number(str_full.reduceRegion(
            reducer=ee.Reducer.max(),
            geometry=self.geometry,
            scale=self.scale
        ).get('str'))

        vd = ee.Number(str_full.reduceRegion(
            reducer=ee.Reducer.min(),
            geometry=self.geometry,
            scale=self.scale
        ).get('str'))

        iw = ee.Number(str_bare.reduceRegion(
            reducer=ee.Reducer.max(),
            geometry=self.geometry,
            scale=self.scale
        ).get('str'))

        id = ee.Number(str_bare.reduceRegion(
            reducer=ee.Reducer.min(),
            geometry=self.geometry,
            scale=self.scale
        ).get('str'))

        # Calculate SW and SD values
        sw = vw.subtract(iw)
        sd = vd.subtract(id)

        # Create the soil moisture index
        mask = NDVI.lt(-0.1).Not()
        index = stack.expression(
            '(id + sd * ndvi - str) / (id - iw + (sd - sw) * ndvi)',
            {
                'id': id,
                'sd': sd,
                'ndvi': NDVI,
                'str': STR,
                'iw': iw,
                'sw': sw
            }
        ).rename('OPTRM')

        # Return the final index with scaling and masking
        return index.updateMask(mask).copyProperties(image, image.propertyNames())

    def ndwi(self, image):

        NDWI = image.normalizedDifference(['B3', 'B8']).rename('NDWI')
        return NDWI

    def ndvi(self, image):

        NDVI = image.normalizedDifference(['B3', 'B8']).rename('NDVI')
        return NDVI

    def ndmi(self, image):

        NDMI = image.normalizedDifference(['B8', 'B11']).rename('NDMI');
        return NDMI

    def nsds(slef, image):
        NSDS = image.normalizedDifference(['B11', 'B12']).rename('NSDS');
        return NSDS

    def gvmi(self, image):
        # Implement GVMI formula
        GVMI = image.expression(
            '((nir + 0.1) - (swir + 0.02)) / ((nir + 0.1) + (swir + 0.02))',
            {
                'nir': image.select('B8'),
                'swir': image.select('B11')
            }
        ).rename('GVMI')
        return GVMI

class TrainModel:
    def __init__(self, roi, points):
        """
        Initialize the TrainModel class with the region of interest and points.

        Args:
        roi (str): Path to the shapefile representing the region of interest.
        points (str): Path to the shapefile representing the points.
        """
        self.roi = shapefile_to_ee(roi, 'ROI')
        self.points = shapefile_to_ee(points, 'Points')

    def reformat_date(self,feature):
        date_str = feature.getString('date')  # Get the 'date' property
        date_parts = ee.String(date_str).split('/')  # Split the string by '/'

        # Extract day, month, and year
        month = ee.Number.parse(date_parts.get(1))  # Month is at index 1
        day = ee.Number.parse(date_parts.get(0))  # Day is at index 0
        year = ee.String(date_parts.get(2))  # Year is at index 2

        # Format day and month with leading zeros
        month = month.format('%02d')
        day = day.format('%02d')

        # Create the formatted date string in 'YYYY-MM-DD' format

        formatted_date = year.cat('-').cat(month).cat('-').cat(day)

        # Set the new 'formatted_date' property in the feature
        return feature.set('formatted_date', formatted_date)
    
    def start_end(self, date_list):
        sorted_dates = date_list.sort()
        start = sorted_dates.get(0).getInfo()  # Get the earliest date
        end = sorted_dates.get(-1).getInfo()  # Get the latest date
        return start, end

    def image_dates(self, image):
        time_start = image.get('system:time_start')

        return ee.Algorithms.If(
            time_start,
            ee.Feature(None, {'date': ee.Date(time_start).format('YYYY-MM-dd')}),
            None
        )
    
    def sampled_collection(self, collection, reformatted_date, dates, scale):
        # Initialize an empty FeatureCollection
        all_sampled_data = ee.FeatureCollection([])

        reformatted_collection = collection.map(self.reformat_date)

        # Loop through each date in the provided dates
        for date in dates:
            start = ee.Date(date)
            end = start.advance(1, 'day')

            sentinel = collection.filterDate(start, end).median()

            # Filter the reformatted date collection
            filtered_collection = reformatted_date.filter(ee.Filter.eq('formatted_date', date))

            # Sample data from the first image
            sampled_data = (
                sentinel.sampleRegions(
                    collection=filtered_collection,
                    properties=['moisture_c'],  # Target moisture content
                    scale=scale,
                    geometries=True
                )
            )

            # Merge the sampled data into all_sampled_data
            all_sampled_data = all_sampled_data.merge(sampled_data)

        return all_sampled_data

    def select_features(self, feature_collection):
        first_feature = feature_collection.first()
        properties_to_parse = first_feature.propertyNames().remove('system:index').getInfo()
        return properties_to_parse
    
    def parse_feature_properties(self, feature, properties_to_parse):
        parsed_properties = {}

        # Loop through each property and parse it as a number if applicable
        for property in properties_to_parse:
            value = feature.get(property)
            # Parse the value as a number
            parsed_properties[property] = ee.Number.parse(value)

        # Set the parsed properties back into the feature
        return feature.set(parsed_properties)
    
    def load_collection(self, start, end):
        # Load and process Sentinel-2 collection
        self.S2_collection = (
            ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
            .filterBounds(self.roi)
            .filterDate(start, end)
            .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 18))
            .select("B.*")
            .map(self.add_indices)  # Apply indices computation
        )

        # Return the collection
        return self.S2_collection

    def add_indices(self, image):
        # Instantiate IindexExtractor with the region of interest and scale
        index_extractor = IindexExtractor(self.roi, 10)

        # Compute indices using the instance of IindexExtractor
        optram_index = index_extractor.optram(image)
        ndwi_index = index_extractor.ndwi(image)
        ndvi_index = index_extractor.ndvi(image)
        ndmi_index = index_extractor.ndmi(image)
        nsds_index = index_extractor.nsds(image)
        gvmi_index = index_extractor.gvmi(image)

        # Add computed indices as new bands to the original image
        # return image.addBands([optram_index, ndwi_index, ndvi_index, ndmi_index, nsds_index, gvmi_index])
        return image.addBands([ndwi_index, ndvi_index, ndmi_index, nsds_index, gvmi_index])
    
    def parsed_feature(self, collection, reformatted_dates, scale):
        # Step 1: Map 'get_date' function to extract dates from the ImageCollection
        dates_features = collection.map(self.image_dates)

        # Step 2: Extract a list of dates from the collection and convert it to a list format
        just_dates = dates_features.aggregate_array('date').getInfo()

        # Step 3: Create a sampled collection based on the extracted dates and the provided scale
        Sampled_Collection = self.sampled_collection(collection, reformatted_dates, just_dates, scale)

        # Step 4: Determine which properties to parse from the first feature in the sampled collection
        properties_to_parse = self.select_features(Sampled_Collection)

        # Step 5: Parse each feature in the sampled collection to retain only the specified properties
        parsed_feature_collection = Sampled_Collection.map(lambda feature: self.parse_feature_properties(feature, properties_to_parse))

        # Step 6: Return the processed and parsed feature collection
        return parsed_feature_collection, properties_to_parse
    
      # Function to extract moisture values from a FeatureCollection
    
    def extract_moisture_values(self, feature_collection):
        """
        Extracts moisture_c_predicted and moisture_c values from a FeatureCollection.

        Parameters:
            feature_collection (dict): A dictionary representing the FeatureCollection.

        Returns:
            list of tuples: A list containing tuples of (moisture_c, moisture_c_predicted).
        """
        real = []  # List to store actual moisture values
        predicted = []  # List to store predicted moisture values

        # Iterate through each feature in the FeatureCollection
        for feature in feature_collection.get('features', []):
            properties = feature.get('properties', {})

            # Retrieve moisture values
            moisture_c = properties.get('moisture_c', None)
            moisture_c_predicted = properties.get('moisture_c_predicted', None)

            # Append the values to the respective lists
            real.append(moisture_c)
            predicted.append(moisture_c_predicted)

        return real, predicted
    
    def accuracy(self, actual, predicted):
        """
        Calculate the R² score and Root Mean Squared Error (RMSE).

        Parameters:
            actual (list): List of actual values.
            predicted (list): List of predicted values.

        Returns:
            tuple: A tuple containing (R² score, RMSE).
        """
        r2_value = r2(actual, predicted)*100  # Calculate R² score
        mse_value  = mean_squared_error(actual, predicted)
        rmse_value = np.sqrt(mse_value)
        return r2_value, rmse_value
    
    def evaluation(self, model, train_data, test_data, output_path="map/evaluation_results/"):

        predictions_train = train_data.classify(
            classifier=model,
            outputName='moisture_c_predicted'
        )

        predictions_test = test_data.classify(
            classifier=model,
            outputName='moisture_c_predicted'
        )

        real_train, predicted_train = self.extract_moisture_values(
            feature_collection=predictions_train.getInfo()
        )
        real_test, predicted_test = self.extract_moisture_values(
            feature_collection=predictions_test.getInfo()
        )

        # Calculate metrics
        train_r2_score, train_rmse = self.accuracy(real_train, predicted_train)
        test_r2_score, test_rmse = self.accuracy(real_test, predicted_test)

        print('Model Evaluation ...')
        print('Train - R² Score:', train_r2_score, 'RMSE:', train_rmse)
        print('Test - R² Score:', test_r2_score, 'RMSE:', test_rmse)

        # Create directory if it doesn't exist
        os.makedirs(output_path, exist_ok=True)

        # Evaluation summary
        results_df = pd.DataFrame({
            'Dataset': ['Train', 'Test'],
            'R2_Score (%)': [train_r2_score, test_r2_score],
            'RMSE': [train_rmse, test_rmse]
        })

        results_csv = os.path.join(output_path, 'evaluation_results.csv')
        results_df.to_csv(results_csv, index=False)

        # Save train actual vs predicted
        train_predictions_df = pd.DataFrame({
            'Actual': real_train,
            'Predicted': predicted_train
        })

        train_csv = os.path.join(output_path, 'train_predictions.csv')
        train_predictions_df.to_csv(train_csv, index=False)

        # Save test actual vs predicted
        test_predictions_df = pd.DataFrame({
            'Actual': real_test,
            'Predicted': predicted_test
        })

        test_csv = os.path.join(output_path, 'test_predictions.csv')
        test_predictions_df.to_csv(test_csv, index=False)

        print(f"Evaluation results saved to: {results_csv}")
        print(f"Train predictions saved to: {train_csv}")
        print(f"Test predictions saved to: {test_csv}")

        return {
            "metrics": results_df,
            "train_predictions": train_predictions_df,
            "test_predictions": test_predictions_df
        }

    def main(self):
        """
        Applies the reformat_date function to all features in the points FeatureCollection, 
        extracts unique dates, loads a Sentinel-2 image collection, and processes it by adding 
        specified indices and sampling data based on the extracted dates.
        """
        # Step 1: Apply the reformat_date function to all features in the points FeatureCollection
        reformatted_dates = self.points.map(self.reformat_date)  # Map the reformat_date method
        unique_dates = reformatted_dates.aggregate_array('formatted_date')

        # Step 2: Get the start and end dates for the time period of interest
        start, end = self.start_end(unique_dates)

        # Step 3: Define indices or pass None if indices are not needed
        indices = None  # Or specify a list of indices you want to load, e.g., ['NDVI', 'NDWI']

        # Step 4: Initialize the IndexExtractor with the region of interest and scale
        index_extractor = IindexExtractor(self.roi, 10)

        # Step 5: Load the Sentinel-2 image collection for the given date range
        collection = self.load_collection(start, end)

        # Step 6: Apply feature parsing and retrieve properties
        parsed_feature_collection, properties_to_parse = self.parsed_feature(collection, reformatted_dates, 10)

        # Step 7: Define the split ratio for training and testing sets
        split = 0.8

        # Step 8: Add a random column to the feature collection for splitting
        withRandom = parsed_feature_collection.randomColumn(columnName='random', seed=42)

        # Step 9: Filter the collection into training and testing sets
        trainingSet = withRandom.filter(ee.Filter.lt('random', split))  # Less than split ratio for training
        testingSet = withRandom.filter(ee.Filter.gte('random', split))  # Greater than or equal to split ratio for testing

        # Step 10: Create and train a Random Forest Regressor model
        model = ee.Classifier.smileRandomForest(1000) \
            .setOutputMode('REGRESSION') \
            .train(trainingSet,  # Features
                classProperty='moisture_c',  # Target property
                inputProperties=[p for p in properties_to_parse if p != 'moisture_c'])  # Input properties

        self.evaluation(model, train_data=trainingSet, test_data=testingSet)
        
        # Return the trained model
        return model

class Predict:
    def __init__(self, model, roi, date):
        """
        Initialize the Predict class with the region of interest, model, and date.

        Args:
        roi (str): Path to the shapefile representing the region of interest.
        date (ee.Date): The base date to compute the start and end dates.
        model (ee.Classifier): The model used for prediction.
        """
        self.roi = roi
        self.date = ee.Date(date)  # Ensure date is an ee.Date object
        self.model = model

    def span_date(self, date):
        """
        Returns the start and end dates by subtracting and adding 15 days from the given date.

        Args:
        date (ee.Date): The base date.

        Returns:
        tuple: (start, end) where start is 15 days before the date and end is 15 days after.
        """
        start = date.advance(-20, 'day')
        end = date.advance(20, 'day')
        return start, end

    def mask_s2_clouds(self, image):
        """Masks clouds in a Sentinel-2 image using the QA band.

        Args:
            image (ee.Image): A Sentinel-2 image.

        Returns:
            ee.Image: A cloud-masked Sentinel-2 image.
        """
        qa = image.select('QA60')

        # Bits 10 and 11 are clouds and cirrus, respectively.
        cloud_bit_mask = 1 << 10
        cirrus_bit_mask = 1 << 11

        # Both flags should be set to zero, indicating clear conditions.
        mask = (
            qa.bitwiseAnd(cloud_bit_mask)
            .eq(0)
            .And(qa.bitwiseAnd(cirrus_bit_mask).eq(0))
        )

        return image.updateMask(mask).divide(10000)

    def add_indices(self, image):
            # Instantiate IindexExtractor with the region of interest and scale
            index_extractor = IindexExtractor(self.roi, 10)

            # Compute indices using the instance of IindexExtractor
            optram_index = index_extractor.optram(image)
            ndwi_index = index_extractor.ndwi(image)
            ndvi_index = index_extractor.ndvi(image)
            ndmi_index = index_extractor.ndmi(image)
            nsds_index = index_extractor.nsds(image)
            gvmi_index = index_extractor.gvmi(image)

            # Add computed indices as new bands to the original image
            # return image.addBands([optram_index, ndwi_index, ndvi_index, ndmi_index, nsds_index, gvmi_index])
            return image.addBands([ndwi_index, ndvi_index, ndmi_index, nsds_index, gvmi_index])

    def predict_moisture(self, start, end):
        """
        Fetches the Sentinel-2 SR image collection for a given ROI and time range,
        applies the classifier, and returns the predicted image.

        Args:
        start (str): Start date in 'YYYY-MM-DD' format.
        end (str): End date in 'YYYY-MM-DD' format.
        classifier: The trained model to use for classification.

        Returns:
        ee.Image: Predicted moisture content image
        """
        # Step 1: Download the dataset
        image = (
            ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
            .filterDate(start, end)
            .filterBounds(self.roi)
            # .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
            .map(self.mask_s2_clouds)
            .map(self.add_indices)
            .mean()
            .clip(self.roi))

        # Step 2: Apply the classifier to the collection
        prediction = image.classify(self.model).rename('moisture_predicted')

        # Step 3: Return the predicted image (optional: apply further reducers if needed)
        return prediction

    def main(self):
        """
        Main method to execute the prediction process.
        """
        # Step 1: Calculate the date range
        start, end = self.span_date(self.date)
        start_str = start.format('YYYY-MM-dd').getInfo()
        end_str = end.format('YYYY-MM-dd').getInfo()

        # Step 2: Perform the prediction
        prediction = self.predict_moisture(start_str, end_str)

        return prediction

class DownloadPrediction():
    def __init__(self, image, roi, scale, date_str, save_path):
        self.image = image
        self.roi = roi
        self.scale = scale
        self.date_str = date_str
        self.save_path = save_path

    def turn_image_to_raster(self):
        # Generate title using the current date and time
        title = f'SM_{self.date_str}'

        # print(self.image.getInfo())

        # Get download URL from Google Earth Engine
        url = self.image.getDownloadURL(
            params={
                'name': title,
                'scale': self.scale,
                'region': self.roi,
                'crs': 'EPSG:4326',
                'filePerBand': False,
                'format': 'GEO_TIFF'
            })

        # Ensure the save path directory exists
        os.makedirs(self.save_path, exist_ok=True)

        # Download the file
        file_path = os.path.join(self.save_path, title + '.tiff')
        try:
            with requests.get(url, stream=True) as response:
                response.raise_for_status()  # Raise error if the request failed
                with open(file_path, "wb") as f:
                    for chunk in response.iter_content(chunk_size=8192):  # 8KB chunks
                        if chunk:  # Filter out keep-alive chunks
                            f.write(chunk)
            print(f"File downloaded successfully: {file_path}")
        except requests.exceptions.RequestException as e:
            print(f"An error occurred during the download: {e}")
        except OSError as e:
            print(f"An error occurred while writing the file: {e}")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")


