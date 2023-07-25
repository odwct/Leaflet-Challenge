// Create map
let map = L.map('map').setView([0,0], 2);

// Add a tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

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
    // Process the earthquake data and create markers on the map
    createEarthquakeMarkers(data);
  })
  .catch(error => {
    console.error('Error fetching earthquake data:', error);
  });

  // Create a custom legend control
let legend = L.control({ position: 'bottomright' });

// Function to update the legend content
legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    let grades = [0, 10, 50, 100, 200, 300];
    let colors = ['#d73027', '#fc8d59', '#fee08b', '#d9ef8b', '#91cf60', '#1a9850'];

    // Loop through the depth ranges and generate the legend content
    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + (grades[i + 1] - 1) + ' km<br>' : '+ km');
    }

    return div;
};

// Add the legend to the map
legend.addTo(map);