<script lang="ts" generics="TData, TValue">
  import type { Column } from "@tanstack/svelte-table";

  import { cn } from "$lib/utils";
  import {
    ArrowDown,
    ArrowUp,
    ChevronsUpDown,
    EyeOffIcon,
  } from "lucide-svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";

  let className: string | undefined | null = undefined;

  export { className as class };
  export let column: Column<TData, TValue>;
</script>

{#if !column.getCanSort()}
  <div class={className}><slot /></div>
{:else}
  {@const isSorted = column.getIsSorted()}
  <div class={cn("flex items-center", className)}>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild let:builder>
        <Button
          variant="ghost"
          builders={[builder]}
          class="-ml-3 h-8 data-[state-open]:bg-accent"
        >
          <span class="capitalize">
            <slot />
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
        <DropdownMenu.Item on:click={() => column.toggleSorting(false)}>
          <ArrowUp class="w-4 h-4 mr-2" />
          Asc
        </DropdownMenu.Item>
        <DropdownMenu.Item on:click={() => column.toggleSorting(true)}>
          <ArrowDown class="w-4 h-4 mr-2" />
          Desc
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item on:click={() => column.toggleVisibility(false)}>
          <EyeOffIcon class="w-4 h-4 mr-2" />
          Hide
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
{/if}
