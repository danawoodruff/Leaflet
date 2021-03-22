// Store our API endpoint inside queryUrl
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(data => {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  // });

  function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
  }

  function createMap(earthquakes) {

    // Define satellite map and streetmap layers
    let satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: 'mapbox.satellite',
      // id: "mapbox/streets-v11",
      accessToken: API_KEY
    });

    let streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    let baseMaps = {
      "Satellite Map": satellitemap,
      "Street Map": streetmap
    };

    // Create overlay object to hold our overlay layer
    let overlayMaps = {
      Earthquakes: earthquakes
    };

    // Create our map, giving it the satellite map and earthquakes layers to display on load.
    // Center map on the center of the continental U.S.
    let myMap = L.map("map", {
      center: [
        39.50, -98.35
      ],
      zoom: 5,
      layers: [streetmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);


    //   let labels = ['0 - .5km', '.5 - 1km', '1 - 5km', '5 - 10km', '10 - 30km', 'Over 30km'];
    function getColor(d) {
      return d > 30 ? "#D61A46" : //red
        d > 10 ? "#FB9902" : //orange
          d > 5 ? "#FDED2A" : //yellow
            d > 1 ? "#559E54" : //green
              d > 0.5 ? "#1258DC" : //blue
                d > 0 ? "#FF00FF" : //fuschia
                  d > -100 ? "#800080" : //purple
                    "#800080"; //purple
    }

    // Set up the legend
    let legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      depth = [0, .5, 1, 5, 10, 30],
      title = ["Address"],
      labels = ['<strong>Earthquake Depth</strong>'];

      for (let i = 0; i < depth.length; i++) {
        // console.log(depth[i]);
        // console.log(getColor(depth[i]));
        div.innerHTML +=
          '<i class="circle" style="background: ' + getColor(depth[i]) + '"></i>' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+ ');
        // console.log(div.innerHTML);
      }
      return div
    };

    // Adding legend to the map
    legend.addTo(myMap);
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  // Assign marker size based on magnitude of quake
  function createFeatures(eqdata) {
    function onEachFeature(feature, layer) {
      layer.bindPopup('<h4>Location: ' + feature.properties.place + '</h4><h4>Date: ' + new Date(feature.properties.time) + '</h4><h4>Magnitude: ' + feature.properties.mag + '</h4><h4>USGS Event Page: <a href=' + feature.properties.url + " target='_blank'>Click here</a></h4>", { maxWidth: 400 })
    }

    const layerToMap = L.geoJSON(eqdata, {
      onEachFeature: onEachFeature,
      pointToLayer: function (feature, latlng) {
        // Marker radius dependent on magnitude of quake
        let radius = feature.properties.mag * 5;

        // Colors mimic USGS color scale
        // if (feature.properties.mag > 4) {
        if (feature.geometry.coordinates[2] > 30) {
          fillcolor = '#D61A46'; //red
        }
        else if (feature.geometry.coordinates[2] >= 10) {
          fillcolor = '#FB9902'; //orange
        }
        else if (feature.geometry.coordinates[2] >= 5) {
          fillcolor = '#FDED2A'; //yellow
        }
        else if (feature.geometry.coordinates[2] >= 1) {
          fillcolor = '#CBE432'; //green
        }
        else if (feature.geometry.coordinates[2] >= .5) {
          fillcolor = '#1258DC'; //blue
        }
        else if (feature.geometry.coordinates[2] >= 0) {
          fillcolor = '#FF00FF'; //fuschcia
        }
        else fillcolor = '#800080'; //purple

        return L.circleMarker(latlng, {
          radius: radius,
          color: 'black',
          fillColor: fillcolor,
          fillOpacity: .5,
          weight: .5
        });
      }
    });

    createMap(layerToMap);
  }
});