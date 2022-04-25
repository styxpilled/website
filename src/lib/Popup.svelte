<script lang="ts">
  import { slide } from "./slide";
  export let pageX: number;
  export let pageY: number;
</script>

<div
  transition:slide={{ delayX: 3000 }}
  id="popup"
  style:top="{pageY + 1}px"
  style:left="{pageX + 1}px"
>
  <slot />
</div>

<style lang="postcss">
  #popup {
    position: absolute;
    background: black;
    padding: 1em;
    text-overflow: clip;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
