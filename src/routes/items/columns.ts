import DataTableImage from "$lib/components/data-table/data-table-image.svelte";
import DataTableCell from "$lib/components/data-table/data-table-cell.svelte";
import { DataTableLink } from "$lib/components/data-table";
import type { Item } from "$lib/types/item";
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

const formatNumberCell = (
  value: number | null | undefined,
): string | null | undefined =>
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
  columnHelper.accessor("members", {
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
  columnHelper.accessor("lowalch", {
    cell: (info) =>
      renderComponent(DataTableCell, {
        value: formatNumberCell(info.getValue()) ?? "-",
        class: "flex justify-end",
      }),
    sortUndefined: "last",
    header: "Alch Low",
  }),
  columnHelper.accessor("highalch", {
    cell: (info) =>
      renderComponent(DataTableCell, {
        value: formatNumberCell(info.getValue()) ?? "-",
        class: "flex justify-end",
      }),
    sortUndefined: "last",
    header: "Alch High",
  }),
  columnHelper.accessor("limit", {
    cell: (info) =>
      renderComponent(DataTableCell, {
        value: formatNumberCell(info.getValue()) ?? "Unknown",
        class: "flex justify-end",
      }),
    sortUndefined: "last",
    header: "Limit",
  }),
  columnHelper.accessor("value", {
    cell: (info) =>
      renderComponent(DataTableCell, {
        value: formatNumberCell(info.getValue()) ?? "-",
        class: "flex justify-end",
      }),
    sortUndefined: "last",
    header: "Value",
  }),
  columnHelper.accessor("high", {
    cell: (info) =>
      renderComponent(DataTableCell, {
        value: formatNumberCell(info.getValue()) ?? "-",
        class: cn("flex justify-end"),
      }),
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

      return renderComponent(DataTableCell, {
        value: formatDistanceToNowStrict(value * 1000, {
          addSuffix: true,
        }),
        class: styleDateCell(new Date(value * 1000)),
      });
    },
    sortUndefined: "last",
    sortingFn: (a, b) => {
      if (!a.original.highTime || !b.original.highTime) return 0;
      if (a.original.highTime > b.original.highTime) return -1;
      return 1;
    },
  }),
  columnHelper.accessor("low", {
    cell: (info) =>
      renderComponent(DataTableCell, {
        value: formatNumberCell(info.getValue()) ?? "-",
        class: "flex justify-end",
      }),
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

      return renderComponent(DataTableCell, {
        value: formatDistanceToNowStrict(value * 1000, {
          addSuffix: true,
        }),
        class: styleDateCell(new Date(value * 1000)),
      });
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
      if (!info.row.getValue("high") || !info.row.getValue("low")) {
        return "-";
      }

      const margin = calculateMargin(
        info.row.getValue("high"),
        info.row.getValue("low"),
        info.row.getValue("id"),
      );

      return renderComponent(DataTableCell, {
        class: cn(styleNonGradedNumberCell(margin), "flex justify-end"),
        value: getPrefix(margin) + formatNumberCell(margin) || "-",
      });
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
    cell: (info) =>
      renderComponent(DataTableCell, {
        value: formatNumberCell(info.getValue()) ?? "-",
        class: "flex justify-end",
      }),
    sortUndefined: "last",
    header: "Volume (24h)",
  }),
  columnHelper.accessor((row) => row, {
    id: "volume_x_margin",
    cell: (info) => {
      let grossMargin = 0;
      if (
        info.row.getValue("high") &&
        info.row.getValue("low") &&
        info.row.getValue("volume")
      ) {
        grossMargin =
          info.row.getValue("volume") *
          calculateMargin(
            info.row.getValue("high"),
            info.row.getValue("low"),
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
      if (info.row.getValue("low")) {
        return renderComponent(DataTableCell, {
          value:
            formatNumberCell(
              calculateTax(info.row.getValue("low"), info.row.getValue("id")),
            ) ?? "0",
          class: "flex justify-end",
        });
      }
      return "0";
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
      if (!info.row.getValue("high") || !info.row.getValue("low")) {
        return "";
      }

      const roiValue = calculateRoi(
        info.row.getValue("low"),
        calculateMargin(
          info.row.getValue("high"),
          info.row.getValue("low"),
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
];
