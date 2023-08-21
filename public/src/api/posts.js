import { github } from '.';

export async function getMarkDown(markDownPath) {
  return github.get(`${markDownPath}.md`);
}

export async function getSeed() {
  return github.get('/seed.json');
}

export function getProcessedData(category = 'all') {
  return getSeed()
    .then(response => filterData(response, category))
    .catch(error => console.log(error));
}

export async function getImageData(img) {
  return github.get(img);
}

function filterData(response, category) {
  if (category === 'all') return response.data;
  return response.data.filter(res => res.category === category);
}
