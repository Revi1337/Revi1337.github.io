import { apiServer } from './api';

export function fetchGitContributeInfo() {
  return apiServer.get('/graphql');
}

export function fetchHackTheBoxContributeInfo() {
  return apiServer.get('/api/v4/profile/activity/1002993');
}

export function fetchTryHackMeContributeInfo() {
  return apiServer.get('/api/user/activity-events?username=revi1337');
}

export function fetchInflearnContributeInfo(year = 2023) {
  return apiServer.get(`/api/v2/dashboard/annual-learning?year=${year}`);
}
