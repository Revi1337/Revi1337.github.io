import axios from 'axios';

// curl -L "https://www.hackthebox.com/api/v4/user/profile/basic/1002993"
export async function getHackTheBoxContribution() {
  return axios.get(`/1002993`);
}
