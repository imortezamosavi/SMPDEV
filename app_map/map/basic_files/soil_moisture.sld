<?xml version="1.0" encoding="UTF-8"?>
<sld:StyledLayerDescriptor
    version="1.0.0"
    xmlns="http://www.opengis.net/sld"
    xmlns:sld="http://www.opengis.net/sld"
    xmlns:ogc="http://www.opengis.net/ogc">

    <sld:NamedLayer>
        <sld:Name>soil_moisture</sld:Name>

        <sld:UserStyle>
            <sld:Title>Soil Moisture</sld:Title>

            <sld:FeatureTypeStyle>

                <sld:Rule>
                    <RasterSymbolizer>

                        <ColorMap type="intervals">

                            <ColorMapEntry color="#8B0000" quantity="0.0" label="0.0 - 0.2"/>
                            <ColorMapEntry color="#FF4500" quantity="0.2" label="0.2 - 0.4"/>
                            <ColorMapEntry color="#FFD700" quantity="0.4" label="0.4 - 0.6"/>
                            <ColorMapEntry color="#7CFC00" quantity="0.6" label="0.6 - 0.8"/>
                            <ColorMapEntry color="#006400" quantity="0.8" label="0.8 - 1.0"/>

                        </ColorMap>

                    </RasterSymbolizer>
                </sld:Rule>

            </sld:FeatureTypeStyle>

        </sld:UserStyle>

    </sld:NamedLayer>

</sld:StyledLayerDescriptor>