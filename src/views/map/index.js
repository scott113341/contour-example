import L from 'leaflet';

import { rootElement } from '../../init.js';
import { getMapConfig, filterFeaturesOfType, TILES } from '../../config.js';

import data from './data.json';
import { addPointToMap, addLineToMap } from './map.js';


const mapElement = document.createElement('div');
mapElement.style.height = '100%';

const leafletCssElement = document.createElement('link');
leafletCssElement.rel = 'stylesheet';
leafletCssElement.href = 'static/leaflet/leaflet.css';


export default function(state) {
  L.Icon.Default.imagePath = 'static/leaflet/images/';

  rootElement.innerHTML = '';
  rootElement.appendChild(leafletCssElement);
  rootElement.appendChild(mapElement);

  drawMap();
}


function drawMap() {
  const config = getMapConfig(data);
  console.log(config);

  const map = L.map(mapElement);
  map.setView([40.96, -122.93], 12);
  L.tileLayer(TILES.calTopo, { maxZoom: 16 }).addTo(map);
  L.tileLayer(TILES.calTopoRelief, { maxZoom: 16, opacity: 0.25 }).addTo(map);

  const pointFeatures = data.features.filter(filterFeaturesOfType('Point'));
  pointFeatures.forEach(pointFeature => addPointToMap(pointFeature, map, config));

  const lineFeatures = data.features.filter(filterFeaturesOfType('LineString'));
  lineFeatures.forEach(lf => addLineToMap(lf, map, config));
}
