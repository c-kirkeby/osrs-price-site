import type { Item } from "$lib/db/schema";
import formatDistance from "date-fns/formatDistance";
import { createRender, createTable } from "svelte-headless-table";
import { addPagination, addSortBy } from "svelte-headless-table/plugins";
import { DataTableLink } from "$lib/components/data-table";
import type { ReadOrWritable } from "svelte-headless-table/lib/utils/store";

const formatter = new Intl.NumberFormat();

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
    }),
    table.column({
      accessor: "alch_low",
      header: "Alch Low",
    }),
    table.column({
      accessor: "alch_high",
      header: "Alch High",
    }),
    table.column({
      accessor: (row) => row.buy_limit && formatter.format(row.buy_limit),
      header: "Limit",
    }),
    table.column({
      accessor: (row) => row.value && formatter.format(row.value),
      header: "Value",
    }),
    table.column({
      accessor: "buy_price",
      header: "Buy Price",
    }),
    table.column({
      accessor: (row) => {
        if (row.buy_price_timestamp) {
          return formatDistance(new Date(row.buy_price_timestamp), new Date(), {
            addSuffix: true,
          }).replace("about", "");
        }
        return "";
      },
      header: "Last Bought",
    }),
    table.column({
      accessor: (row) => row.sell_price && formatter.format(row.sell_price),
      header: "Sell Price",
    }),
    table.column({
      accessor: (row) => {
        if (row.buy_price_timestamp) {
          return formatDistance(new Date(row.buy_price_timestamp), new Date(), {
            addSuffix: true,
          }).replace("about", "");
        }
        return "";
      },
      header: "Last Sold",
    }),
  ]);

  return table.createViewModel(columns);
};
