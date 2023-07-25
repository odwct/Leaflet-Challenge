// Create the map
let map = L.map('map').setView([0,0], 2);

// Add different base layers to choose from
let streetMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let stamenTerrainLayer = L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, Tiles &copy; <a href="http://maps.stamen.com">Stamen</a>'
});

// Add the base map layers to the map with layer controls
let baseMaps = {
  'Street Map': streetMapLayer,
  'Terrain': stamenTerrainLayer
};

// Add the tile layer with street map as the default
streetMapLayer.addTo(map);

// Function to create earthquake markers and popups
function createEarthquakeMarkers(data) {
    let earthquakes = data.features;

      // Loop through the earthquake data
    earthquakes.forEach(earthquake => {
        let magnitude = earthquake.properties.mag;
        let depth = earthquake.geometry.coordinates[2];
        let latitude = earthquake.geometry.coordinates[1];
        let longitude = earthquake.geometry.coordinates[0];

    // Create a circle marker with size and color based on magnitude and depth
    let marker = L.circleMarker([latitude, longitude], {
        radius: magnitude * 3, // Adjust the multiplier as needed for appropriate marker size
        fillColor: getColor(depth),
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
  
      // Create a popup with additional information about the earthquake
      let popupContent = `<b>Magnitude:</b> ${magnitude}<br><b>Depth:</b> ${depth} km`;
      marker.bindPopup(popupContent);
  
      // Add the marker to the map
      marker.addTo(map);
    });
}

// Function to determine the color based on the depth
function getColor(depth) {

    return depth > 300 ? '#1a9850' :
           depth > 200 ? '#91cf60' :
           depth > 100 ? '#d9ef8b' :
           depth > 50 ? '#fee08b' :
           depth > 10 ? '#fc8d59' :
                        '#d73027';

}

// Fetch earthquake data from USGS GeoJSON feed
let url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
fetch(url)
  .then(response => response.json())
  .then(data => {
    // Fetch tectonic plates data from the provided URL
    let tectonicPlatesURL = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';
    fetch(tectonicPlatesURL)
      .then(response => response.json())
      .then(tectonicData => {
        // Create a GeoJSON layer for the tectonic plates data
        let tectonicPlatesLayer = L.geoJSON(tectonicData, {
          style: {
            color: '#ff7800',
            weight: 2
          }
        });

        // Create LayerGroups for earthquake markers and tectonic plates
        let earthquakesLayer = L.layerGroup(createEarthquakeMarkers(data));
        let tectonicPlatesLayerGroup = L.layerGroup();

        // Add tectonic plates layer to its LayerGroup
        tectonicPlatesLayerGroup.addLayer(tectonicPlatesLayer);

        // Add LayerGroups to the map
        earthquakesLayer.addTo(map);
        tectonicPlatesLayerGroup.addTo(map);

        // Add layer controls to toggle the display of earthquake markers and tectonic plates layer
        let overlayMaps = {
          'Earthquakes': earthquakesLayer,
          'Tectonic Plates': tectonicPlatesLayerGroup
        };

        L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);
      })
      .catch(error => {
        console.error('Error fetching tectonic plates data:', error);
      });
  })
  .catch(error => {
    console.error('Error fetching earthquake data:', error);
  });
