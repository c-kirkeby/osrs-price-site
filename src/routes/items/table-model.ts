import {
  addHiddenColumns,
  addPagination,
  addTableFilter,
  addSortBy,
} from "svelte-headless-table/plugins";
import { createRender, createTable } from "svelte-headless-table";

import DataTableImage from "$lib/components/data-table/data-table-image.svelte";
import { DataTableLink } from "$lib/components/data-table";
import type { Item } from "$lib/db/schema";
import type { ReadOrWritable } from "svelte-headless-table/lib/utils/store";
import formatDistance from "date-fns/formatDistance";

const formatter = new Intl.NumberFormat();

const formatNumberCell = (value: number | null) =>
  value ? formatter.format(value) : "";

const formatBooleanCell = (value: boolean | null) =>
  value === true ? "Yes" : value === false ? "No" : "";

export const createTableModel = (data: ReadOrWritable<Item[]>) => {
  const table = createTable(data, {
    page: addPagination(),
    sort: addSortBy({
      toggleOrder: ["asc", "desc"],
    }),
    filter: addTableFilter({
      fn: ({ filterValue, value }) =>
        value.toLowerCase().includes(filterValue.toLowerCase()),
    }),
    hide: addHiddenColumns(),
  });
  const columns = table.createColumns([
    table.column({
      id: "id",
      accessor: "id",
      header: "ID",
    }),
    table.column({
      id: "icon",
      accessor: "icon",
      header: "Icon",
      plugins: {
        filter: {
          exclude: true,
        },
      },
      cell: ({ value, row }) => {
        return createRender(DataTableImage, {
          src: `https://oldschool.runescape.wiki/images/${encodeURIComponent(
            value?.replaceAll(" ", "_"),
          )}`,
          alt: row.cells.find((cell) => cell.id === "name")?.value,
          class: "object-contain h-5 w-5 mx-auto",
        });
      },
    }),
    table.column({
      id: "name",
      accessor: "name",
      header: "Name",
      cell: ({ row, value }) => {
        return createRender(DataTableLink, {
          // @ts-expect-error find if there's a better way to get the ID
          href: `/items/${row.cells.find((cell) => cell.id === "id")?.value}`,
        }).slot(value ?? "");
      },
    }),
    table.column({
      id: "is_members",
      accessor: "is_members",
      header: "Members?",
      cell: ({ value }) => formatBooleanCell(value),
    }),
    table.column({
      id: "alch_low",
      accessor: "alch_low",
      header: "Alch Low",
      cell: ({ value }) => formatNumberCell(value),
    }),
    table.column({
      id: "alch_high",
      accessor: "alch_high",
      header: "Alch High",
      cell: ({ value }) => formatNumberCell(value),
    }),
    table.column({
      id: "buy_limit",
      accessor: "buy_limit",
      header: "Limit",
      cell: ({ value }) => formatNumberCell(value),
    }),
    table.column({
      id: "value",
      accessor: "value",
      header: "Value",
      cell: ({ value }) => formatNumberCell(value),
    }),
    table.column({
      id: "buy_price",
      accessor: "buy_price",
      header: "Buy Price",
      cell: ({ value }) => formatNumberCell(value),
    }),
    table.column({
      id: "buy_price_timestamp",
      accessor: "buy_price_timestamp",
      header: "Last Bought",
      cell: ({ value }) => {
        if (value) {
          return formatDistance(new Date(value), new Date(), {
            addSuffix: true,
          }).replace("about", "");
        }
        return "";
      },
    }),
    table.column({
      accessor: "sell_price",
      header: "Sell Price",
      cell: ({ value }) => formatNumberCell(value),
    }),
    table.column({
      accessor: "sell_price_timestamp",
      header: "Last Sold",
      cell: ({ value }) => {
        if (value) {
          return formatDistance(new Date(value), new Date(), {
            addSuffix: true,
          }).replace("about", "");
        }
        return "";
      },
    }),
  ]);

  return table.createViewModel(columns);
};
