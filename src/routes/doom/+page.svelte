<script context="module">
  import { browser, dev } from "$app/env";

  // we don't need any JS on this page, though we'll load
  // it in dev so that we get hot module replacement...
  export const hydrate = dev;

  // ...but if the client-side router is already loaded
  // (i.e. we came here from elsewhere in the app), use it
  export const router = browser;

  // since there's no dynamic data here, we can prerender
  // it so that it gets served as a static asset in prod
  export const prerender = true;
</script>

<svelte:head>
  <title>DOOOOOOM!</title>
</svelte:head>

<h1>The Book of Doom</h1>
<h2>by styx</h2>
If you read this you are doomed.<br />
Don't read another line.<br />
Not another word, all right?<br />
You're still reading, aren't you?<br />
What part of 'Don't read another line' do you not understand?<br />
Well, it's too late now, you've read it.<br />
You're doomed!<br />
You never should have read this.<br />
And I probably shouldn't have written it, actually.

<style>
  h1 {
    $pride-red: #e23241;
    $pride-orange: #ff9438;
    $pride-yellow: #ffdc44;
    $pride-green: #4dc16f;
    $pride-blue: #1781af;
    $pride-purple: #8b1b8d;
    $trans-pink: #ffc6de;
    $trans-blue: #65d3ff;
  }
</style>
