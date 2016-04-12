import fetch from 'node-fetch';
import toGeoJson from 'caltopo-to-geojson';
import geoJsonPrecision from 'geojson-precision';


const [calTopoMapId] = process.argv.slice(2);


Promise.resolve()
  .then(() => fetch(`http://caltopo.com/m/${calTopoMapId}`))
  .then(res => res.text())
  .then(body => {
    const regex = /org\.sarsoft\.preload = (.+);/;
    const calTopoData = JSON.parse(regex.exec(body)[1]);
    const geoJsonData1 = toGeoJson(calTopoData);
    const geoJsonData2 = geoJsonPrecision(geoJsonData1, 5);
    console.log(JSON.stringify(geoJsonData2));
  });
