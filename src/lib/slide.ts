import { cubicOut } from "svelte/easing";
import type { EasingFunction, TransitionConfig } from "svelte/types/runtime/transition";

export interface SlideParams {
  delay?: number;
  delayX?: number;
  delayY?: number;
  duration?: number;
  easing?: EasingFunction;
}

export function slide(
  node: Element,
  { delayX = 0, delayY = 0, delay = 0, duration = 400, easing = cubicOut }: SlideParams
): TransitionConfig {
  const slideHor = slideHorizontal(node, { delay: delayX });
  const slideVert = slideVertical(node, { delay: delayY });

  return {
    delay,
    duration,
    easing,
    css: (t, u) => slideVert.css(t, u) + slideHor.css(t, u),
  };
}
export function slideVertical(
  node: Element,
  { delay = 0, duration = 400, easing = cubicOut }: SlideParams
): TransitionConfig {
  const style = getComputedStyle(node);
  const opacity = +style.opacity;
  const height = parseFloat(style.height);
  const padding_top = parseFloat(style.paddingTop);
  const padding_bottom = parseFloat(style.paddingBottom);
  const margin_top = parseFloat(style.marginTop);
  const margin_bottom = parseFloat(style.marginBottom);
  const border_top_width = parseFloat(style.borderTopWidth);
  const border_bottom_width = parseFloat(style.borderBottomWidth);

  return {
    delay,
    duration,
    easing,
    css: (t) =>
      "overflow: hidden;" +
      `opacity: ${Math.min(t * 20, 1) * opacity};` +
      `height: ${t * height}px;` +
      `padding-top: ${t * padding_top}px;` +
      `padding-bottom: ${t * padding_bottom}px;` +
      `margin-top: ${t * margin_top}px;` +
      `margin-bottom: ${t * margin_bottom}px;` +
      `border-top-width: ${t * border_top_width}px;` +
      `border-bottom-width: ${t * border_bottom_width}px;`,
  };
}
export function slideHorizontal(
  node: Element,
  { delay = 0, duration = 400, easing = cubicOut }: SlideParams
): TransitionConfig {
  const style = getComputedStyle(node);
  const opacity = +style.opacity;
  const width = parseFloat(style.width);
  const padding_top = parseFloat(style.paddingLeft);
  const padding_bottom = parseFloat(style.paddingRight);
  const margin_top = parseFloat(style.marginLeft);
  const margin_bottom = parseFloat(style.marginRight);
  const border_top_width = parseFloat(style.borderLeftWidth);
  const border_bottom_width = parseFloat(style.borderRightWidth);

  return {
    delay,
    duration,
    easing,
    css: (t) =>
      "overflow: hidden;" +
      `opacity: ${Math.min(t * 20, 1) * opacity};` +
      `width: ${t * width}px;` +
      `padding-left: ${t * padding_top}px;` +
      `padding-right: ${t * padding_bottom}px;` +
      `margin-left: ${t * margin_top}px;` +
      `margin-right: ${t * margin_bottom}px;` +
      `border-left-width: ${t * border_top_width}px;` +
      `border-right-width: ${t * border_bottom_width}px;`,
  };
}