import index from './views/index/index.js';
import map from './views/map/index.js';


const routes = [
  {
    path: 'index',
    handler: index,
  },
  {
    path: 'map',
    handler: map,
  },
];

export default routes;
