<script>
  import { page } from "$app/stores";
  import { Button } from "$lib/components/ui/button";
  import { GaugeIcon, ListIcon } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import "../app.postcss";
</script>

<div class="hidden space-y-6 p-10 pb-16 md:block">
  <div class="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
    <aside class="-mx-4 lg:w-1/12">
      <nav class="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
        {#each [{ href: "/", title: "Home", icon: GaugeIcon }, { href: "/items", title: "Items", icon: ListIcon }] as { href, title, icon }}
          <Button
            {href}
            variant="ghost"
            class={cn(
              $page.url.pathname === href
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start",
            )}
          >
            <svelte:component this={icon} class="h-4 w-4 mr-2" />
            {title}
          </Button>
        {/each}
      </nav>
    </aside>
    <main class="flex-1">
      <slot />
    </main>
  </div>
</div>
