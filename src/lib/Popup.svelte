<script lang="ts">
  import { fade } from "svelte/transition";
  import { slide } from "./slide";
  export let pageH: number;
  export let pageW: number;

  let w: number, h: number;

  export let flipW: boolean, flipH: boolean;
  console.log(flipW, flipH);
</script>

<div
  transition:slide
  id="popup"
  style:top="{flipH ? pageH - h : pageH}px"
  style:left="{flipW ? pageW - w : pageW}px"
  style:text-align={flipW ? "left" : "right"}
  bind:clientWidth={w}
  bind:clientHeight={h}
>
  <slot />
</div>

<style lang="postcss">
  #popup {
    position: absolute;
    background: black;
    /* outline: #ae97fd solid 2px; */
    /* filter: drop-shadow(0 0 3px #907ecc); */
    padding: 1em;
    text-overflow: clip;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
