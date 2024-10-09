import "@tanstack/svelte-table";

declare module "@tanstack/svelte-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    hideHeader?: boolean;
  }
}
