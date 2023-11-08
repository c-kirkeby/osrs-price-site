<script>
  import { page } from "$app/stores";
  import { MenuIcon, X, GaugeIcon, ListIcon } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import "../app.postcss";

  let menuItems = [
    { href: "/", title: "Home", icon: GaugeIcon },
    { href: "/items", title: "Items", icon: ListIcon },
  ];

  let showMobileMenu = false;
</script>

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
