import axios from 'axios';

export function fetchGithubCommits(repository = 'R3VI1E37') {
  return axios.get(`https://api.github.com/repos/Revi1337/${repository}/commits`, {
    headers: {
      Authorization: 'This is Secret'
    }
  });
}

export function fetchTryHackMeTotalUsers() {
  return axios.get(`/api/data/tryhackme/users`);
}

export function fetchTryHackMeRank(username = 'revi1337') {
  return axios.get(`/api/data/tryhackme/user/${username}`);
}

export function fetchTryHackMeSkillSet() {
  return axios.get(`/api/data/tryhackme/user/skills`);
}

export function fetchTryHackMeBadges(username = 'revi1337') {
  return axios.get(`https://tryhackme.com/api/badges/get/${username}`);
}

export function fetchTryHackMeCompletedRooms(username = 'revi1337') {
  return axios.get(`https://tryhackme.com/api/all-completed-rooms?username=${username}&limit=10&page=1`);
}

export function fetchTryHackMeActivities(username = 'revi1337') {
  return axios.get(`https://tryhackme.com/api/user/activity-events?username=${username}`);
}
