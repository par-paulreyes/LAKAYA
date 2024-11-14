var map = L.map('map').setView([12.8797, 121.7740], 7); // 7 - zoom of the map

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var locations = [
  { name: 'Manila', lat: 14.5995, lon: 120.9842 }, // list of market for investment
  { name: 'Cebu', lat: 10.3157, lon: 123.8854 },
  { name: 'Davao', lat: 7.1907, lon: 125.4553 },
  { name: 'Iloilo', lat: 10.7214, lon: 122.5621 },
  { name: 'Zamboanga', lat: 6.9281, lon: 122.0781 },
  { name: 'Batangas', lat: 13.7563, lon: 121.0583 }, 
  { name: 'Ilocos Norte', lat: 18.1970, lon: 120.5934 },
  { name: 'Puerto Prinsesa', lat: 9.7458, lon: 118.7535 }
];

function haversine(lat1, lon1, lat2, lon2) { // formula for getting the latitude and longitude
  var R = 6371;
  var φ1 = lat1 * Math.PI / 180;
  var φ2 = lat2 * Math.PI / 180;
  var Δφ = (lat2 - lat1) * Math.PI / 180;
  var Δλ = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateDistances(startLocation) {
  var distances = {};
  locations.forEach(function (loc) {
    var distance = haversine(startLocation.lat, startLocation.lon, loc.lat, loc.lon);
    distances[loc.name] = distance;
  });
  return distances;
}

var startLocation = locations[0]; // start location

var distancesFromStart = calculateDistances(startLocation);

L.marker([startLocation.lat, startLocation.lon])
  .addTo(map)
  .bindPopup('<b>' + startLocation.name + ' (start)</b>');

console.log("Distances from " + startLocation.name + ":");
for (var loc in distancesFromStart) {
  console.log(loc + ": " + distancesFromStart[loc].toFixed(2) + " km");
}

var shortestDistance = Infinity;
var shortestLocation = null;

locations.forEach(function (location) { // mapping the location
  if (location.name !== startLocation.name) {
    var distance = distancesFromStart[location.name];
    if (distance < shortestDistance) {
      shortestDistance = distance;
      shortestLocation = location;
    }

    L.polyline([ [startLocation.lat, startLocation.lon], [location.lat, location.lon] ], { color: 'blue' }).addTo(map);

    var marker = L.marker([location.lat, location.lon]).addTo(map);
    marker.bindPopup('<b>' + location.name + '</b><br>Distance from ' + startLocation.name + ': ' + distance.toFixed(2) + ' km');
  }
});

if (shortestLocation) { // shortest location
  console.log("Shortest distance is to " + shortestLocation.name + ": " + shortestDistance.toFixed(2) + " km");

  L.marker([shortestLocation.lat, shortestLocation.lon])
    .addTo(map)
    .bindPopup('<b>' + shortestLocation.name + ' (Shortest)</b><br>Distance from ' + startLocation.name + ': ' + shortestDistance.toFixed(2) + ' km');

  L.polyline([
    [startLocation.lat, startLocation.lon],
    [shortestLocation.lat, shortestLocation.lon]
  ], { color: 'red' }).addTo(map);
}

document.getElementById('start-location').addEventListener('change', function (event) { // option for start location
  startLocation = locations.find(loc => loc.name === event.target.value);
  if (startLocation) {
    updateMapWithNewStartLocation(startLocation);
  }
});

map.on('click', function(e) {
  var clickedLat = e.latlng.lat;
  var clickedLon = e.latlng.lng;
  var closestLocation = locations.reduce(function(prev, curr) {
    var prevDistance = haversine(clickedLat, clickedLon, prev.lat, prev.lon);
    var currDistance = haversine(clickedLat, clickedLon, curr.lat, curr.lon);
    return (prevDistance < currDistance) ? prev : curr;
  });

  startLocation = closestLocation;
  updateMapWithNewStartLocation(startLocation);
});

function updateMapWithNewStartLocation(startLocation) {
  map.eachLayer(function(layer) {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });

  var distancesFromStart = calculateDistances(startLocation);

  L.marker([startLocation.lat, startLocation.lon])
    .addTo(map)
    .bindPopup('<b>' + startLocation.name + ' (start)</b>');

  console.log("Distances from " + startLocation.name + ":");
  for (var loc in distancesFromStart) {
    console.log(loc + ": " + distancesFromStart[loc].toFixed(2) + " km");
  }

  var shortestDistance = Infinity;
  var shortestLocation = null;

  locations.forEach(function (location) {
    if (location.name !== startLocation.name) {
      var distance = distancesFromStart[location.name];
      if (distance < shortestDistance) {
        shortestDistance = distance;
        shortestLocation = location;
      }

      L.polyline([ [startLocation.lat, startLocation.lon], [location.lat, location.lon] ], { color: 'blue' }).addTo(map);

      var marker = L.marker([location.lat, location.lon]).addTo(map);
      marker.bindPopup('<b>' + location.name + '</b><br>Distance from ' + startLocation.name + ': ' + distance.toFixed(2) + ' km');
    }
  });

  if (shortestLocation) {
    console.log("Shortest distance is to " + shortestLocation.name + ": " + shortestDistance.toFixed(2) + " km");

    L.marker([shortestLocation.lat, shortestLocation.lon])
      .addTo(map)
      .bindPopup('<b>' + shortestLocation.name + ' (Shortest)</b><br>Distance from ' + startLocation.name + ': ' + shortestDistance.toFixed(2) + ' km');

    L.polyline([
      [startLocation.lat, startLocation.lon],
      [shortestLocation.lat, shortestLocation.lon]
    ], { color: 'red' }).addTo(map); // red color for shortest location
  }
}
