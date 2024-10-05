<script lang="ts">
  import * as Select from "$lib/components/ui/select";

  export let options = [
    { value: "5m", label: "Last day" },
    { value: "1h", label: "Last 7 days" },
    { value: "6h", label: "Last 30 days" },
    { value: "24h", label: "Last 12 months" },
  ];
</script>

<Select.Root {...$$restProps}>
  <Select.Trigger
    class="w-[160px] rounded-lg sm:ml-auto"
    aria-label="Select an interval"
  >
    <Select.Value placeholder="Select an interval" />
  </Select.Trigger>
  <Select.Content class="rounded-xl">
    <Select.Group>
      {#each options as { value, label }}
        <Select.Item {value} {label}>{label}</Select.Item>
      {/each}
    </Select.Group>
  </Select.Content>
  <Select.Input name="interval" />
</Select.Root>
