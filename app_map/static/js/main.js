// Initialize the base map layer

const baseLayer = new ol.layer.Tile({
    source: new ol.source.OSM()
});

// Create a vector layer to hold polygons
const vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector()
});

// Create the map object
const map = new ol.Map({

    target: 'map',

    layers: [
        baseLayer,
        vectorLayer
    ],

    view: new ol.View({
        center: ol.proj.fromLonLat([0, 0]),
        zoom: 2
    })

});

// Add interaction to draw polygons
const draw = new ol.interaction.Draw({
    source: vectorLayer.getSource(),
    type: 'Polygon'
});
map.addInteraction(draw);

// Add interaction to modify polygons
const modify = new ol.interaction.Modify({
    source: vectorLayer.getSource()
});
map.addInteraction(modify);

// Variable to store the coordinates of the last polygon
let lastPolygonCoordinates = [];
let moistureLayer = null;

function showPredictionLayer(layerInfo) {
    if (moistureLayer) {
        map.removeLayer(moistureLayer);
    }

    moistureLayer = new ol.layer.Tile({
        source: new ol.source.TileWMS({
            url: 'http://127.0.0.1:8080/geoserver/demo/wms',
            params: {
                LAYERS: layerInfo || 'demo:soil_moisture_layer',
                STYLES: 'style_1',
                VERSION: '1.1.1',
                SRS: 'EPSG:3857',
                FORMAT: 'image/png',
                TRANSPARENT: true,
                TILED: true,
                _ts: Date.now()
            },
            serverType: 'geoserver',
            transition: 0
        })
    });

    map.addLayer(moistureLayer);

    const feature = vectorLayer.getSource().getFeatures()[0];
    if (feature) {
        map.getView().fit(feature.getGeometry().getExtent(), {
            padding: [40, 40, 40, 40],
            maxZoom: 16,
            duration: 500
        });
    }
}

// Function to calculate polygon area in square kilometers
function calculatePolygonArea(coordinates) {
    const polygon = new ol.geom.Polygon([coordinates]);
    const transformedPolygon = polygon.clone().transform('EPSG:4326', 'EPSG:3857');
    return ol.sphere.getArea(transformedPolygon) / 1e6;
}

// Function to style the polygon based on area
function getPolygonStyle(area) {
    // If area is larger than 1000 km², make the polygon red
    // const fillColor = area > 1000 ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 255, 0, 0.5)';
    const strokeColor = area > 1000 ? 'rgba(255, 0, 0, 1)' : 'rgba(0, 255, 0, 1)';
    return new ol.style.Style({
        // fill: new ol.style.Fill({
        //     color: fillColor
        // }),
        stroke: new ol.style.Stroke({
            color: strokeColor,
            width: 3
        })
    });
}

// Draw end event to handle polygon drawing
draw.on('drawend', function (event) {
    // Clear existing polygons to allow only one
    vectorLayer.getSource().clear();

    const feature = event.feature;
    vectorLayer.getSource().addFeature(feature);

    const geometry = feature.getGeometry();
    lastPolygonCoordinates = geometry.getCoordinates()[0].map(coord => {
        return ol.proj.toLonLat(coord);
    });

    const polygonArea = calculatePolygonArea(lastPolygonCoordinates);
    const style = getPolygonStyle(polygonArea);
    feature.setStyle(style);

    // Calculate the centroid of the polygon
    const centroid = geometry.getInteriorPoint().getCoordinates();
    const center = ol.proj.toLonLat(centroid);

    // Set the map view to center on the centroid of the polygon
    // map.getView().setCenter(center);
});

// Event listener for modifying polygons
modify.on('modifyend', function (event) {
    // Get modified coordinates
    const modifiedFeature = event.features.getArray()[0];
    const geometry = modifiedFeature.getGeometry();
    lastPolygonCoordinates = geometry.getCoordinates()[0].map(coord => {
        return ol.proj.toLonLat(coord);
    });

    const polygonArea = calculatePolygonArea(lastPolygonCoordinates);
    const style = getPolygonStyle(polygonArea);
    modifiedFeature.setStyle(style);
});


// Save button functionality
document.getElementById('saveBtn').onclick = function() {
    const dateInput = document.getElementById('dateInput').value;

    if (!lastPolygonCoordinates.length) {
        alert("Please draw a polygon first.");
        return;
    }

    if (!dateInput) {
        alert("Please select a date.");
        return;
    }

    const polygonArea = calculatePolygonArea(lastPolygonCoordinates);
    if (polygonArea > 1000) {
        alert("The polygon is too large (over 1000 km²). Please draw a smaller polygon.");
        return;
    }

    const csrfToken = document.getElementById('csrfToken').value;

    const data = {
        polygon: lastPolygonCoordinates,
        date: dateInput
    };

    fetch('/save-polygon/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to save polygon.");
        }
        return response.json();
    })
    .then(result => {
        alert(result.message || 'Polygon saved successfully!');
        showPredictionLayer(result.layer_info);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving polygon!');
    });
};
