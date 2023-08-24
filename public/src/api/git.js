// Reference  https://code-maven.com/slides/python/github-graphql-contribution-counts
import axios from 'axios';

const gitApiKey = process.env.GIT_API_KEY;

export function getRecentGitContribution() {
  const query = `
  query($userName:String!) {
    user(login: $userName){
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
  `;
  const variables = `
  {
    "userName": "Revi1337"
  }
  `;
  const body = {
    query,
    variables: variables
  };
  return axios.post('https://api.github.com/graphql', body, {
    headers: {
      Authorization: `Bearer ${gitApiKey}`
    }
  });
}

export async function getGitContributionBySpecifiedDate(username, from, to) {
  const query = `
  query($username:String!, $from:DateTime, $to:DateTime) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              weekday
              date
            }
          }
        }
      }
    }
  }
  `;
  const variables = `
  {
    "username": ${username},
    "from": ${from},
    "to": ${to}
  }
  `;
  const body = {
    query,
    variables
  };

  return axios.post('https://api.github.com/graphql', body, {
    headers: {
      Authorization: `Bearer ${gitApiKey}`
    }
  });
}
