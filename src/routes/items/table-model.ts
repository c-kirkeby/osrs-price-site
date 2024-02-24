import {
  addHiddenColumns,
  addPagination,
  addSortBy,
  addTableFilter,
} from "svelte-headless-table/plugins";
import { createRender, createTable } from "svelte-headless-table";

import DataTableImage from "$lib/components/data-table/data-table-image.svelte";
import { DataTableLink } from "$lib/components/data-table";
import type { Item } from "$lib/db/schema";
import type { ReadOrWritable } from "svelte-headless-table";
import { formatDistanceToNowStrict } from "date-fns/formatDistanceToNowStrict";
import { calculateRoi, calculateTax, cn } from "$lib/utils";
import DataTableSpan from "$lib/components/data-table/data-table-span.svelte";

const formatter = new Intl.NumberFormat();

const formatNumberCell = (value: number | null) =>
  value ? formatter.format(value) : "Unknown";

const formatBooleanCell = (value: boolean | null) =>
  value === true ? "Yes" : value === false ? "No" : "Unknown";

const styleDateCell = (value: Date | null) => {
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
  return cn(className, "text-right");
};

const styleNonGradedNumberCell = (value: number | null) => {
  if (!value) {
    return "";
  }

  let className;

  if (value > 0) {
    className = "text-green-500";
  } else if (value < 0) {
    className = "text-red-500";
  }
  return cn(className, "text-right");
};

export const createTableModel = (data: ReadOrWritable<Item[]>) => {
  const table = createTable(data, {
    page: addPagination(),
    sort: addSortBy({
      toggleOrder: ["asc", "desc"],
      initialSortKeys: [
        {
          id: "volume_x_margin",
          order: "desc",
        },
      ],
    }),
    filter: addTableFilter({
      fn: ({ filterValue, value }) =>
        value.toLowerCase().includes(filterValue.toLowerCase()),
    }),
    hide: addHiddenColumns({
      initialHiddenColumnIds: [
        "id",
        "value",
        "is_members",
        "alch_low",
        "alch_high",
      ],
    }),
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
        sort: {
          disable: true,
        },
      },
      cell: ({ value }) => {
        return createRender(DataTableImage, {
          src: `https://oldschool.runescape.wiki/images/${encodeURIComponent(
            value?.replaceAll(" ", "_") ?? "",
          )}`,
          alt: value,
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
          href: `/items/${row.original.id}`,
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
        if (!value) {
          return "";
        }

        return createRender(DataTableSpan, {
          class: styleDateCell(value),
        }).slot(
          formatDistanceToNowStrict(new Date(value), {
            addSuffix: true,
          }),
        );
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
        if (!value) {
          return "";
        }

        return createRender(DataTableSpan, {
          class: styleDateCell(value),
        }).slot(
          formatDistanceToNowStrict(new Date(value), {
            addSuffix: true,
          }),
        );
      },
    }),
    table.column({
      id: "margin",
      accessor: (item) => item,
      header: "Margin",
      cell: ({ value }) => {
        if (!value.buy_price || !value.sell_price) {
          return "";
        }

        const marginValue = Math.round(
          value.buy_price -
          value.sell_price -
          calculateTax(value.buy_price, value?.id),
        );

        return createRender(DataTableSpan, {
          class: styleNonGradedNumberCell(marginValue),
        }).slot(formatNumberCell(marginValue));
      },
      plugins: {
        sort: {
          getSortValue: (item) => {
            if (item.buy_price && item.sell_price) {
              return Math.floor(
                item.buy_price -
                item.sell_price -
                calculateTax(item.buy_price, item?.id),
              );
            }
            return 0;
          },
        },
      },
    }),
    table.column({
      id: "volume",
      accessor: (item) => item,
      header: "Volume (24h)",
      cell: ({ value }) => formatNumberCell(value.volume),
      plugins: {
        sort: {
          getSortValue: (item) => item.volume,
        },
      },
    }),
    table.column({
      id: "volume_x_margin",
      accessor: (item) => item,
      header: "Volume x Margin",
      cell: ({ value }) => {
        if (value.buy_price && value.sell_price && value.volume) {
          return formatNumberCell(
            Math.round(
              value.volume *
              (value.buy_price -
                value.sell_price -
                calculateTax(value.buy_price, value?.id)),
            ),
          );
        }
        return "";
      },
      plugins: {
        sort: {
          getSortValue: (item) => {
            if (item.buy_price && item.sell_price && item.volume) {
              return Math.floor(
                item.volume *
                (item.buy_price -
                  item.sell_price -
                  calculateTax(item.buy_price, item?.id)),
              );
            }
            return 0;
          },
        },
      },
    }),
    table.column({
      id: "tax",
      accessor: (item) => item,
      header: "Tax",
      cell: ({ value }) => {
        if (value.sell_price) {
          return formatNumberCell(calculateTax(value.sell_price, value?.id));
        }
        return "0";
      },
      plugins: {
        sort: {
          getSortValue: (item) => {
            if (item.sell_price) {
              return calculateTax(item.sell_price, item?.id);
            }
            return 0;
          },
        },
      },
    }),
    table.column({
      id: "roi",
      accessor: (item) => item,
      header: "ROI",
      cell: ({ value }) => {
        if (!value.buy_price || !value.sell_price) {
          return "";
        }

        const roiValue = calculateRoi(
          value.sell_price,
          value.buy_price -
          calculateTax(value.buy_price, value?.id) -
          value.sell_price,
        );

        return createRender(DataTableSpan, {
          class: styleNonGradedNumberCell(roiValue),
        }).slot(formatNumberCell(roiValue).concat("%"));
      },
      plugins: {
        sort: {
          getSortValue: (item) => {
            if (item.buy_price && item.sell_price) {
              return calculateRoi(
                item.sell_price,
                item.buy_price -
                calculateTax(item.buy_price, item?.id) -
                item.sell_price,
              );
            }
            return 0;
          },
        },
      },
    }),
  ]);

  return table.createViewModel(columns);
};
