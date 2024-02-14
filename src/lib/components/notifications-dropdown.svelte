<script lang="ts">
  import { AlertTriangle } from "lucide-svelte";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { cn } from "$lib/utils";

  export let notifications: {
    message: string;
  }[] = [];
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild let:builder class="w-[180px]">
    <Button
      builders={[builder]}
      variant="outline"
      size="sm"
      class="h-8 relative px-2"
      disabled={notifications.length === 0}
    >
      <AlertTriangle class="h-4 w-4" />
      <Badge
        class={cn("rounded-full absolute -right-1.5 -top-1.5 h-3 w-3 px-0", {
          hidden: notifications.length === 0,
        })}
      ></Badge>
    </Button>
  </DropdownMenu.Trigger>

  <DropdownMenu.Content>
    <DropdownMenu.Label>Notifications</DropdownMenu.Label>
    {#each notifications as notification}
      <DropdownMenu.Item>
        <AlertTriangle class="mr-2 h-4 w-4" />
        <span>{notification.message}</span>
      </DropdownMenu.Item>
    {/each}
  </DropdownMenu.Content>
</DropdownMenu.Root>
