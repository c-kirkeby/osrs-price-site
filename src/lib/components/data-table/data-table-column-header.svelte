<script lang="ts">
  import { cn } from "$lib/utils";
  import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";

  let className: string | undefined | null = undefined;

  export { className as class };
  export let props: {
    sort: {
      order?: "asc" | "desc";
      toggle: (event: Event) => void;
      clear: () => void;
      disabled: boolean;
    };
  };

  function handleSort(event: Event, order: "asc" | "desc") {
    if (props.sort.order === order) {
      return;
    }
    props.sort.toggle(event);
  }
</script>

{#if !props.sort.disabled}
  <div class={cn("flex items-center", className)}>
    <DropdownMenu.Root positioning={{ placement: "bottom-start" }}>
      <DropdownMenu.Trigger asChild let:builder>
        <Button
          variant="ghost"
          builders={[builder]}
          class="-ml-3 h-8 data-[state-open]:bg-accent"
        >
          <span class="capitalize">
            <slot />
          </span>
          {#if props.sort.order === "asc"}
            <ArrowUp class="w-4 h-4 ml-2" />
          {:else if props.sort.order === "desc"}
            <ArrowDown class="w-4 h-4 ml-2" />
          {:else}
            <ChevronsUpDown class="w-4 h-4 ml-2" />
          {/if}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item on:click={(event) => handleSort(event, "asc")}>
          <ArrowUp class="w-4 h-4 mr-2" />
          Asc</DropdownMenu.Item
        >
        <DropdownMenu.Item on:click={(event) => handleSort(event, "desc")}>
          <ArrowDown class="w-4 h-4 mr-2" />
          Desc</DropdownMenu.Item
        >
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
{/if}
