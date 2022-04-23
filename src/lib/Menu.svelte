<script lang="ts">
  import Projects from "$lib/Projects/index.svelte";
  import Accounts from "$lib/Accounts.svelte";

  enum PanelActive {
    None = "None",
    Projects = "Projects",
    Accounts = "Accounts",
  }

  let panelActive = PanelActive.None;
  // $: {
  //   console.log(panelActive);
  // }
</script>

<div class="menu-bar">
  <div class="content">
    {#if panelActive === PanelActive.Projects}
      <Projects />
    {:else if panelActive === PanelActive.Accounts}
      <Accounts />
    {/if}
  </div>
  <div class="menu">
    <button
      class="menu-button"
      on:click={() => (panelActive = PanelActive.Projects)}
    >
      Projects
    </button>
    <button
      class="menu-button"
      on:click={() => {
        panelActive = PanelActive.Accounts;
        console.log(panelActive);
      }}
    >
      Accounts
    </button>
  </div>
</div>

<style lang="postcss">
  @import "variables.pcss";
  .menu-bar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .menu {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    padding: 0.5em;
    align-items: center;
    height: 100%;
    background: $bg-dark;
  }
</style>
