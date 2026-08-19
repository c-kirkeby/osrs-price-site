<script lang="ts" generics="TData extends RowData, TValue">
  import type { Column, RowData } from "@tanstack/svelte-table";
  import type { DataTableFeatures } from "$lib/components/data-table/features";

  import { cn } from "$lib/utils";
  import {
    ArrowDown,
    ArrowUp,
    ChevronsUpDown,
    EyeOffIcon,
  } from "@lucide/svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";

  interface Props {
    class?: string | undefined | null;
    column: Column<DataTableFeatures, TData, TValue>;
    children?: import("svelte").Snippet;
  }

  let { class: className = undefined, column, children }: Props = $props();
</script>

{#if !column.getCanSort()}
  <div class={className}>
    {#if !column.columnDef.meta?.hideHeader}
      {@render children?.()}
    {/if}
  </div>
{:else}
  {@const isSorted = column.getIsSorted()}
  <div class={cn("flex items-center", className)}>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="ghost" class="-ml-3 h-8 data-[state-open]:bg-accent">
          <span class="capitalize">
            {@render children?.()}
          </span>
          {#if isSorted === "asc"}
            <ArrowUp class="w-4 h-4 ml-2" />
          {:else if isSorted === "desc"}
            <ArrowDown class="w-4 h-4 ml-2" />
          {:else}
            <ChevronsUpDown class="w-4 h-4 ml-2" />
          {/if}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onclick={() => column.toggleSorting(false)}>
          <ArrowUp class="w-4 h-4 mr-2" />
          Asc
        </DropdownMenu.Item>
        <DropdownMenu.Item onclick={() => column.toggleSorting(true)}>
          <ArrowDown class="w-4 h-4 mr-2" />
          Desc
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onclick={() => column.toggleVisibility(false)}>
          <EyeOffIcon class="w-4 h-4 mr-2" />
          Hide
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
{/if}
