<script lang="ts">
  import { MainNav, MobileNav } from "$lib/components/nav";
  import ThemeToggle from "$lib/components/theme-toggle.svelte";
  import CommandMenu from "$lib/components/command-menu.svelte";
  import SettingsMenu from "$lib/components/settings-menu.svelte";
</script>

<header
  class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
  <div class="container flex h-14 max-w-screen-2xl items-center">
    <MainNav />
    <MobileNav />
    <div
      class="flex flex-1 items-center justify-between space-x-2 md:justify-end"
    >
      <div class="w-full flex-1 md:w-auto md:flex-none">
        <CommandMenu />
      </div>
      <nav class="flex items-center">
        <ThemeToggle />
        <SettingsMenu />
      </nav>
    </div>
  </div>
</header>
