<script lang="ts">
  import { onMount } from "svelte";
  import type Repository from "./repo";
  import getProjects from "./projects";
  let output: Repository[];
  onMount(async () => {
    output = await getProjects("styxpilled");
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
