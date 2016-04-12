import fetch from 'node-fetch';
import toGeoJson from 'caltopo-to-geojson';


export default function getData(calTopoMapId) {
  return Promise.resolve()
    .then(() => fetch(`http://caltopo.com/m/${calTopoMapId}`))
    .then(res => res.text())
    .then(body => {
      console.log(body);
      const regex = /org\.sarsoft\.preload = (.+);/;
      const calTopoData = JSON.parse(regex.exec(body)[1]);
      console.log(calTopoData);
      const geoJsonData = toGeoJson(calTopoData);
      console.log(geoJsonData);
    })
    .catch(err => {
      console.log('erorrrrrrr');
      console.log(err);
    });
}
