<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Command from "$lib/components/ui/command";
  import type { Item } from "$lib/types/item";
  import { searchHistory } from "$lib/stores/search-history";
  import { getUserOperatingSystem } from "$lib/utils";
  import { type ComponentProps } from "svelte";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { X, Sun, Moon, Laptop } from "lucide-svelte";
  import { resetMode, setMode } from "mode-watcher";
  import { createItemsIndex, searchItemsIndex } from "$lib/search";
  import { itemsStore } from "$lib/stores/items";

  let restProps: ComponentProps<typeof Button> = $props();

  let open = $state(false);
  let value = $state("");
  let results: Item[] = $state([]);
  let status: "loading" | "ready" = $state("loading");
  const platform = browser && getUserOperatingSystem();

  $effect(() => {
    if ($itemsStore?.length && $itemsStore.length > 0) {
      createItemsIndex($itemsStore);
      status = "ready";
    }
  });

  $effect(() => {
    if (status === "ready") {
      const search = async () => {
        results = await searchItemsIndex(value);
      };
      search();
    }
  });

  function runCommand(command: () => void) {
    open = false;
    command();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      open = true;
    }
  }
</script>

<svelte:document onkeydown={handleKeydown} />

<Button
  variant="outline"
  class="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
  onclick={() => (open = true)}
  {...restProps}
>
  <span class="hidden lg:inline-flex"> Search items </span>
  <span class="inline-flex lg:hidden">Search</span>
  <kbd
    class="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[10px] font-medium opacity-100 sm:flex"
  >
    <span class="text-xs"
      >{platform === "MacOS" ? "⌘" : "Ctrl"} <span>K</span></span
    >
  </kbd>
</Button>
<Command.Dialog bind:open shouldFilter={false}>
  <Command.Input placeholder="Type a command or search" bind:value />
  <Command.List>
    <Command.Empty>No results found.</Command.Empty>
    {#if results.length > 0}
      <Command.Group heading="Items">
        {#each results.slice(0, 5) as result}
          <Command.Item
            onSelect={() =>
              runCommand(() => {
                open = false;
                searchHistory.add(result);
                goto(`/items/${result.id}`);
              })}
          >
            <img
              src={`https://oldschool.runescape.wiki/images/${encodeURIComponent(
                result.icon?.replaceAll(" ", "_") ?? "",
              )}`}
              alt={result.name}
              class="object-contain inline-block mr-2 h-4 w-4"
            />
            {result.name}
          </Command.Item>
        {/each}
      </Command.Group>
      <Command.Separator />
    {/if}
    {#if $searchHistory.length > 0}
      <Command.Group heading="History">
        {#each $searchHistory as item}
          <Command.Item
            onSelect={() =>
              runCommand(() => {
                open = false;
                goto(`/items/${item.id}`);
              })}
          >
            <img
              src={`https://oldschool.runescape.wiki/images/${encodeURIComponent(
                item.icon?.replaceAll(" ", "_") ?? "",
              )}`}
              alt={item.name}
              class="object-contain inline-block mr-2 h-4 w-4"
            />
            {item.name}
            <Button
              variant="ghost"
              size="sm"
              class="ml-auto h-5"
              on:click={(event) => {
                event.stopPropagation();
                searchHistory.remove(item);
              }}
            >
              <X class="h-0.5" />
            </Button>
          </Command.Item>
        {/each}
      </Command.Group>
      <Command.Separator />
    {/if}
    <Command.Group heading="Theme">
      <Command.Item
        value="light"
        onSelect={() => runCommand(() => setMode("light"))}
      >
        <Sun class="mr-2 h-4 w-4" />
        Light
      </Command.Item>
      <Command.Item
        value="dark"
        onSelect={() => runCommand(() => setMode("dark"))}
      >
        <Moon class="mr-2 h-4 w-4" />
        Dark
      </Command.Item>
      <Command.Item
        value="system"
        onSelect={() => runCommand(() => resetMode())}
      >
        <Laptop class="mr-2 h-4 w-4" />
        System
      </Command.Item>
    </Command.Group>
  </Command.List>
</Command.Dialog>
