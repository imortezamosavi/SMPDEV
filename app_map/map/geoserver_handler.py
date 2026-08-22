import os
import glob

from django.conf import settings
from geo.Geoserver import Geoserver

import logging

logging.basicConfig(level=logging.ERROR)

class GeoserverHandler:
    def __init__(self, geoserver_url, username, password):
        self.geo = Geoserver(geoserver_url, username=username, password=password)

    @staticmethod
    def _as_list(value):
        """Normalize GeoServer's empty, single-item, and list responses."""
        if not value:
            return []
        return value if isinstance(value, list) else [value]

    def initialize_workspace(self, workspace):
        """Ensure the workspace exists in Geoserver."""
        self.geo.reset()

        response = self.geo.get_workspaces()
        workspaces = response.get("workspaces", {}) if isinstance(response, dict) else {}
        workspace_items = (
            workspaces.get("workspace", [])
            if isinstance(workspaces, dict)
            else []
        )
        workspace_names = {
            item.get("name")
            for item in self._as_list(workspace_items)
            if isinstance(item, dict) and item.get("name")
        }

        if workspace not in workspace_names:
            self.geo.create_workspace(workspace=workspace)

        return workspace

    def upload_tiff(self, images_path, layer_name, workspace):

            tiff_files = glob.glob(f'{images_path}/*.tiff') + glob.glob(f'{images_path}/*.tif')

            if not tiff_files:
                print("No TIFF files found in the directory.")
                return

            for tiff in tiff_files:
                file_name = os.path.basename(tiff)
                tiff = tiff.replace("\\", "/")  # Normalize Windows paths if applicable

                print(f"Uploading: {tiff} as layer: {layer_name}")

                # Upload to GeoServer (Overwrite if the layer exists)

                try:

                    # Get coverage stores from the target workspace. The library
                    # defaults to a workspace named "default", which may not exist.
                    response = self.geo.get_coveragestores(workspace=workspace)
                    stores = (
                        response.get("coverageStores", {})
                        if isinstance(response, dict)
                        else {}
                    )
                    store_items = (
                        stores.get("coverageStore", [])
                        if isinstance(stores, dict)
                        else []
                    )
                    store_names = {
                        item.get("name")
                        for item in self._as_list(store_items)
                        if isinstance(item, dict) and item.get("name")
                    }

                    if layer_name in store_names:
                        self.geo.delete_coveragestore(
                            coveragestore_name=layer_name,
                            workspace=workspace,
                        )
                        print(f"Successfully deleted {layer_name} from GeoServer.")

                    self.geo.create_coveragestore(
                        layer_name=layer_name,
                        path=tiff,
                        workspace=workspace,
                    )
                    print(f"Successfully created {layer_name} in GeoServer.")

                    print(f"Successfully uploaded {file_name} to GeoServer.")
                except Exception as e:
                    print(f"Failed to upload {file_name}: {e}")

    def uplod_style(self, images_path, layer_name, workspace):

        tiff_files = glob.glob(f'{images_path}/*.tiff') + glob.glob(f'{images_path}/*.tif')

        if not tiff_files:
            print("No TIFF files found in the directory.")
            return

        style_name = "style_1"

        for tiff in tiff_files:
            tiff = tiff.replace("\\", "/")

            try:
                # delete old style (safe overwrite replacement)
                try:
                    self.geo.delete_style(style_name, workspace=workspace)
                except:
                    pass

                # create style (NO overwrite param)
                self.geo.create_coveragestyle(
                    raster_path=tiff,
                    style_name=style_name,
                    workspace=workspace,
                    color_ramp='Blues'
                )

                # apply style
                self.geo.publish_style(
                    layer_name=layer_name,
                    style_name=style_name,
                    workspace=workspace
                )

                print("Style applied successfully")

            except Exception as e:
                print(f"Style failed: {e}")
