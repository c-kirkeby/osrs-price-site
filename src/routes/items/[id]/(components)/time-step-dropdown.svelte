<script lang="ts">
  import * as Select from "$lib/components/ui/select";
  import type { TimeSeriesOption } from "$lib/types/time-series";

  let {
    options = [
      { value: "5m", label: "Last day" },
      { value: "1h", label: "Last 7 days" },
      { value: "6h", label: "Last 30 days" },
      { value: "24h", label: "Last 12 months" },
    ],
    selected,
    onSelectedChange,
  }: {
    options?: TimeSeriesOption[];
    selected: TimeSeriesOption;
    onSelectedChange?: (option: TimeSeriesOption) => void;
  } = $props();

  const triggerContent = $derived(
    options.find((option) => option.value === selected.value)?.label ??
      "Select an interval",
  );

  function handleValueChange(value: string) {
    const option = options.find((o) => o.value === value);
    if (option) onSelectedChange?.(option);
  }
</script>

<Select.Root
  type="single"
  value={selected.value}
  onValueChange={handleValueChange}
>
  <Select.Trigger class="w-40 rounded-lg sm:ml-auto">
    {triggerContent}
  </Select.Trigger>
  <Select.Content class="rounded-xl">
    <Select.Group>
      {#each options as { value, label }}
        <Select.Item {value} {label}>{label}</Select.Item>
      {/each}
    </Select.Group>
  </Select.Content>
</Select.Root>
