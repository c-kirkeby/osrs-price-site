<script lang="ts">
  import { page } from "$app/stores";
  import { ModeWatcher } from "mode-watcher";
  import { MenuIcon, X, GaugeIcon, ListIcon } from "lucide-svelte";
  import { cn, poll } from "$lib/utils";
  import "../app.postcss";
  import ThemeToggle from "$lib/components/theme-toggle.svelte";
  import CommandMenu from "$lib/components/command-menu.svelte";
  import { getItem } from "$lib/api/item";
  import { natureRune, natureRuneItemId } from "$lib/stores/alch";

  let menuItems = [
    { href: "/", title: "Home", icon: GaugeIcon },
    { href: "/items", title: "Items", icon: ListIcon },
  ];

  let showMobileMenu = false;

  export let data;

  $natureRune = data.natureRunePrice;

  poll(async () => {
    try {
      const response = await getItem(natureRuneItemId, [
        "id",
        "buy_price",
        "buy_price_timestamp",
        "last_updated",
      ]);
      if (response) {
        $natureRune = response;
      }
    } catch (error) {
      console.error("Failed to fetch nature rune price", error);
    }
  }, 30_000);
</script>

<ModeWatcher />
<div class="min-h-screen bg-background font-sans antialiased">
  <div class="flex min-h-screen flex-col space-y-6">
    <header class="sticky sticky-top-0 z-40 border-b bg-background">
      <div class="container flex h-16 items-center justify-between py-4">
        <nav class="hidden gap-6 md:flex">
          {#each menuItems as { href, title }}
            <a
              {href}
              class={cn(
                "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm",
                $page.url.pathname === href
                  ? "text-foreground"
                  : "text-foreground/60",
              )}
            >
              {title}
            </a>
          {/each}
        </nav>
        <CommandMenu />
        <ThemeToggle />
        <button
          class="flex items-center space-x-2 md:hidden"
          on:click={() => (showMobileMenu = !showMobileMenu)}
        >
          {#if showMobileMenu}
            <X />
          {:else}
            <MenuIcon />
          {/if}
          <span class="font-bold">Menu</span>
        </button>
      </div>
    </header>
    <div class="container grid">
      <main class="flex w-full flex-1 flex-col overflow-hidden">
        <slot />
      </main>
    </div>
  </div>
</div>
