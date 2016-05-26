#!/usr/bin/env node

const fetch = require('node-fetch');
const fs = require('fs');
const geoJsonPrecision = require('geojson-precision');
const path = require('path');
const toGeoJson = require('caltopo-to-geojson').default;


const args = process.argv.slice(2);
const calTopoMapId = args[0] || 'VQ0L';
const precision = 5;

Promise.resolve()
  .then(() => fetch(`http://caltopo.com/m/${calTopoMapId}`))
  .then(res => res.text())
  .then(body => {
    const regex = /org\.sarsoft\.preload = (.+);/;
    const calTopoData = JSON.parse(regex.exec(body)[1]);
    return toGeoJson(calTopoData);
  })
  .then(data => geoJsonPrecision(data, precision))
  .then(data => {
    data.features
      .filter(filterFeaturesOfType('LineString'))
      .forEach(lf => {
        lf.geometry.coordinates = lf.geometry.coordinates
          .map(coordinateString)
          .filter((c, i, a) => a.indexOf(c) === i)
          .map(cs => cs.split(',').map(c => parseFloat(c)));
      });
    return data;
  })
  .then(data => geoJsonPrecision(data, precision))
  .then(data => {
    const string = JSON.stringify(data);
    const filePath = path.join(__dirname, 'src', 'views', 'map', 'data.json');
    fs.writeFileSync(filePath, string);
  })
  .catch(err => {
    console.error(err.stack);
  });


function filterFeaturesOfType(featureType) {
  return function(feature) {
    return feature.geometry.type === featureType && feature.properties.name !== '__metadata__';
  };
}

function coordinateString(coordinates) {
  return coordinates.join(',');
}
