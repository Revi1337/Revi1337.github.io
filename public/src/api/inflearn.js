import axios from 'axios';

// axios.interceptors.request.use(config => {
//   console.log('Request:', config.method, config.url, config.headers);
//   return config;
// });

// curl "https://account.inflearn.com/api/v2/dashboard/annual-learning?year=2023" -H "cookie: connect.sid=${COOKIE}"
export async function getInflearnContribution(year = 2023) {
  return axios.get(`/annual-learning?year=${year}`, {
    withCredentials: true
  });
}
