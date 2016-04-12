import L from 'leaflet';

import { getFeatureProperties, getIcon } from '../../config.js';


export function addPointToMap(pointFeature, map, config) {
  const props = getFeatureProps(pointFeature, config);
  const coordinates = pointFeature.geometry.coordinates.reverse();
  const markerConfig = {
    title: props.name,
    icon: getIcon(props.icon),
    riseOnHover: true,
  };
  const marker = L.marker(coordinates, markerConfig);

  if (props.popup !== false) marker.bindPopup(props.name);
  if (props.show !== false) marker.addTo(map);
  
  return marker;
}


export function addLineToMap(lineFeature, map, config) {
  const props = getFeatureProps(lineFeature, config);
  const coordinates = lineFeature.geometry.coordinates.map(c => c.reverse());
  const lineConfig = Object.assign(
    {},
    {
      title: props.name,
    },
    props.style
  );
  const line = L.polyline(coordinates, lineConfig);

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
