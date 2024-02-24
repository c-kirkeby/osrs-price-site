<script lang="ts" generics="T">
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";
  import type { AnyPlugins } from "svelte-headless-table/plugins";
  import type { TableViewModel } from "svelte-headless-table";
  import { SlidersHorizontalIcon } from "lucide-svelte";

  export let tableModel: TableViewModel<T, AnyPlugins>;
  const { pluginStates, flatColumns } = tableModel;
  const { hiddenColumnIds } = pluginStates.hide;

  const ids = flatColumns.map((column) => column.id);

  let hideForId = Object.fromEntries(
    ids.map((id) =>
      !$hiddenColumnIds.includes(id) ? [id, true] : [id, false],
    ),
  );
  $: $hiddenColumnIds = Object.entries(hideForId)
    .filter(([, hide]) => !hide)
    .map(([id]) => id);
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild let:builder>
    <Button
      variant="outline"
      size="sm"
      class="ml-auto hidden h-8 md:flex"
      builders={[builder]}
    >
      <SlidersHorizontalIcon class="mr-2 h-4 w-4" /> Columns
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Label>Toggle columns</DropdownMenu.Label>
    {#each flatColumns as column}
      <DropdownMenu.CheckboxItem bind:checked={hideForId[column.id]}>
        {column.header}
      </DropdownMenu.CheckboxItem>
    {/each}
  </DropdownMenu.Content>
</DropdownMenu.Root>
