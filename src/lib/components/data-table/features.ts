import {
  tableFeatures,
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  rowExpandingFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createSortedRowModel,
  createPaginatedRowModel,
  createExpandedRowModel,
  sortFns,
  filterFns,
  type TableState,
} from "@tanstack/svelte-table";

export const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  rowExpandingFeature,
  columnVisibilityFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  sortFns,
  filterFns,
});

export type DataTableFeatures = typeof features;
export type InitialTableState = Partial<TableState<DataTableFeatures>>;