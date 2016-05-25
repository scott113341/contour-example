import csjs from 'csjs-inject';

import routes from './routes.js';
import { getState, replaceState, hashChange } from './router.js';


export const styles = csjs`
  
  html, body, .root {
    height: 100%;
    margin: 0;
  }
  
`;


export const rootElement = document.createElement('div');
rootElement.className = styles.root.className;


export function initPage() {
  document.body.appendChild(rootElement);
  const { path, state } = getState();
  replaceState(routes, path, state);
  window.addEventListener('hashchange', () => hashChange(routes));
}
