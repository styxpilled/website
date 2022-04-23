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
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    grid-auto-rows: minmax(100px, auto);
  }
</style>
