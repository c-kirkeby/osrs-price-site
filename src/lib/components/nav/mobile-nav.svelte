<script lang="ts">
  import * as Sheet from "$lib/components/ui/sheet";
  import { Button } from "$lib/components/ui/button";
  import { MenuIcon, HandCoinsIcon } from "lucide-svelte";
  import { MobileLink } from "$lib/components/nav";
  import { config } from "$lib/config";

  let open = false;
</script>

<Sheet.Root bind:open>
  <Sheet.Trigger asChild let:builder>
    <Button
      builders={[builder]}
      variant="ghost"
      class="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
    >
      <MenuIcon class="h-5 w-5" />
      <span class="sr-only">Toggle Menu</span>
    </Button>
  </Sheet.Trigger>
  <Sheet.Content side="left" class="pr-0">
    <MobileLink href="/" class="flex items-center" bind:open>
      <HandCoinsIcon class="mr-2 h-4 w-4" />

      <span class="font-bold">OSRS Price Site</span>
    </MobileLink>
    <div class="my-4 h-[calc(100vh-8rem)] pb-10 pl-6 overflow-auto">
      <div class="flex flex-col space-y-3">
        {#each config.menu as { href, label }}
          <MobileLink {href} bind:open class="text-foreground"
            >{label}</MobileLink
          >
        {/each}
      </div>
    </div>
  </Sheet.Content>
</Sheet.Root>
