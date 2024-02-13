import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import { onMount } from "svelte";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FlyAndScaleParams {
  y?: number;
  x?: number;
  start?: number;
  duration?: number;
}

export const flyAndScale = (
  node: Element,
  params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 },
): TransitionConfig => {
  const style = getComputedStyle(node);
  const transform = style.transform === "none" ? "" : style.transform;

  const scaleConversion = (
    valueA: number,
    scaleA: [number, number],
    scaleB: [number, number],
  ) => {
    const [minA, maxA] = scaleA;
    const [minB, maxB] = scaleB;

    const percentage = (valueA - minA) / (maxA - minA);
    const valueB = percentage * (maxB - minB) + minB;

    return valueB;
  };

  const styleToString = (
    style: Record<string, number | string | undefined>,
  ): string => {
    return Object.keys(style).reduce((str, key) => {
      if (style[key] === undefined) return str;
      return str + `${key}:${style[key]};`;
    }, "");
  };

  return {
    duration: params.duration ?? 200,
    delay: 0,
    css: (t) => {
      const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
      const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
      const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

      return styleToString({
        transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
        opacity: t,
      });
    },
    easing: cubicOut,
  };
};

export function poll(fn: () => void, milliseconds: number, lazy = true) {
  onMount(() => {
    const interval = setInterval(fn, milliseconds);
    if (!lazy) {
      fn();
    }
    return () => clearInterval(interval);
  });
}

/**
 *
 * Returns a 1% tax on the sell price of an item if it is >= 100gp <= 5m and
 * is not exempt.
 * @param sellPrice
 * @param itemId
 * @returns
 */
export function calculateTax(sellPrice: number, itemId: number) {
  if (sellPrice < 100 || isItemTaxExempt(itemId)) {
    console.debug("Item is tax exempt or too cheap to tax");
    return 0;
  }

  const potentialTax = Math.floor(sellPrice * 0.01);

  if (potentialTax > 5_000_000) {
    return 5_000_000;
  } else {
    return potentialTax;
  }
}

/**
 * Returns the return on investment as a percentage.
 * @param cost (tax included)
 * @param profit
 * @returns
 */
export function calculateRoi(cost: number, profit: number) {
  return (profit / cost) * 100;
}

/**
 * @todo move to a database table
 */
export function isItemTaxExempt(itemId: number) {
  const taxExemptItems = [
    13190, // Old school bond
    1755, // Chisel
    5325, // Gardening Trowel
    1785, // Glassblowing Pipe
    2347, // Hammer
    1733, // Needle
    233, // Pestle and mortar
    5341, // Rake
    8794, // Saw
    5329, // Secateurs
    5343, // Seed dibber
    1735, // Shears
    952, // Spade
    5331, // Watering can
  ];

  if (taxExemptItems.includes(itemId)) {
    return true;
  }
}
