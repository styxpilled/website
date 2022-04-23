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
  {#if panelActive !== PanelActive.None}
    <div class="content">
      {#if panelActive === PanelActive.Projects}
        <Projects />
      {:else if panelActive === PanelActive.Accounts}
        <Accounts />
      {/if}
    </div>
  {/if}

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
    justify-content: end;
    align-items: center;
    grid-column: 3;
    grid-row: 1 / 3;
    padding: 2rem;
  }
  .content {
    background: $bg-dark;
    /* padding: 0.5rem; */
  }
  .menu {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    /* padding: 0.5em; */
    padding-left: 0.5em;
    padding-right: 0.5em;
    align-items: center;
    height: 100%;
    background: $bg-dark-high;
  }
</style>
