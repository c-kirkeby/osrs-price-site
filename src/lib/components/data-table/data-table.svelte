<script lang="ts" generics="T">
  import DataTableColumnHeader from "./data-table-column-header.svelte";
  import type { AnyPlugins } from "svelte-headless-table/lib/types/TablePlugin";
  import {
    Render,
    Subscribe,
    type TableViewModel,
  } from "svelte-headless-table";
  import * as Table from "$lib/components/ui/table";
  import DataTablePagination from "./data-table-pagination.svelte";

  export let tableModel: TableViewModel<T, AnyPlugins>;

  const { headerRows, pageRows, tableAttrs, tableBodyAttrs } = tableModel;
</script>

<div class="space-y-4">
  <div class="rounded-md border">
    <Table.Root {...$tableAttrs}>
      <Table.Header>
        {#each $headerRows as headerRow}
          <Subscribe rowAttrs={headerRow.attrs()}>
            <Table.Row>
              {#each headerRow.cells as cell (cell.id)}
                <Subscribe
                  attrs={cell.attrs()}
                  let:attrs
                  props={cell.props()}
                  let:props
                >
                  <Table.Head class="p-2" {...attrs}>
                    <!-- @todo fix this type issue - props seems to be generic -->
                    <DataTableColumnHeader {props}
                      ><Render of={cell.render()} /></DataTableColumnHeader
                    >
                  </Table.Head>
                </Subscribe>
              {/each}
            </Table.Row>
          </Subscribe>
        {/each}
      </Table.Header>
      <Table.Body {...$tableBodyAttrs}>
        {#each $pageRows as row (row.id)}
          <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
            <Table.Row {...rowAttrs}>
              {#each row.cells as cell}
                <Subscribe attrs={cell.attrs()} let:attrs>
                  <Table.Cell class="p-2" {...attrs}>
                    <Render of={cell.render()} />
                  </Table.Cell>
                </Subscribe>
              {/each}
            </Table.Row>
          </Subscribe>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
  <DataTablePagination {tableModel} />
</div>
