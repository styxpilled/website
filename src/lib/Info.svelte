<script lang="ts">
  export let title: string = "Astrolabe";
</script>

<div class="info">
  <h1>{title}</h1>
</div>

<style lang="postcss">
  @import "variables.pcss";
  .info {
    background: transparent;
    padding: 1em;
    text-align: center;
    position: absolute;
  }
</style>
