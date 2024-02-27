<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import SettingsIcon from "lucide-svelte/icons/settings";

  import { settings } from "$lib/stores/settings";
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild let:builder>
    <Button builders={[builder]} variant="ghost" size="icon">
      <span class="sr-only">Settings</span>
      <SettingsIcon class="h-4 w-4" />
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.CheckboxItem
      bind:checked={$settings.compact}
      onCheckedChange={() =>
        settings.update((store) => ({ ...store, compact: !$settings.compact }))}
    >
      Compact Mode
    </DropdownMenu.CheckboxItem>
  </DropdownMenu.Content>
</DropdownMenu.Root>
