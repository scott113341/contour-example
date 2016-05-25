#!/usr/bin/env node

const fetch = require('node-fetch');
const fs = require('fs');
const geoJsonPrecision = require('geojson-precision');
const path = require('path');
const toGeoJson = require('caltopo-to-geojson').default;


const args = process.argv.slice(2);
const calTopoMapId = args[0] || 'VQ0L';

Promise.resolve()
  .then(() => fetch(`http://caltopo.com/m/${calTopoMapId}`))
  .then(res => res.text())
  .then(body => {
    const regex = /org\.sarsoft\.preload = (.+);/;
    const calTopoData = JSON.parse(regex.exec(body)[1]);
    return toGeoJson(calTopoData);
  })
  .then(data => geoJsonPrecision(data, 5))
  .then(data => {
    const string = JSON.stringify(data);
    const filePath = path.join(__dirname, 'src', 'views', 'map', 'data.json');
    fs.writeFileSync(filePath, string);
  })
  .catch(err => {
    console.error(err.stack);
  });
