import type Repository from './repo';

async function getProjects(user: string): Promise<Repository[]> {
  let repos: Repository[] = [];
  let page: Repository[] = [];
  let index = 1;
  while (page.length === 30 || repos.length === 0) {
    const res = await fetch(`https://api.github.com/users/${user}/repos?page=${index}`);
    page = await res.json();
    repos = [...repos, page.slice(0, 5)].flat(1);
    index++;
  }
  repos = repos.filter((repo: Repository) => !repo.fork && !repo.archived && repo.name !== user);
  return repos;
}

export default getProjects;