<script context="module" lang="ts">
  import Intro from "$lib/Intro.svelte";
  import Projects from "$lib/Projects/index.svelte";
  import Accounts from "$lib/Accounts.svelte";
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section class="main">
  <Intro />
  <Projects />
  <Accounts />
</section>

<style lang="postcss">
  .main {
    display: grid;
    grid-template-columns: 4fr 3fr 3fr;
    gap: 10px;
    grid-auto-rows: minmax(100px, auto);
  }
</style>
