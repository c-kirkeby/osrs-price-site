import DataTableImage from "$lib/components/data-table/data-table-image.svelte";
import DataTableCell from "$lib/components/data-table/data-table-cell.svelte";
import { DataTableLink } from "$lib/components/data-table";
import type { Item } from "$lib/db/schema";
import { formatDistanceToNowStrict } from "date-fns/formatDistanceToNowStrict";
import { calculateRoi, calculateTax, cn } from "$lib/utils";
import { createColumnHelper, renderComponent } from "@tanstack/svelte-table";
import { LucideStar } from "lucide-svelte";

let formatter: Intl.NumberFormat | undefined;

if (!formatter && typeof navigator !== "undefined") {
  formatter = new Intl.NumberFormat(navigator.language, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

const formatNumberCell = (value: number | null): string | null | undefined =>
  value !== null && value !== undefined ? formatter?.format(value) : null;

const getPrefix = (value: number): string => {
  return value > 0 ? "+" : "";
};

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
  return className;
};

const styleNonGradedNumberCell = (value: number | null) => {
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
};

const calculateMargin = (
  buyPrice: number,
  sellPrice: number,
  id: number,
): number => {
  return Math.round(buyPrice - sellPrice - calculateTax(buyPrice, id));
};

const columnHelper = createColumnHelper<Item>();

// TODO: fix explicit `any`. ref: TanStack/table#4382
export const columns: any[] = [
  columnHelper.accessor("id", {
    cell: (info) => info.getValue(),
    header: "ID",
  }),
  columnHelper.accessor("icon", {
    cell: (info) =>
      renderComponent(DataTableImage, {
        src: `https://oldschool.runescape.wiki/images/${encodeURIComponent(
          info.getValue()?.replaceAll(" ", "_") ?? "",
        )}`,
        alt: info.getValue(),
        class: "object-contain size-5 mx-auto w-[40px]",
      }),
    header: "Icon",
    enableSorting: false,
    enableColumnFilter: false,
  }),
  columnHelper.accessor("name", {
    cell: (info) =>
      renderComponent(DataTableLink, {
        value: info.getValue() ?? "",
        href: `/items/${info.row.original.id}`,
      }),
    header: "Name",
  }),
  columnHelper.accessor("is_members", {
    cell: (info) =>
      renderComponent(LucideStar, {
        class: cn("size-5 stroke-1", {
          "fill-yellow-400": info.getValue(),
          "fill-slate-300": !info.getValue(),
        }),
      }),
    header: "Members",
    enableSorting: false,
  }),
  columnHelper.accessor("alch_low", {
    cell: (info) =>
      renderComponent(DataTableCell, {
        value: formatNumberCell(info.getValue()) ?? "-",
        class: "flex justify-end",
      }),
    header: "Alch Low",
  }),
  columnHelper.accessor("alch_high", {
    cell: (info) =>
      renderComponent(DataTableCell, {
        value: formatNumberCell(info.getValue()) ?? "-",
        class: "flex justify-end",
      }),
    header: "Alch High",
  }),
  columnHelper.accessor("buy_limit", {
    cell: (info) =>
      renderComponent(DataTableCell, {
        value: formatNumberCell(info.getValue()) ?? "-",
        class: "flex justify-end",
      }),
    header: "Limit",
  }),
  columnHelper.accessor("value", {
    cell: (info) =>
      renderComponent(DataTableCell, {
        value: formatNumberCell(info.getValue()) ?? "-",
        class: "flex justify-end",
      }),
    header: "Value",
  }),
  columnHelper.accessor("buy_price", {
    cell: (info) =>
      renderComponent(DataTableCell, {
        value: formatNumberCell(info.getValue()) ?? "-",
        class: cn("flex justify-end"),
      }),
    header: "Buy Price",
  }),
  columnHelper.accessor("buy_price_timestamp", {
    header: "Last Bought",
    cell: (info) =>
      renderComponent(DataTableCell, {
        value: formatDistanceToNowStrict(info.getValue() ?? "", {
          addSuffix: true,
        }),
        class: styleDateCell(info.getValue()),
      }),
    sortingFn: (a, b) => {
      if (!a.original.buy_price_timestamp || !b.original.buy_price_timestamp) {
        return 0;
      }

      return (
        new Date(a.original.buy_price_timestamp).getTime() -
        new Date(b.original.buy_price_timestamp).getTime()
      );
    },
  }),
  columnHelper.accessor("sell_price", {
    cell: (info) =>
      renderComponent(DataTableCell, {
        value: formatNumberCell(info.getValue()) ?? "-",
        class: "flex justify-end",
      }),
    header: "Sell Price",
  }),
  columnHelper.accessor("sell_price_timestamp", {
    cell: (info) =>
      renderComponent(DataTableCell, {
        value: formatDistanceToNowStrict(info.getValue() ?? "", {
          addSuffix: true,
        }),
        class: styleDateCell(info.getValue()),
      }),
    header: "Last Sold",
    sortingFn: (a, b) => {
      if (
        !a.original.sell_price_timestamp ||
        !b.original.sell_price_timestamp
      ) {
        return 0;
      }

      return (
        new Date(a.original.sell_price_timestamp).getTime() -
        new Date(b.original.sell_price_timestamp).getTime()
      );
    },
  }),
  columnHelper.accessor((row) => row, {
    id: "margin",
    header: "Margin",
    cell: (info) => {
      if (!info.row.getValue("buy_price") || !info.row.getValue("sell_price")) {
        return "-";
      }

      const margin = calculateMargin(
        info.row.getValue("buy_price"),
        info.row.getValue("sell_price"),
        info.row.getValue("id"),
      );

      return renderComponent(DataTableCell, {
        class: cn(styleNonGradedNumberCell(margin), "flex justify-end"),
        value: getPrefix(margin) + formatNumberCell(margin) || "-",
      });
    },
    sortingFn: (a, b) => {
      if (
        !a.original.buy_price ||
        !a.original.sell_price ||
        !b.original.buy_price ||
        !b.original.sell_price
      ) {
        return 0;
      }

      return (
        calculateMargin(
          a.original.buy_price,
          a.original.sell_price,
          a.original.id,
        ) -
        calculateMargin(
          b.original.buy_price,
          b.original.sell_price,
          b.original.id,
        )
      );
    },
  }),
  columnHelper.accessor("volume", {
    cell: (info) =>
      renderComponent(DataTableCell, {
        value: formatNumberCell(info.getValue()) ?? "-",
        class: "flex justify-end",
      }),
    header: "Volume (24h)",
  }),
  columnHelper.accessor((row) => row, {
    id: "volume_x_margin",
    cell: (info) => {
      let grossMargin = 0;
      if (
        info.row.getValue("buy_price") &&
        info.row.getValue("sell_price") &&
        info.row.getValue("volume")
      ) {
        grossMargin =
          info.row.getValue("volume") *
          calculateMargin(
            info.row.getValue("buy_price"),
            info.row.getValue("sell_price"),
            info.row.getValue("id"),
          );
      }
      return renderComponent(DataTableCell, {
        value:
          getPrefix(grossMargin) + formatNumberCell(Math.round(grossMargin)) ||
          "-",
        class: cn(styleNonGradedNumberCell(grossMargin), "flex justify-end"),
      });
    },
    header: "Gross Profit",
    sortingFn: (a, b) => {
      if (
        !a.original.buy_price ||
        !a.original.sell_price ||
        !a.original.volume ||
        !b.original.buy_price ||
        !b.original.sell_price ||
        !b.original.volume
      ) {
        return 0;
      }
      const aMargin = calculateMargin(
        a.original.buy_price,
        a.original.sell_price,
        a.original.id,
      );
      const bMargin = calculateMargin(
        b.original.buy_price,
        b.original.sell_price,
        b.original.id,
      );

      return a.original.volume * aMargin - b.original.volume * bMargin;
    },
  }),
  columnHelper.accessor((row) => row, {
    id: "tax",
    cell: (info) => {
      if (info.row.getValue("sell_price")) {
        return renderComponent(DataTableCell, {
          value:
            formatNumberCell(
              calculateTax(
                info.row.getValue("sell_price"),
                info.row.getValue("id"),
              ),
            ) ?? "0",
          class: "flex justify-end",
        });
      }
      return "0";
    },
    sortingFn: (a, b) => {
      if (!a.original.sell_price || !b.original.sell_price) {
        return 0;
      }

      return (
        calculateTax(a.original.sell_price, a.original.id) -
        calculateTax(b.original.sell_price, b.original.id)
      );
    },
    header: "Tax",
  }),
  columnHelper.accessor((row) => row, {
    id: "roi",
    cell: (info) => {
      if (!info.row.getValue("buy_price") || !info.row.getValue("sell_price")) {
        return "";
      }

      const roiValue = calculateRoi(
        info.row.getValue("sell_price"),
        calculateMargin(
          info.row.getValue("buy_price"),
          info.row.getValue("sell_price"),
          info.row.getValue("id"),
        ),
      );

      return renderComponent(DataTableCell, {
        value:
          getPrefix(roiValue) + formatNumberCell(roiValue)?.concat("%") || "-",
        class: cn(styleNonGradedNumberCell(roiValue), "flex justify-end"),
      });
    },
    sortingFn: (a, b) => {
      if (
        !a.original.buy_price ||
        !a.original.sell_price ||
        !b.original.buy_price ||
        !b.original.sell_price
      ) {
        return 0;
      }

      const aRoi = calculateRoi(
        a.original.sell_price,
        calculateMargin(
          a.original.buy_price,
          a.original.sell_price,
          a.original.id,
        ),
      );
      const bRoi = calculateRoi(
        b.original.sell_price,
        calculateMargin(
          b.original.buy_price,
          b.original.sell_price,
          b.original.id,
        ),
      );

      return aRoi - bRoi;
    },
    header: "ROI",
  }),
];
