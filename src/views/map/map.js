import L from 'leaflet';

import { getFeatureProperties, getIcon } from '../../config.js';


export function addPointToMap(pointFeature, map, config) {
  const props = getFeatureProps(pointFeature, config);
  const coordinates = reverse(pointFeature.geometry.coordinates);
  const markerConfig = {
    title: props.name,
    icon: getIcon(props.icon),
    riseOnHover: true,
  };
  const marker = L.marker(coordinates, markerConfig);
  marker.feature = pointFeature;

  if (props.popup !== false) marker.bindPopup(props.name);
  if (props.show !== false) marker.addTo(map);
  if (props.click) marker.on('click', props.click);

  return marker;
}


export function addLineToMap(lineFeature, map, config) {
  const props = getFeatureProps(lineFeature, config);
  const coordinates = lineFeature.geometry.coordinates.map(c => reverse(c));
  const lineConfig = {
    title: props.name,
    ...props.style,
  };
  const line = L.polyline(coordinates, lineConfig);
  line.feature = lineFeature;

  if (props.popup !== false) line.bindPopup(props.name);
  if (props.show !== false) line.addTo(map);
  if (props.hover === true) {
    line
      .on('mouseover', () => line.setStyle(props.hoverStyle))
      .on('mouseout', () => line.setStyle(props.style));
  }

  return line;
}


function getFeatureProps(feature, config) {
  const folderId = feature.properties.folderId;
  const defaultProperties = config.find(c => c.folderId === folderId);
  return getFeatureProperties(feature, defaultProperties);
}


function reverse(array) {
  var temp = [];
  var length = array.length;
  for (var i = (length - 1); i !== -1; i--) {
    temp.push(array[i]);
  }
  return temp;
}
