<script lang="ts">
  import { onMount } from "svelte";
  import type Repository from "./repo";
  import getProjects from "./projects";
  import { repos } from "../../stores";

  let output: Repository[];
  repos.subscribe((value) => {
    output = value;
  });

  onMount(async () => {
    repos.set(await getProjects("styxpilled"));
  });
</script>

<div>
  <h3 class="title">Projects:</h3>
  <div class="projects">
    {#if output}
      {#each output as project}
        <b><a href={project.svn_url}>{project.name}</a></b>
        {project.stargazers_count} stars
        {project.forks} forks
        <br />
        {project.description}
        <br />
      {/each}
    {/if}
  </div>
</div>

<style lang="postcss">
  h3 {
    text-align: right;
  }
  .projects {
    text-align: right;
  }
</style>
