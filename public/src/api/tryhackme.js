import axios from 'axios';

export async function getTryhackmeContribution(username = 'revi1337') {
  // https://tryhackme.com/api/user/activity-events?username=revi1337
  return axios.get(`/activity-events?username=${username}`);
}
