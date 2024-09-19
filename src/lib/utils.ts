import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import { onMount } from "svelte";
import debounce from "lodash/debounce";

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
 * Returns a 1% (rounded down) tax on the sell price of an item if it is <=
 * 5m and is not exempt.
 * @param sellPrice
 * @param itemId
 * @returns
 */
export function calculateTax(sellPrice: number, itemId?: number) {
  if (!itemId || isItemTaxExempt(itemId)) {
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
  if (cost === 0) {
    return 0;
  }
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

export function asyncDebounce<
  F extends (...args: unknown[]) => Promise<unknown>,
>(func: F, wait?: number) {
  const resolveSet = new Set<(p: unknown) => void>();
  const rejectSet = new Set<(p: unknown) => void>();

  const debounced = debounce((args: Parameters<F>) => {
    func(...args)
      .then((...res) => {
        resolveSet.forEach((resolve) => resolve(...res));
        resolveSet.clear();
      })
      .catch((...res) => {
        rejectSet.forEach((reject) => reject(...res));
        rejectSet.clear();
      });
  }, wait);

  return (...args: Parameters<F>): ReturnType<F> =>
    new Promise((resolve, reject) => {
      resolveSet.add(resolve);
      rejectSet.add(reject);
      debounced(args);
    }) as ReturnType<F>;
}

export type OS = "MacOS" | "Windows" | "Linux" | "UNIX" | null;

export function getUserOperatingSystem(): OS {
  const userAgent = window.navigator.userAgent;

  let os: OS = null;

  if (userAgent.indexOf("Win") != -1) os = "Windows";
  if (userAgent.indexOf("Mac") != -1) os = "MacOS";
  if (userAgent.indexOf("X11") != -1) os = "UNIX";
  if (userAgent.indexOf("Linux") != -1) os = "Linux";
  return os;
}

export function styleDateCell(value: Date | null) {
  if (!value) {
    return "";
  }

  let className = "hsl(var(--foreground) / var(--tw-text-opacity))";

  const time = new Date(value).getTime();

  // 15 minutes
  if (time > Date.now() - 15 * 60 * 1000) {
    className = "text-green-500";
    // 30 minutes
  } else if (time > Date.now() - 60 * 60 * 1000) {
    className = "text-green-300";
  } else if (time > Date.now() - 2 * 60 * 60 * 1000) {
    className = "text-green-100";
  }
  return className;
}

export function styleSignedNumberCell(value: number | null) {
  if (!value) {
    return "text-slate-500";
  }

  let className;

  if (value > 0) {
    className = "text-green-500";
  } else if (value < 0) {
    className = "text-red-500";
  }
  return className;
}

export function getNumberFormatter() {
  let formatter = new Intl.NumberFormat();

  if (typeof navigator !== "undefined") {
    formatter = new Intl.NumberFormat(navigator.language, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }
  return formatter;
}

export function getCompactNumberFormatter() {
  let formatter = new Intl.NumberFormat();

  if (typeof navigator !== "undefined") {
    formatter = new Intl.NumberFormat(navigator.language, {
      notation: "compact",
      compactDisplay: "short",
      maximumSignificantDigits: 4,
    });
  }
  return formatter;
}

export function formatNumberCell(
  value: number | null | undefined,
): string | null | undefined {
  const formatter = getNumberFormatter();
  return value !== null && value !== undefined
    ? formatter?.format(value)
    : null;
}

export function getSignedPrefix(value: number): string {
  return value > 0 ? "+" : "";
}

export function calculateMargin(
  buyPrice: number,
  sellPrice: number,
  id?: number,
): number {
  return Math.round(buyPrice - sellPrice - calculateTax(buyPrice, id));
}
