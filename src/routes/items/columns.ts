import DataTableImage from "$lib/components/data-table/data-table-image.svelte";
import type { Item } from "$lib/db/schema";
import { formatDistanceToNowStrict } from "date-fns/formatDistanceToNowStrict";
import { calculateRoi, calculateTax, cn } from "$lib/utils";
import DataTableSpan from "$lib/components/data-table/data-table-span.svelte";
import { createColumnHelper, renderComponent } from "@tanstack/svelte-table";
import { LucideStar } from "lucide-svelte";

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

const columnHelper = createColumnHelper<Item>();

export const columns = [
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
    cell: (info) => info.getValue(),
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
    cell: (info) => formatNumberCell(info.getValue()),
    header: "Alch Low",
  }),
  columnHelper.accessor("alch_high", {
    cell: (info) => formatNumberCell(info.getValue()),
    header: "Alch High",
  }),
  columnHelper.accessor("buy_limit", {
    cell: (info) => formatNumberCell(info.getValue()),
    header: "Limit",
  }),
  columnHelper.accessor("value", {
    cell: (info) => formatNumberCell(info.getValue()),
    header: "Value",
  }),
  columnHelper.accessor("buy_price", {
    cell: (info) => formatNumberCell(info.getValue()),
    header: "Buy Price",
  }),
  columnHelper.accessor("buy_price_timestamp", {
    cell: (info) =>
      formatDistanceToNowStrict(info.getValue(), {
        addSuffix: true,
      }),
    header: "Last Bought",
  }),
  columnHelper.accessor("sell_price", {
    cell: (info) => formatNumberCell(info.getValue()),
    header: "Sell Price",
  }),
  columnHelper.accessor("sell_price_timestamp", {
    cell: (info) =>
      formatDistanceToNowStrict(info.getValue(), {
        addSuffix: true,
      }),
    header: "Last Sold",
  }),
  columnHelper.display({
    id: "margin",
    cell: (info) => {
      if (!info.row.getValue("buy_price") || !info.row.getValue("sell_price")) {
        return "";
      }

      const marginValue = Math.round(
        info.row.getValue("buy_price") -
        info.row.getValue("sell_price") -
        calculateTax(info.row.getValue("buy_price"), info.row.getValue("id")),
      );

      return renderComponent(DataTableSpan, {
        class: styleNonGradedNumberCell(marginValue),
        slot: formatNumberCell(marginValue),
      });
    },
  }),
  columnHelper.accessor("volume", {
    cell: (info) => formatNumberCell(info.getValue()),
    header: "Volume (24h)",
  }),
  columnHelper.display({
    id: "volume_x_margin",
    cell: (info) => {
      if (
        info.row.getValue("buy_price") &&
        info.row.getValue("sell_price") &&
        info.row.getValue("volume")
      ) {
        return formatNumberCell(
          Math.round(
            info.row.getValue("volume") *
            (info.row.getValue("buy_price") -
              info.row.getValue("sell_price") -
              calculateTax(
                info.row.getValue("buy_price"),
                info.row.getValue("id"),
              )),
          ),
        );
      }
      return "";
    },
    header: "Volume x Margin",
  }),
  columnHelper.display({
    id: "tax",
    cell: (info) => {
      if (info.row.getValue("sell_price")) {
        return formatNumberCell(
          calculateTax(
            info.row.getValue("sell_price"),
            info.row.getValue("id"),
          ),
        );
      }
      return "0";
    },
    header: "Tax",
  }),
  columnHelper.display({
    id: "roi",
    cell: (info) => {
      if (!info.row.getValue("buy_price") || !info.row.getValue("sell_price")) {
        return "";
      }

      const roiValue = calculateRoi(
        info.row.getValue("sell_price"),
        info.row.getValue("buy_price") -
        calculateTax(
          info.row.getValue("buy_price"),
          info.row.getValue("id"),
        ) -
        info.row.getValue("sell_price"),
      );

      return formatNumberCell(roiValue).concat("%");
    },
    header: "ROI",
  }),
];
