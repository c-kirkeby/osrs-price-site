<script lang="ts">
  import * as Select from "$lib/components/ui/select";

  export let selected: { value: string; label: string };

  const timeSteps = [
    { value: "5m", label: "1 Day" },
    { value: "1h", label: "7 Days" },
    { value: "6h", label: "1 Month" },
    { value: "24h", label: "1 Year" },
  ];
</script>

<Select.Root bind:selected>
  <Select.Trigger class="w-[180px]">
    <Select.Value placeholder="Select an interval" />
  </Select.Trigger>
  <Select.Content>
    <Select.Group>
      <Select.Label>Interval</Select.Label>
      {#each timeSteps as { value, label }}
        <Select.Item {value} {label}>{label}</Select.Item>
      {/each}
    </Select.Group>
  </Select.Content>
  <Select.Input name="interval" />
</Select.Root>
