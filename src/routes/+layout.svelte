<script>
  import "$styles/app.pcss";
  import { onMount } from "svelte";
  onMount(() => {
    // get html tag and set opacity to 1
    const html = document.querySelector("html");
    html.style.opacity = "1";
    html.style.visibility = "visible";
  });
</script>

<slot />
