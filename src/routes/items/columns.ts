import { formatDistanceToNowStrict } from "date-fns/formatDistanceToNowStrict";
import {
  calculateMargin,
  calculateRoi,
  calculateTax,
  cn,
  formatNumberCell,
  getSignedPrefix,
  styleDateCell,
  styleSignedNumberCell,
} from "$lib/utils";
import { createColumnHelper } from "@tanstack/table-core";
import { LucideStar } from "lucide-svelte";
import { get } from "svelte/store";
import { favouriteItemsStore } from "$lib/stores/favourite-items";
import { favouritesStore } from "$lib/stores/favourites";
import { createRawSnippet } from "svelte";
import { renderSnippet, renderComponent } from "$lib/components/ui/data-table";
import FavouriteItemCell from "./favourite-item-cell.svelte";
import type { FavouriteItem } from "$lib/types/item";

const columnHelper = createColumnHelper<FavouriteItem>();

export const columns = [
  columnHelper.accessor("id", {
    cell: (info) => info.getValue(),
    header: "ID",
  }),
  columnHelper.accessor("icon", {
    cell: (info) => {
      const uriName = info.row.original.name.replaceAll(" ", "_");
      const snippet = createRawSnippet(() => ({
        render: () =>
          `<img src="https://oldschool.runescape.wiki/images/${encodeURIComponent(uriName)}.png" alt="${info.row.original.name}" class="object-contain size-5 mx-auto w-[40px]">`,
      }));
      return renderSnippet(snippet, "");
    },
    enableSorting: false,
    enableColumnFilter: false,
    header: "",
  }),
  columnHelper.accessor("name", {
    cell: (info) => {
      const snippet = createRawSnippet(() => ({
        render: () =>
          `<a href="/items/${info.row.original.id}" class="text-primary">${info.getValue()}</a>`,
      }));
      return renderSnippet(snippet, "");
    },
    header: "Name",
  }),
  columnHelper.accessor("members", {
    cell: (info) => {
      return renderComponent(LucideStar, {
        class: cn("size-5 stroke-1", {
          "fill-yellow-400": info.getValue(),
          "fill-slate-300": !info.getValue(),
        }),
      });
    },
    header: "Members",
  }),
  columnHelper.accessor("lowalch", {
    cell: (info) => {
      const snippet = createRawSnippet(() => ({
        render: () =>
          `<div class="flex justify-end">${formatNumberCell(info.getValue()) ?? "-"}</div>`,
      }));
      return renderSnippet(snippet, "");
    },
    sortUndefined: "last",
    header: "Alch Low",
  }),
  columnHelper.accessor("highalch", {
    cell: (info) => {
      const snippet = createRawSnippet(() => ({
        render: () =>
          `<div class="flex justify-end">${formatNumberCell(info.getValue()) ?? "-"}</div>`,
      }));
      return renderSnippet(snippet, "");
    },
    sortUndefined: "last",
    header: "Alch High",
  }),
  columnHelper.accessor("limit", {
    cell: (info) => {
      const snippet = createRawSnippet(() => ({
        render: () =>
          `<div class="flex justify-end">${formatNumberCell(info.getValue()) ?? "Unknown"}</div>`,
      }));
      return renderSnippet(snippet, "");
    },
    sortUndefined: "last",
    header: "Limit",
  }),
  columnHelper.accessor("value", {
    cell: (info) => {
      const snippet = createRawSnippet(() => ({
        render: () =>
          `<div class="flex justify-end">${formatNumberCell(info.getValue()) ?? "-"}</div>`,
      }));
      return renderSnippet(snippet, "");
    },
    sortUndefined: "last",
    header: "Value",
  }),
  columnHelper.accessor("high", {
    cell: (info) => {
      const snippet = createRawSnippet(() => ({
        render: () =>
          `<div class="flex justify-end">${formatNumberCell(info.getValue()) ?? "-"}</div>`,
      }));
      return renderSnippet(snippet, "");
    },
    sortUndefined: "last",
    header: "Buy Price",
  }),
  columnHelper.accessor("highTime", {
    header: "Last Bought",
    cell: (info) => {
      const value = info.getValue();
      if (!value) {
        return "-";
      }

      const snippet = createRawSnippet(() => ({
        render: () =>
          `<div class="${styleDateCell(new Date(value * 1000))}">${formatDistanceToNowStrict(
            value * 1000,
            {
              addSuffix: true,
            },
          )}</div>`,
      }));
      return renderSnippet(snippet, "");
    },
    sortUndefined: "last",
    sortingFn: (a, b) => {
      if (!a.original.highTime || !b.original.highTime) return 0;
      if (a.original.highTime > b.original.highTime) return -1;
      return 1;
    },
  }),
  columnHelper.accessor("low", {
    cell: (info) => {
      const snippet = createRawSnippet(() => ({
        render: () =>
          `<div class="flex justify-end">${formatNumberCell(info.getValue()) ?? "-"}</div>`,
      }));
      return renderSnippet(snippet, "");
    },
    sortUndefined: "last",
    header: "Sell Price",
  }),
  columnHelper.accessor("lowTime", {
    header: "Last Sold",
    cell: (info) => {
      const value = info.getValue();
      if (!value) {
        return "-";
      }

      const snippet = createRawSnippet(() => ({
        render: () =>
          `<div class="${styleDateCell(new Date(value * 1000))}">${formatDistanceToNowStrict(
            value * 1000,
            {
              addSuffix: true,
            },
          )}</div>`,
      }));
      return renderSnippet(snippet, "");
    },
    sortUndefined: "last",
    sortingFn: (a, b) => {
      if (!a.original.lowTime || !b.original.lowTime) return 0;
      if (a.original.lowTime > b.original.lowTime) return -1;
      return 1;
    },
  }),
  columnHelper.accessor((row) => row, {
    id: "margin",
    header: "Margin",
    cell: (info) => {
      if (!info.row.original.high || !info.row.original.low) {
        return "-";
      }

      const margin = calculateMargin(
        info.row.original.high,
        info.row.original.low,
        info.row.original.id,
      );

      const snippet = createRawSnippet(() => ({
        render: () =>
          `<div class="${styleSignedNumberCell(margin)} flex justify-end">${getSignedPrefix(margin) + formatNumberCell(margin) || "-"
          }</div>`,
      }));
      return renderSnippet(snippet, "");
    },
    sortingFn: (a, b) => {
      if (
        !a.original.high ||
        !a.original.low ||
        !b.original.high ||
        !b.original.low
      ) {
        return 0;
      }

      return (
        calculateMargin(a.original.high, a.original.low, a.original.id) -
        calculateMargin(b.original.high, b.original.low, b.original.id)
      );
    },
  }),
  columnHelper.accessor("volume", {
    cell: (info) => {
      const snippet = createRawSnippet(() => ({
        render: () =>
          `<div class="flex justify-end">${formatNumberCell(info.getValue()) ?? "-"}</div>`,
      }));
      return renderSnippet(snippet, "");
    },
    sortUndefined: "last",
    header: "Volume (24h)",
  }),
  columnHelper.accessor((row) => row, {
    id: "volume_x_margin",
    cell: (info) => {
      let grossMargin = 0;
      if (
        info.row.original.high &&
        info.row.original.low &&
        info.row.original.volume
      ) {
        grossMargin =
          info.row.original.volume *
          calculateMargin(
            info.row.original.high,
            info.row.original.low,
            info.row.original.id,
          );
      }

      const snippet = createRawSnippet(() => ({
        render: () =>
          `<div class="${styleSignedNumberCell(grossMargin)} flex justify-end">${getSignedPrefix(grossMargin) +
          formatNumberCell(Math.round(grossMargin)) || "-"
          }</div>`,
      }));
      return renderSnippet(snippet, "");
    },
    header: "Gross Profit",
    sortingFn: (a, b) => {
      if (
        !a.original.high ||
        !a.original.low ||
        !a.original.volume ||
        !b.original.high ||
        !b.original.low ||
        !b.original.volume
      ) {
        return 0;
      }
      const aMargin = calculateMargin(
        a.original.high,
        a.original.low,
        a.original.id,
      );
      const bMargin = calculateMargin(
        b.original.high,
        b.original.low,
        b.original.id,
      );

      return a.original.volume * aMargin - b.original.volume * bMargin;
    },
  }),
  columnHelper.accessor((row) => row, {
    id: "tax",
    cell: (info) => {
      const snippet = createRawSnippet(() => ({
        render: () =>
          `<div class="flex justify-end">${formatNumberCell(
            calculateTax(info.row.original.low ?? 0, info.row.original.id),
          ) ?? "0"
          }</div>`,
      }));
      return renderSnippet(snippet, "");
    },
    sortingFn: (a, b) => {
      if (!a.original.low || !b.original.low) {
        return 0;
      }

      return (
        calculateTax(a.original.low, a.original.id) -
        calculateTax(b.original.low, b.original.id)
      );
    },
    header: "Tax",
  }),
  columnHelper.accessor((row) => row, {
    id: "roi",
    cell: (info) => {
      if (!info.row.original.high || !info.row.original.low) {
        return "-";
      }

      const roiValue = calculateRoi(
        info.row.original.low,
        calculateMargin(
          info.row.original.high,
          info.row.original.low,
          info.row.original.id,
        ),
      );

      const snippet = createRawSnippet(() => ({
        render: () =>
          `<div class="${styleSignedNumberCell(roiValue)} flex justify-end">${getSignedPrefix(roiValue) +
          formatNumberCell(roiValue)?.concat("%") || "-"
          }</div>`,
      }));
      return renderSnippet(snippet, "");
    },
    sortingFn: (a, b) => {
      if (
        !a.original.high ||
        !a.original.low ||
        !b.original.high ||
        !b.original.low
      ) {
        return 0;
      }

      const aRoi = calculateRoi(
        a.original.low,
        calculateMargin(a.original.high, a.original.low, a.original.id),
      );
      const bRoi = calculateRoi(
        b.original.low,
        calculateMargin(b.original.high, b.original.low, b.original.id),
      );

      return aRoi - bRoi;
    },
    header: "ROI",
  }),
  columnHelper.accessor("is_favourite", {
    cell: (info) => {
      const favouriteItems = get(favouriteItemsStore);
      const favourites = get(favouritesStore);
      let isFavourite = false;
      let item: FavouriteItem | undefined;
      if (favouriteItems) {
        item = favouriteItems.find((item) => info.row.original.id === item.id);
        isFavourite = item?.is_favourite ?? false;
        const onclick = () => {
          if (!isFavourite && item?.id) {
            favouritesStore.set([...(favourites || []), item.id]);
          } else {
            favouritesStore.set(
              favourites?.filter((favourite) => favourite !== item?.id) ?? [],
            );
          }
        };
        return renderComponent(FavouriteItemCell, {
          isFavourite,
          onclick,
          class: cn({ "fill-primary": isFavourite }),
        });
      }
    },
    header: "Favourite",
    meta: {
      hideHeader: true,
    },
    enableSorting: false,
  }),
];
