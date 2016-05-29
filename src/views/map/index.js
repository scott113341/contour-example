import L from 'leaflet';

import { rootElement } from '../../init.js';
import { getConfig, getMapConfig, filterFeaturesOfType, TILES } from '../../config.js';

import geoJson from './data.json';
import { addPointToMap, addLineToMap } from './map.js';
import { buildGraph, findPath, coordinateString } from './graph.js';


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

  const map = L.map(mapElement);
  map.contour = {
    onMarkerClick,
  };

  drawMap(geoJson, map);

  const graph = buildGraph(geoJson);
  console.log(graph);
  drawGraph(geoJson, graph, map);
}


function drawMap(data, map) {
  const config = getConfig(data);
  const mapConfig = getMapConfig(config);

  map.setView(mapConfig.coordinates, mapConfig.zoom);
  L.tileLayer(TILES.calTopo, { maxZoom: 16 }).addTo(map);
  L.tileLayer(TILES.calTopoRelief, { maxZoom: 16, opacity: 0.25 }).addTo(map);

  const pointFeatures = data.features.filter(filterFeaturesOfType('Point'));
  pointFeatures.forEach(pointFeature => addPointToMap(pointFeature, map, config));

  const lineFeatures = data.features.filter(filterFeaturesOfType('LineString'));
  lineFeatures.forEach(lf => addLineToMap(lf, map, config));
}

function drawGraph(data, graph, map) {
  const config = getConfig(data);

  Object.keys(graph).forEach(key => {
    const node = graph[key];
    console.log(node);
    const feature = {
      properties: {
        name: key + thingsAtNode(node),
        comments: '',
      },
      geometry: { coordinates: node.coordinates },
    };
    const marker = addPointToMap(feature, map, config);

    marker.on('click', e => onMarkerClick(e, graph));
  });
}







var places = [];
function onMarkerClick(e, graph) {
  places.push(e);
  if (places.length !== 2) return;

  const from = coordinateString(places[0].target.feature.geometry.coordinates);
  const to = coordinateString(places[1].target.feature.geometry.coordinates);
  places = [];

  const path = findPath(from, to, graph);
  console.log(path);
  path.path.forEach(node => console.log(thingsAtNode(node)));
  console.log(path.distance);
}



function thingsAtNode(node) {
  return '[' + node.features.map(f => f.properties.name).join(', ') + ']';
}
