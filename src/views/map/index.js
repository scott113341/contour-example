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

  const map = L.map(mapElement);
  map.contour = {
    onMarkerClick,
  };

  drawMap(map);

  const graph = buildGraph();
  console.log(graph);
  drawGraph(graph, map);
}


function drawMap(map) {
  const config = getMapConfig(data);
  // console.log(config);

  map.setView([40.96, -122.93], 12);
  L.tileLayer(TILES.calTopo, { maxZoom: 16 }).addTo(map);
  L.tileLayer(TILES.calTopoRelief, { maxZoom: 16, opacity: 0.25 }).addTo(map);

  const pointFeatures = data.features.filter(filterFeaturesOfType('Point'));
  pointFeatures.forEach(pointFeature => addPointToMap(pointFeature, map, config));

  const lineFeatures = data.features.filter(filterFeaturesOfType('LineString'));
  lineFeatures.forEach(lf => addLineToMap(lf, map, config));
}

function drawGraph(graph, map) {
  const config = getMapConfig(data);

  Object.keys(graph).forEach(key => {
    const node = graph[key];
    const feature = {
      properties: {
        name: key,
        comments: '',
      },
      geometry: { coordinates: node.coordinates },
    };
    // console.log(feature);
    addPointToMap(feature, map, config);
  });
}







var places = [];
function onMarkerClick(e) {
  places.push(e);
  if (places.length !== 2) return;

  console.log('yeeeee');
  console.log(places);
  console.log(`Routing ${places[0].target.options.title} to ${places[1].target.options.title}`);

  console.log(places[0].target.swag);
  console.log(data.features.indexOf(places[0].target.swag));
}






function buildGraph() {
  console.log(data);
  const graph = {};
  const geoCache = makeGeoCache(data);
  console.log(geoCache);

  // create graph nodes
  Object.keys(geoCache).forEach(key => {
    const features = geoCache[key];
    if (features.length > 1) {
      const node = {
        features,
        edges: [],
        coordinates: key.split(',').map(c => parseFloat(c)),
      };
      graph[key] = node;
    }
  });


  // add edges to nodes
  Object.keys(graph).forEach(key => {
    const node = graph[key];

    // find edges for each LineString feature from this node
    node.features
      .filter(filterFeaturesOfType('LineString'))
      .forEach(lf => {
        var started = false;
        var done = false;
        lf.geometry.coordinates.forEach((c, i) => {
          if (done) return;

          // start if current coordinate matches node's coordinate
          const thisKey = coordinateString(c);
          if (key === thisKey) {
            started = true;
            return;
          }
          if (!started) return;

          if (graph[thisKey]) {
            done = true;
            node.edges.push({
              to: graph[thisKey],
              weight: i,
            });
            graph[thisKey].edges.push({
              to: node,
              weight: i,
            });
          }
        });
      });
  });

  Object.keys(graph).forEach(key => {
    const node = graph[key];
    console.log(`Node at ${key} ${thingsAtNode(node)} has edges: ${node.edges.map(e => `${thingsAtNode(e.to)}(${e.weight})`)}`);
  });

  return graph;
}


function coordinateString(coordinates) {
  return coordinates.join(',');
}


function makeGeoCache(data) {
  const cache = {};
  function addToCache(object, coordinates) {
    const key = coordinateString(coordinates);
    if (cache[key]) {
      if (cache[key].includes(object)) return;
      cache[key].push(object);
    }
    else cache[key] = [object];
  }

  // add point features
  const pointFeatures = data.features.filter(filterFeaturesOfType('Point'));
  pointFeatures.forEach(pf => addToCache(pf, pf.geometry.coordinates));

  // add line features
  const lineFeatures = data.features.filter(filterFeaturesOfType('LineString'));
  lineFeatures.forEach(lf => {
    lf.geometry.coordinates.forEach(c => addToCache(lf, c));
  });

  return cache;
}


function thingsAtNode(node) {
  return '[' + node.features.map(f => f.properties.name).join(', ') + ']';
}
