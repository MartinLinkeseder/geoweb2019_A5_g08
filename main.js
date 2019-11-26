import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Vector from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import Stroke from 'ol/style/Stroke';
import * as olProj from 'ol/proj';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import sync from 'ol-hashed';
import {toLonLat} from 'ol/proj';
import Overlay from 'ol/Overlay';
import VectorSource from 'ol/source/Vector'; //hinzu
import Control from 'ol/control/Control'; //hinzu
import {fromLonLat} from 'ol/proj'; //hinzu


const contr = document.getElementById('control')

const map = new Map({
    target: 'map',
    view: new View({
        center: olProj.fromLonLat([15.756522, 48.258624]),
        zoom: 8.7
    })
});
// map.addLayer(new TileLayer({
//     source: new Stamen({
//         layers: 'watercolor'
//     })
// }))
// ;
sync(map);

const layer1 = new VectorLayer({
    source: new Vector({
        url: 'https://student.ifip.tuwien.ac.at/geoweb/2019/g08/postgis_geojson.php',
        format: new GeoJSON()
    })
});
layer1.setStyle(function (feature) {
    return new Style({
        text: new Text({
            text: feature.get('name'),
            font: 'Bold 8pt Verdana',
            stroke: new Stroke({
                color: 'white',
                width: 3
            })
        })
    });
});

const layer2 = new VectorLayer({
    source: new Vector({ 
        url: 'data/bezirksgrenzennoe.json',
        format: new GeoJSON()
    })
});


const layer3 = new VectorLayer({
    source: new Vector({
        url: 'https://student.ifip.tuwien.ac.at/geoweb/2019/g08/postgis_geojson.php',
        format: new GeoJSON()
    })
});

// erstellen einen LAyer in der Map der die GPS Location beinhaltetf
const source = new VectorSource(); 
const layer4 = new VectorLayer({ 
  source: source 
});

import Feature from 'ol/Feature';
import {circular} from 'ol/geom/Polygon'; //wollen keinen Kreis
import Point from 'ol/geom/Point';

//Code um GPS Koordinaten zu bekommen
navigator.geolocation.watchPosition(function(pos) {
  const coords = [pos.coords.longitude, pos.coords.latitude];
  const accuracy = circular(coords, pos.coords.accuracy);
  source.clear(true);
  source.addFeatures([
    new Feature(accuracy.transform('EPSG:4326', map.getView().getProjection())),
    new Feature(new Point(fromLonLat(coords)))
  ]);
}, function(error) {
  alert(`ERROR: ${error.message}`);
}, {
  enableHighAccuracy: true
});
//creates markup for control
const locate = document.createElement('div');
locate.className = 'ol-control ol-unselectable locate';
locate.innerHTML = '<button title="Locate me">◎</button>';
locate.addEventListener('click', function() {
  if (!source.isEmpty()) {
    map.getView().fit(source.getExtent(), {
      maxZoom: 18,
      duration: 500
    });
  }
});
map.addControl(new Control({
  element: locate
}));

//ende


const searchResultSource = new Vector();
const searchResultLayer = new VectorLayer({
  source: searchResultSource
});

searchResultLayer.setStyle(new Style({
  image: new Circle({
    fill: new Fill({
      color: 'rgba(255,255,255,0.4)'
    }),
    stroke: new Stroke({
      color: '#3399CC',
      width: 1.25
    }),
    radius: 15
  })
}));
//map.addLayer(searchResultLayer);

var element = document.getElementById('search');  
element.addEventListener('keydown', listenerFunction);

function listenerFunction(event) {
  console.log(event);
  console.log(event.keyCode);
  if (event.keyCode === 13) {
    
    const xhr = new XMLHttpRequest;
    xhr.open('GET', 'https://photon.komoot.de/api/?q=' + element.value);
    xhr.onload = function() {
      const json = JSON.parse(xhr.responseText);
      const geoJsonReader = new GeoJSON({
        featureProjection: 'EPSG:3857'
      });  
      searchResultSource.clear(); 
      const features = geoJsonReader.readFeatures(json);
      console.log(features);
      searchResultSource.addFeatures(features);
    };
    xhr.send();


  }
}



// Satelliten-Layer einrichten
const satLayer = new TileLayer({
    source: new XYZ({
    attributions: ['Powered by Esri', 'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'],
    attributionsCollapsible: false,
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 30
  })
});

const baseLayer = new TileLayer({
  source: new OSM()
});

//Base Layer von OSM hinzufügen
map.addLayer(baseLayer);
map.addLayer(layer2);
map.addLayer(layer3);
map.addLayer(layer1);
map.addLayer(searchResultLayer);
map.addLayer(layer4);

// Get the base Sat-Button
const sat = document.getElementById('sat');
sat.addEventListener('click', function(event) {
  contr.style.color = 'ffffff';
  //Anderen Layer entfernen
  map.removeLayer(baseLayer);
  map.removeLayer(layer2);
  map.removeLayer(layer3);
  map.removeLayer(layer1);
  map.removeLayer(searchResultLayer);
  map.removeLayer(layer4);
  //Satelliten Layer hinzufügen
  map.addLayer(satLayer);
  map.addLayer(layer2);
  map.addLayer(layer3);
  map.addLayer(layer1);
  map.addLayer(searchResultLayer);
  map.addLayer(layer4);
});

// Get the base Base-Button
const base = document.getElementById('base');
base.addEventListener('click', function(event) {
  //Anderen Layer entfernen
  map.removeLayer(satLayer);
  map.removeLayer(layer2);
  map.removeLayer(layer3);
  map.removeLayer(layer1);
  map.removeLayer(searchResultLayer);
  map.removeLayer(layer4);
  //Satelliten Layer hinzufügen
  map.addLayer(baseLayer);
  map.addLayer(layer2);
  map.addLayer(layer3);
  map.addLayer(layer1);
  map.addLayer(searchResultLayer);
  map.addLayer(layer4);
  
});

 const overlay = new Overlay({
  element: document.getElementById('popup-container'),
  positioning: 'bottom-center',
  offset: [0, -10],
  autoPan: true
 });
 map.addOverlay(overlay);
 overlay.getElement().addEventListener('click', function() {
  overlay.setPosition();
 });

// define what happens when user clicks on the map
map.on('singleclick', function(e) {
  let markup = ''; // the variable "markup" is html code, as string
  map.forEachFeatureAtPixel(e.pixel, function(feature) {
  const properties = feature.getProperties();
  markup += markup + '<hr><table>';
  for (const property in properties) {
  if (property != 'geometry') {
  markup += '<tr><th>' + property + '</th><td>' + properties[property] + '</td></tr>';
  }
  }
  markup += '</table>';
  }, {
  layerFilter: (l) => l === layer3
  });
  if (markup) { // if any table was created (= feature already existed at clicked point)
  document.getElementById('popup-content').innerHTML = markup;
  overlay.setPosition(e.coordinate);
} 
  else { // if no feature existed on clicked point
  overlay.setPosition();
  const pos = toLonLat(e.coordinate);
  window.location.href =
  'https://student.ifip.tuwien.ac.at/geoweb/2019/g08/feedback.php?pos=' + pos.join(' ');
  }
});

/**
* function to calculate statistics for districts
* sets the property 'FEEDBACKS' for each district to the number of feedbacks inside
*/
function calculateStatistics() {
  const feedbacks = layer3.getSource().getFeatures();
  const bezirke = layer2.getSource().getFeatures();
  if (feedbacks.length > 0 && bezirke.length > 0) {
  for (let i = 0, ii = feedbacks.length; i < ii; ++i) {
  const feedback = feedbacks[i];
  for (let j = 0, jj = bezirke.length; j < jj; ++j) {
  const bezirk = bezirke[j];
  let count = bezirk.get('FEEDBACKS') || 0;
  const feedbackGeom = feedback.getGeometry();
  if (feedbackGeom &&
 bezirk.getGeometry().intersectsCoordinate(feedbackGeom.getCoordinates())) {
  ++count;
}
bezirk.set('FEEDBACKS', count);
}
}
}
}
layer2.getSource().once('change', calculateStatistics);
layer3.getSource().once('change', calculateStatistics);

// set the style of the district according to the number of feedbacks
layer2.setStyle(function(feature) {
  let fillColor;
  const feedbackCount = feature.get('FEEDBACKS');
  if (feedbackCount <= 1) {
  fillColor = 'rgba(255, 247, 188, 0.5';
  } else if (feedbackCount <= 5) {
  fillColor = 'rgba(254, 196, 79, 0.5)';
  } else {
  fillColor = 'rgba(217, 95, 14, 0.5)';
  }
  return new Style({
  fill: new Fill({
  color: fillColor
  }),
  stroke: new Stroke({
  color: 'rgba(4, 4, 4, 1)',
  width: 1
  })
  });
 });