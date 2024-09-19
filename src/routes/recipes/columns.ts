import {
  calculateMargin,
  calculateTax,
  cn,
  formatNumberCell,
  getSignedPrefix,
  styleSignedNumberCell,
} from "$lib/utils";
import { createColumnHelper, renderComponent } from "@tanstack/svelte-table";
import DataTableCell from "$lib/components/data-table/data-table-cell.svelte";

const columnHelper = createColumnHelper<{
  name: string;
  materials: string;
  cost: number;
  price: number;
  outcome: string;
  profit: number;
}>();

function calculateRecipeMargin(recipe) {
  const cost = recipe.inputs.reduce(
    (sum, input) => sum + input.quantity * input.high,
    0,
  );
  const price = recipe.outputs.reduce(
    (sum, output) =>
      sum +
      output.quantity * output.low -
      calculateTax(output.low, output.id) * output.quantity,
    0,
  );
  return price - cost;
}

function calculateRecipeTax(recipe) {
  return recipe.outputs.reduce(
    (sum, output) =>
      sum + calculateTax(output.low, output.id) * output.quantity,
    0,
  );
}

export const columns = [
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.group({
    header: "Inputs",
    columns: [
      columnHelper.accessor((row) => row, {
        id: "materials",
        cell: (info) => {
          const recipe = info.getValue();
          return recipe.inputs.map(
            (input) => input.quantity + " × " + input.name + "\n",
          );
        },
      }),
      columnHelper.accessor((row) => row, {
        id: "cost",
        cell: (info) => {
          const recipe = info.getValue();
          return recipe.inputs.map(
            (input) =>
              input.quantity + " × " + formatNumberCell(input.high) + "\n",
          );
        },
      }),
    ],
  }),
  columnHelper.group({
    header: "Outputs",
    columns: [
      columnHelper.accessor((row) => row, {
        id: "outcome",
        cell: (info) => {
          const recipe = info.getValue();
          return recipe.outputs.map(
            (output) =>
              formatNumberCell(output.quantity) + " × " + output.name + "\n",
          );
        },
      }),
      columnHelper.accessor((row) => row, {
        id: "price",
        cell: (info) => {
          const recipe = info.getValue();
          return recipe.outputs.map(
            (output) =>
              output.quantity + " × " + formatNumberCell(output.high) + "\n",
          );
        },
      }),
    ],
  }),
  columnHelper.accessor((row) => row, {
    id: "tax",
    header: "Gross Tax",
    cell: (info) => {
      const recipe = info.getValue();
      const tax = calculateRecipeTax(recipe);

      return renderComponent(DataTableCell, {
        class: cn("flex justify-end"),
        value: formatNumberCell(tax) || "-",
      });
    },
    sortingFn: (a, b) => {
      return calculateRecipeTax(a.original) - calculateRecipeTax(b.original);
    },
  }),
  columnHelper.accessor((row) => row, {
    id: "profit",
    header: "Profit",
    cell: (info) => {
      const recipe = info.getValue();
      const margin = calculateRecipeMargin(recipe);

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
