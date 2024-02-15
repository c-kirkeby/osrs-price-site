<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Command from "$lib/components/ui/command";
  import type { Item } from "$lib/db/schema";
  import { searchHistory } from "$lib/stores/searchHistory";
  import { asyncDebounce } from "$lib/utils";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { X, Sun, Moon, Laptop } from "lucide-svelte";
  import { resetMode, setMode } from "mode-watcher";

  let open = false;
  let value = "";
  let items: Item[] = [];
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
  <span class="hidden lg:inline-flex"> Search items </span>
  <span class="inline-flex lg:hidden">Search</span>
  <kbd
    class="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[10px] font-medium opacity-100 sm:flex"
  >
    <span class="text-xs">Ctrl <span>K</span></span>
  </kbd>
</Button>
<Command.Dialog bind:open>
  <Command.Input
    placeholder="Type a command or search"
    on:input={asyncDebounce(handleInput, 300)}
    bind:value
  />
  <Command.List>
    <Command.Empty>No results found.</Command.Empty>
    {#if items.length > 0}
      <Command.Group heading="Items">
        {#each items as item}
          <Command.Item
            onSelect={() =>
              runCommand(() => {
                open = false;
                searchHistory.add(item);
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
              on:click={() => searchHistory.remove(item)}
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
