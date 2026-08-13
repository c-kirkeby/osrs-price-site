import "@tanstack/svelte-table";
import type { RowData, TableFeatures, CellData } from "@tanstack/table-core";

declare module "@tanstack/svelte-table" {
  interface ColumnMeta<
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  > {
    hideHeader?: boolean;
  }
}