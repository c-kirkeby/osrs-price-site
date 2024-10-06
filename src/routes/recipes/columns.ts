import {
  calculateMargin,
  calculateTax,
  cn,
  formatNumberCell,
  getSignedPrefix,
  styleDateCell,
  styleSignedNumberCell,
} from "$lib/utils";
import { createColumnHelper, renderComponent } from "@tanstack/svelte-table";
import DataTableCell from "$lib/components/data-table/data-table-cell.svelte";
import type { ItemRecipe, StepItem } from "$lib/types/recipe";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-svelte";
import { DataTableLink } from "$lib/components/data-table";
import { formatDistanceToNowStrict } from "date-fns";

const columnHelper = createColumnHelper<ItemRecipe>();

function calculateRecipeMargin(recipe: ItemRecipe) {
  const inputs = recipe.children?.filter((step) => step.type === "input") ?? [];
  const buy = inputs.reduce(
    (sum, input) => sum + input.quantity * (input.low ?? 0),
    0,
  );
  const outputs =
    recipe.children?.filter((step) => step.type === "output") ?? [];
  const sell = outputs.reduce(
    (sum, step) =>
      sum +
      step.quantity * (step.high ?? 0) -
      calculateTax((step.high ?? 0) * step.quantity, step.id),
    0,
  );
  return sell - buy;
}

function calculateRecipeTax(recipe: ItemRecipe) {
  return recipe.children
    ?.filter((step) => step.type === "output")
    .reduce(
      (sum, step) =>
        sum + calculateTax((step.high ?? 0) * step.quantity, step.id),
      0,
    );
}

export const columns = [
  columnHelper.display({
    id: "Expand",
    cell: (props) => {
      if (!props.row.getCanExpand()) {
        return null;
      }
      const expandComponent = props.row.getIsExpanded()
        ? ChevronDownIcon
        : ChevronRightIcon;
      return renderComponent(expandComponent, {
        class: "size-5",
      });
    },
  }),
  columnHelper.accessor("name", {
    header: "Name",
    enableSorting: false,
    cell: (info) => {
      if ("children" in info.row.original) {
        return info.getValue();
      }

      const value =
        (info.row.original as StepItem).quantity +
        " × " +
        info.row.original.name;

      return renderComponent(DataTableLink, {
        value,
        href: `/items/${info.row.original.id}`,
      });
    },
  }),
  columnHelper.accessor("highTime", {
    header: "Last Bought",
    cell: (info) => {
      let value: number | undefined;
      if (typeof info.row.original.children !== "undefined") {
        value = Math.max(
          ...info.row.original.children
            .map((step) => step.highTime)
            .filter((highTime) => typeof highTime === "number"),
        );
      } else {
        value = info.getValue();
      }

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
    enableSorting: false,
  }),
  columnHelper.accessor("lowTime", {
    header: "Last Sold",
    cell: (info) => {
      let value: number;
      if (typeof info.row.original.children !== "undefined") {
        value = Math.max(
          ...info.row.original.children
            .map((step) => step.lowTime)
            .filter((lowTime) => typeof lowTime === "number"),
        );
      } else {
        value = info.getValue<number>();
      }

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
    enableSorting: false,
  }),
  columnHelper.accessor((row) => row, {
    header: "Cost",
    id: "cost",
    cell: (info) => {
      let value = 0;
      if (!("children" in info.getValue())) {
        value =
          ((info.getValue() as StepItem).type === "input"
            ? info.getValue().low
            : 0) ?? 0;
      } else {
        value =
          info
            .getValue()
            .children?.filter((step) => step.type === "input")
            .reduce(
              (sum, current) => sum + current.quantity * (current.low ?? 0),
              0,
            ) ?? 0;
      }
      return renderComponent(DataTableCell, {
        class: cn(styleSignedNumberCell(-value), "flex justify-end"),
        value: formatNumberCell(-value) || "-",
      });
    },
    enableSorting: false,
  }),
  columnHelper.accessor((row) => row, {
    header: "Price",
    id: "price",
    cell: (info) => {
      let value = 0;
      if (!("children" in info.getValue())) {
        value =
          ((info.getValue() as StepItem).type === "output"
            ? info.getValue().high
            : 0) ?? 0;
      } else {
        value =
          info
            .getValue()
            .children?.filter((step) => step.type === "output")
            .reduce((sum, current) => sum + (current.high ?? 0), 0) ?? 0;
      }
      return renderComponent(DataTableCell, {
        class: cn(styleSignedNumberCell(value), "flex justify-end"),
        value: formatNumberCell(value) || "-",
      });
    },
    enableSorting: false,
  }),
  columnHelper.accessor((row) => row, {
    id: "tax",
    header: "Tax",
    cell: (info) => {
      let value: number | undefined = 0;
      if (!("children" in info.getValue())) {
        value =
          (info.getValue() as StepItem).type === "output"
            ? calculateTax(info.getValue().high ?? 0, info.getValue().id)
            : 0;
      } else {
        value = calculateRecipeTax(info.getValue());
      }

      const negatedValue = value ? -value : null;

      return renderComponent(DataTableCell, {
        class: cn(styleSignedNumberCell(negatedValue), "flex justify-end"),
        value: formatNumberCell(negatedValue) || "-",
      });
    },
    enableSorting: false,
  }),
  columnHelper.accessor((row) => row, {
    id: "profit",
    header: "Profit",
    cell: (info) => {
      let margin = 0;
      if (!("children" in info.getValue())) {
        const high = info.getValue().high ?? 0;
        const low = info.getValue().low ?? 0;
        const tax = calculateTax(high, info.getValue().id);

        if ((info.getValue() as StepItem).type === "input") {
          margin = -low;
        } else if ((info.getValue() as StepItem).type === "output") {
          margin = high - tax;
        }
      } else {
        margin = calculateRecipeMargin(info.getValue());
      }
      return renderComponent(DataTableCell, {
        class: cn(styleSignedNumberCell(margin), "flex justify-end"),
        value: getSignedPrefix(margin) + formatNumberCell(margin) || "-",
      });
    },
    sortingFn: (a, b) => {
      return (
        calculateRecipeMargin(a.original) - calculateRecipeMargin(b.original)
      );
    },
  }),
];
