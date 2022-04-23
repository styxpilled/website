<svelte:head>
  <title>Home</title>
</svelte:head>

<div class="intro">
  <div class="container">
    <div class="hand">
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        class="icon"
        viewBox="0 0 32 32"
      >
        <path
          fill="#ef9645"
          d="M4.3,8.1c0.8-0.6,2.1-0.5,2.8,0.1L6.3,7C5.6,6,5.9,5,6.8,4.3c1-0.7,3.8,1.2,3.8,1.2c-0.7-1-0.6-2.3,0.4-3 c1-0.7,2.4-0.5,3.1,0.5l9.3,13.1l-1.2,11.4L12.4,24L3.8,11.2C3.1,10.2,3.3,8.8,4.3,8.1C4.3,8.1,4.3,8.1,4.3,8.1z"
        />
        <path
          fill="#ffdc5d"
          d="M2.4,15.4c0,0-1-1.5,0.5-2.5c1.5-1,2.5,0.5,2.5,0.5l4.7,6.8c0.2-0.3,0.3-0.5,0.5-0.8L4.1,10c0,0-1-1.5,0.5-2.5 C6,6.5,7,8,7,8l6.1,8.9c0.2-0.2,0.5-0.4,0.7-0.6L6.7,6c0,0-1-1.5,0.5-2.5C8.6,2.5,9.6,4,9.6,4l7.1,10.3c0.3-0.2,0.5-0.3,0.8-0.4 l-6.6-9.6c0,0-1-1.5,0.5-2.5c1.5-1,2.5,0.5,2.5,0.5l7,10.2l1.1,1.5c-4.4,3-4.8,8.7-2.3,12.4c0.5,0.7,1.2,0.2,1.2,0.2 c-3-4.4-2.1-9.3,2.3-12.4l-1.3-6.5c0,0-0.5-1.7,1.2-2.2c1.7-0.5,2.2,1.2,2.2,1.2l1.5,4.4c0.6,1.8,1.2,3.5,2.1,5.2 c2.4,4.7,1,10.5-3.5,13.6c-4.9,3.3-11.5,2.1-14.8-2.8L2.4,15.4z"
        />
        <g>
          <!-- left inner -->
          <path
            class="left inner"
            fill="#5dadec"
            d="M10.7,28.5c-3.6,0-7.1-3.6-7.1-7.1c0-0.5-0.4-0.9-0.9-0.9s-0.9,0.4-0.9,0.9c0,5.3,3.6,8.9,8.9,8.9 c0.5,0,0.9-0.4,0.9-0.9C11.6,28.8,11.2,28.5,10.7,28.5z"
          />
          <!-- left outter -->
          <path
            class="left outter"
            fill="#5dadec"
            d="M6.2,30.2c-2.7,0-4.4-1.8-4.4-4.4c0-0.5-0.4-0.9-0.9-0.9S0,25.3,0,25.8C0,29.3,2.7,32,6.2,32 c0.5,0,0.9-0.4,0.9-0.9S6.7,30.2,6.2,30.2z"
          />
          <!-- right inner -->
          <path
            class="right inner"
            fill="#5dadec"
            d="M21.3,1.8c-0.5,0-0.9,0.4-0.9,0.9s0.4,0.9,0.9,0.9c3.6,0,7.1,3.2,7.1,7.1c0,0.5,0.4,0.9,0.9,0.9 s0.9-0.4,0.9-0.9C30.2,5.8,26.7,1.8,21.3,1.8z"
          />
          <!-- right outter -->
          <path
            class="right outter"
            fill="#5dadec"
            d="M25.8,0c-0.5,0-0.9,0.4-0.9,0.9s0.4,0.9,0.9,0.9c2.7,0,4.4,2,4.4,4.4c0,0.5,0.4,0.9,0.9,0.9 c0.5,0,0.9-0.4,0.9-0.9C32,2.8,29.3,0,25.8,0z"
          />
        </g>
      </svg>
      <!-- <Icon class="" icon={wavingHand} /> -->
    </div>
    <h1>Hi! <br /> I'm Styx.</h1>
    <h2>I'm a</h2>
    <h2 class="strikethrough">pyramid scheme</h2>
    <h2 class="strikethrough">new js framework</h2>
    <h2 class="strikethrough">jpeg of a monkey</h2>
    <h2>me.</h2>
  </div>
</div>

<style lang="postcss">
  @import "variables.pcss";
  .hand {
    animation: wave 15s infinite 1s;
    font-size: 10rem;
    size: 10rem;
    transform-origin: 74% 91%;
    margin-left: -0.5em;
  }
  .hand::after {
    position: absolute;
    top: 91%;
    left: 74%;
    width: 5px;
    height: 5px;
    content: "";
    background-color: #f0f;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  @keyframes wave {
    10% {
      transform: rotate(60deg);
    }

    20% {
      transform: rotate(0deg);
    }
  }

  .left {
    animation: show-left 15s infinite 1s;
  }

  .right {
    animation: show-right 15s infinite 1s;
  }

  @keyframes show-left {
    0% {
      opacity: 0;
    }
    5% {
      opacity: 1;
    }
    10% {
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }
  @keyframes show-right {
    0% {
      opacity: 0;
    }
    10% {
      opacity: 0;
    }
    15% {
      opacity: 1;
    }
    20% {
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }

  .strikethrough {
    display: inline-block;
    position: relative;
    transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
  }

  .strikethrough:after {
    content: "";
    position: absolute;
    display: block;
    width: 100%;
    height: 2px;
    margin-top: -1rem;
    background: rgb(255, 0, 0);
    transform-origin: center left;
    animation: strikethrough 1s 0.5s cubic-bezier(0.55, 0, 0.1, 1) 1;
    transition: transform 0.5s cubic-bezier(0.55, 0, 0.1, 1);
  }

  @keyframes strikethrough {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }

  .strikethrough:hover:after {
    transform: scaleX(0);
    transform-origin: center right;
  }

  .icon {
    width: 1em;
    height: 1em;
  }

  .intro {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
    padding: 2em;
    width: fit-content;
    height: fit-content;
    background: $bg-dark;
  }

  h1 {
    width: 100%;
  }
</style>
