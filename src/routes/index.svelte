<script context="module" lang="ts">
  import Intro from "$lib/Intro.svelte";
  import Menu from "$lib/Menu.svelte";
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section class="main">
  <Intro />
  <Menu />
  <!-- <Accounts /> -->
</section>

<style lang="postcss">
  @import "variables.pcss";
  .main {
    display: flex;
    /* flex-direction: row; */
    /* space around */
    justify-content: space-between;
    padding: 2em;
    /* align-content: space-between; */
  }
</style>
