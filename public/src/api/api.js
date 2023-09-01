import axios from 'axios';

function create(baseURL, options) {
  const instance = axios.create(Object.assign({ baseURL }, options));
  return instance;
}

export const apiServer = create('https://candid-sorbet-07dfa9.netlify.app');
