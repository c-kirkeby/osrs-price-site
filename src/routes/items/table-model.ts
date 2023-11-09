import type { Item } from "$lib/db/schema";
import formatDistance from "date-fns/formatDistance";
import { createRender, createTable } from "svelte-headless-table";
import { addPagination, addSortBy } from "svelte-headless-table/plugins";
import { DataTableLink } from "$lib/components/data-table";
import type { ReadOrWritable } from "svelte-headless-table/lib/utils/store";

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
  });
  const columns = table.createColumns([
    table.column({
      accessor: "name",
      header: "Name",
      cell: ({ row, value }) =>
        createRender(DataTableLink, {
          href: `/items/${row.id}`,
        }).slot(value ?? ""),
    }),
    table.column({
      accessor: "is_members",
      header: "Members?",
      cell: ({ value }) => formatBooleanCell(value),
    }),
    table.column({
      accessor: "alch_low",
      header: "Alch Low",
      cell: ({ value }) => formatNumberCell(value),
    }),
    table.column({
      accessor: "alch_high",
      header: "Alch High",
      cell: ({ value }) => formatNumberCell(value),
    }),
    table.column({
      accessor: "buy_limit",
      header: "Limit",
      cell: ({ value }) => formatNumberCell(value),
    }),
    table.column({
      accessor: "value",
      header: "Value",
      cell: ({ value }) => formatNumberCell(value),
    }),
    table.column({
      accessor: "buy_price",
      header: "Buy Price",
      cell: ({ value }) => formatNumberCell(value),
    }),
    table.column({
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
      accessor: (row) => row.sell_price && formatter.format(row.sell_price),
      header: "Sell Price",
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
