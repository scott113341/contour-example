export function pushState(routes, path, state) {
  // console.log('pushState', getHashUrl(path, state));
  history.pushState(null, '', getHashUrl(path, state));
  getHandler(routes, path)(state);
}


export function replaceState(routes, path, state) {
  // console.log('replaceState', getHashUrl(path, state));
  history.replaceState(null, '', getHashUrl(path, state));
  getHandler(routes, path)(state);
}


export function hashChange(routes) {
  const { path, state } = getState();
  // console.log('hashChange', getHashUrl(path, state));
  getHandler(routes, path)(state);
}


export function getHashUrl(path, state=false) {
  const stateString = state ? encodeURIComponent(JSON.stringify(state)) : '';
  return `/#/${path}/${stateString}`;
}


export function getHandler(routes, path) {
  return routes.find(route => route.path === path).handler;
}


export function getState() {
  const { hash } = window.location;
  if (hash.length <= 2) {
    return {
      path: 'index',
      state: '',
    };
  }

  const parts = hash.split('/').slice(1);
  try {
    const stateString = decodeURIComponent(parts.slice(-1)[0]);
    return {
      path: parts.slice(0, -1).join('/'),
      state: stateString ? JSON.parse(stateString) : '',
    };
  }
  catch (err) {
    return {
      path: parts.join('/'),
      state: '',
    };
  }
}
