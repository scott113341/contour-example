import { filterFeaturesOfType } from '../../config.js';


export function findPath(fromKey, toKey, graph) {
  const from = graph[fromKey];
  const to = graph[toKey];

  var done = false;
  var current = from;
  var queue = Object.keys(graph).map(k => graph[k]);
  var distances = Object.assign({}, ...Object.keys(graph).map(k => ({ [k]: Infinity })));
  var previous = {};
  distances[fromKey] = 0;

  while (!done) {
    const current = queue
      .sort((a, b) => distances[a.key] - distances[b.key])[0];
    queue.splice(queue.indexOf(current), 1);
    const edges = current.edges;

    const unvisitedEdges = edges
      .filter(edge => queue.includes(edge.to))
      .sort((a, b) => a.weight - b.weight);

    unvisitedEdges.forEach(edge => {
      const newDistance = distances[current.key] + edge.weight;
      if (newDistance < distances[edge.to.key]) {
        distances[edge.to.key] = newDistance;
        previous[edge.to.key] = current.key;
        if (edge.to.key === toKey) done = true;
      }
    });

    if (!queue.length) done = true;
  }

  var lastKey = toKey;
  var path = [];
  while (lastKey) {
    const last = graph[lastKey];
    path.push(last);
    lastKey = previous[lastKey];
  }
  path.reverse();

  return {
    path,
    distance: distances[toKey],
  };
}


export function path(from, to, shortestPaths, graph) {

}


export function buildGraph(data) {
  const graph = {};
  const geoCache = makeGeoCache(data);

  // create graph nodes
  Object.keys(geoCache).forEach(key => {
    const features = geoCache[key];
    if (features.length > 1) {
      const node = {
        key,
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


export function coordinateString(coordinates) {
  return coordinates.join(',');
}


export function makeGeoCache(data) {
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
