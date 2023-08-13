import { github } from '.';

export async function getMarkDown(markDownPath) {
  return github.get(markDownPath);
}
