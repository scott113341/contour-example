import L from 'leaflet';


const METADATA_KEY = '__metadata__';


const iconSize = [28, 28];
export const ICONS = {
  peak: L.icon({
    iconUrl: 'static/icons/peak.png',
    iconSize,
  }),
  camp: L.icon({
    iconUrl: 'static/icons/camp.png',
    iconSize,
  }),
  water: L.icon({
    iconUrl: 'static/icons/water.png',
    iconSize,
  }),
  trailhead: L.icon({
    iconUrl: 'static/icons2/halo-red_on_transparent.png',
    iconSize,
  }),
};


export const TILES = {
  openStreetMap: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  calTopo: 'http://s3-us-west-1.amazonaws.com/ctusfs/fstopo/{z}/{x}/{y}.png',
  calTopoRelief: 'http://s3-us-west-1.amazonaws.com/ctrelief/relief/{z}/{x}/{y}.png',
};


export function getConfig(featureCollection) {
  return featureCollection.features
    .filter(feature => feature.properties.name === METADATA_KEY)
    .map(feature => getFeatureProperties(feature));
}


export function getMapConfig(config) {
  return config.find(c => c.folder === METADATA_KEY);
}


export function getFeatureProperties(feature, ...parents) {
  const comments = feature.properties.comments.replace(/\\"/g, '"');
  return Object.assign(
    {},
    ...parents,
    feature.properties,
    comments ? JSON.parse(comments) : {}
  );
}


export function getIcon(name) {
  return ICONS[name] || new L.Icon.Default();
}


export function filterFeaturesOfType(featureType) {
  return function(feature) {
    return feature.geometry.type === featureType && feature.properties.name !== METADATA_KEY;
  };
}
