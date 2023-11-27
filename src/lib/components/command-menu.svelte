<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Command from "$lib/components/ui/command";
  import type { Item } from "$lib/db/schema";
  import { onMount } from "svelte";
  import Input from "./ui/input/input.svelte";
  import { goto } from "$app/navigation";

  let open = false;
  let value = "";
  let items: Partial<Item>[] = [];
  let loading = false;

  async function handleInput() {
    if (value.length < 2) {
      items = [];
      return;
    }
    if (loading !== true) {
      loading = true;

      items = await (
        await fetch(
          `/items?fields[items]=name&fields[items]=id&fields[items]=icon&filter[name]=${value}`,
        )
      ).json();

      loading = false;
    }
  }

  function runCommand(command: () => void) {
    open = false;
    command();
  }

  onMount(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        open = !open;
      }
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  });
</script>

<Button
  variant="outline"
  class="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
  on:click={() => (open = true)}
  {...$$restProps}
>
  <span class="hidden lg:inline-flex">Search items</span>
  <span class="inline-flex lg:hidden">Search</span>
  <kbd
    class="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex"
  >
    <span>Ctrl</span>K
  </kbd>
</Button>
<Command.Dialog bind:open>
  <Command.Input
    placeholder="Type a command or search"
    on:input={handleInput}
    bind:value
  />
  <!-- <Input
    placeholder="Type a command or search"
    bind:value
    on:input={handleInput}
  /> -->
  <Command.List>
    {#if items.length === 0}
      <Command.Empty>No results found.</Command.Empty>
    {:else}
      <Command.Group heading="Item">
        {#each items as item}
          <Command.Item
            onSelect={() =>
              runCommand(() => {
                open = false;
                goto(`/items/${item.id}`);
              })}
          >
            <img
              src={`https://oldschool.runescape.wiki/images/${encodeURIComponent(
                item.icon?.replaceAll(" ", "_"),
              )}`}
              alt={item.name}
              class="object-contain inline-block mr-2 h-4 w-4"
            />
            {item.name}
          </Command.Item>
        {/each}
      </Command.Group>
    {/if}
  </Command.List>
</Command.Dialog>
