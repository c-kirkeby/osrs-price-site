<script lang="ts">
  import { page } from "$app/stores";
  import { cn } from "$lib/utils";
  import { HandCoinsIcon } from "lucide-svelte";
  import { config } from "$lib/config";
</script>

<div class="mr-4 hidden md:flex">
  <a href="/" class="mr-6 flex items-center space-x-2">
    <HandCoinsIcon class="h-6 w-6" />
    <span class="hidden font-bold sm:inline-block">OSRS Price Site</span>
  </a>
  <nav class="flex items-center gap-6 text-sm">
    {#each config.menu as { href, label }}
      <a
        {href}
        class={cn(
          "transition-colors hover:text-foreground/80",
          $page.url.pathname === href
            ? "text-foreground"
            : "text-foreground/60",
        )}
      >
        {label}
      </a>
    {/each}
  </nav>
</div>
