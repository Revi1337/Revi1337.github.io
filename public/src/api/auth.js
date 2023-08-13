import axios from 'axios';

export async function joinUser(jsonData) {
  return axios.post('/api/user/join', jsonData);
}

export async function userLogin(jsonData) {
  return axios.post('/api/auth/login', jsonData);
}
