import type { Action } from 'svelte/action';

export interface ParallaxOptions {
  intensity?: number;
  disabledBelow?: number;
}

const DEFAULT_OPTIONS: Required<ParallaxOptions> = {
  intensity: 1,
  disabledBelow: 720
};

function px(value: number): string {
  return `${value.toFixed(2)}px`;
}

function deg(value: number): string {
  return `${value.toFixed(2)}deg`;
}

function setParallaxVars(node: HTMLElement, x = 0, y = 0, intensity = 1): void {
  node.style.setProperty('--parallax-bg-x', px(x * 32 * intensity));
  node.style.setProperty('--parallax-bg-y', px(y * 24 * intensity));
  node.style.setProperty('--parallax-bg-inverse-x', px(x * -24 * intensity));
  node.style.setProperty('--parallax-bg-inverse-y', px(y * -18 * intensity));
  node.style.setProperty('--parallax-layer-back-x', px(x * -4 * intensity));
  node.style.setProperty('--parallax-layer-back-y', px(y * -3 * intensity));
  node.style.setProperty('--parallax-layer-mid-x', px(x * 6 * intensity));
  node.style.setProperty('--parallax-layer-mid-y', px(y * 4 * intensity));
  node.style.setProperty('--parallax-layer-front-x', px(x * 10 * intensity));
  node.style.setProperty('--parallax-layer-front-y', px(y * 7 * intensity));
  node.style.setProperty('--parallax-tilt-x', deg(y * -2.4 * intensity));
  node.style.setProperty('--parallax-tilt-y', deg(x * 3.2 * intensity));

  node.style.setProperty('--preview-grid-x', px(x * 16 * intensity));
  node.style.setProperty('--preview-grid-y', px(y * 12 * intensity));
  node.style.setProperty('--preview-grid-rx', deg(y * 2.4 * intensity));
  node.style.setProperty('--preview-grid-ry', deg(x * -3.2 * intensity));
  node.style.setProperty('--preview-tabs-x', px(x * -26 * intensity));
  node.style.setProperty('--preview-tabs-y', px(y * -18 * intensity));
  node.style.setProperty('--preview-tabs-rx', deg(y * -5 * intensity));
  node.style.setProperty('--preview-tabs-ry', deg(x * 7 * intensity));
  node.style.setProperty('--hero-x', px(x * -10 * intensity));
  node.style.setProperty('--hero-y', px(y * -8 * intensity));
  node.style.setProperty('--metric-x', px(x * 10 * intensity));
  node.style.setProperty('--metric-y', px(y * -7 * intensity));
  node.style.setProperty('--workflow-x', px(x * 8 * intensity));
  node.style.setProperty('--workflow-y', px(y * 7 * intensity));

}

export const parallax: Action<HTMLElement, ParallaxOptions | undefined> = (node, options) => {
  let currentOptions = { ...DEFAULT_OPTIONS, ...options };
  let frame = 0;
  let nextX = 0;
  let nextY = 0;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const disabled = () =>
    motionQuery.matches || (currentOptions.disabledBelow > 0 && window.innerWidth < currentOptions.disabledBelow);

  const reset = () => setParallaxVars(node, 0, 0, currentOptions.intensity);

  const flush = () => {
    frame = 0;
    if (disabled()) {
      reset();
      return;
    }
    setParallaxVars(node, nextX, nextY, currentOptions.intensity);
  };

  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(flush);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    const bounds = node.getBoundingClientRect();
    nextX = (event.clientX - bounds.left) / bounds.width - 0.5;
    nextY = (event.clientY - bounds.top) / bounds.height - 0.5;
    schedule();
  };

  const handlePointerLeave = () => {
    nextX = 0;
    nextY = 0;
    schedule();
  };

  node.addEventListener('pointermove', handlePointerMove);
  node.addEventListener('pointerleave', handlePointerLeave);
  motionQuery.addEventListener('change', reset);
  reset();

  return {
    update(nextOptions) {
      currentOptions = { ...DEFAULT_OPTIONS, ...nextOptions };
      reset();
    },
    destroy() {
      node.removeEventListener('pointermove', handlePointerMove);
      node.removeEventListener('pointerleave', handlePointerLeave);
      motionQuery.removeEventListener('change', reset);
      if (frame) window.cancelAnimationFrame(frame);
    }
  };
};
