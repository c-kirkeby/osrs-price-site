<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Switch } from "$lib/components/ui/switch";
  import { Label } from "$lib/components/ui/label";
  import * as Popover from "$lib/components/ui/popover";
  import { settings } from "$lib/stores/settings";
  import { SettingsIcon } from "lucide-svelte";
</script>

<Popover.Root portal={null}>
  <Popover.Trigger asChild let:builder>
    <Button builders={[builder]} variant="ghost" size="icon">
      <span class="sr-only">Settings</span>
      <SettingsIcon class="h-4 w-4" />
    </Button>
  </Popover.Trigger>
  <Popover.Content class="grid gap-6">
    <div class="flex items-center justify-between space-x-2">
      <Label for="necessary" class="flex flex-col space-y-1">
        <span>Compact Mode</span>
        <span class="text-xs font-normal leading-snug text-muted-foreground">
          Turning this off will make the content take up the full width.
        </span>
      </Label>
      <Switch
        id="compact"
        bind:checked={$settings.compact}
        onCheckedChange={() =>
          settings.update((store) => ({
            ...store,
            compact: !$settings.compact,
          }))}
      />
    </div>
  </Popover.Content>
</Popover.Root>
