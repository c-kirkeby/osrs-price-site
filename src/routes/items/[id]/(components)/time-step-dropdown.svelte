<script lang="ts">
  import * as Select from "$lib/components/ui/select";
  import { Select as SelectPrimitive, type WithoutChildren } from "bits-ui";

  type Props = WithoutChildren<SelectPrimitive.RootProps> & {
    options: { value: string; label: string; disabled?: boolean }[];
    value: string;
  };

  let {
    options,
    value = $bindable<string>(""),
    ...restProps
  }: Props = $props();

  const triggerContent = $derived(
    options.find((option) => option.value === value)?.label ??
      "Select an interval",
  );
</script>

<Select.Root name="interval" bind:value={value as never} {...restProps}>
  <Select.Trigger class="w-[160px] rounded-lg sm:ml-auto">
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
