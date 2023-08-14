import { github } from '.';

export async function getMarkDown(markDownPath) {
  return github.get(markDownPath);
}

export async function getSeed() {
  return github.get('/seed.json');
}

export async function getProcessedData(category) {
  const filteredData = [];
  getSeed()
    .then(({ data }) => {
      data
        .filter(post => post.category === category)
        .forEach(data => filteredData.push(data));
    })
    .catch(error => {
      console.log(error);
    });
  return filteredData;
}
