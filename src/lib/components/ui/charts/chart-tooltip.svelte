<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { type ChartConfig, getPayloadConfigFromPayload } from "./index";
  import { cn } from "$lib/utils.js";
  type $$Props = HTMLAttributes<HTMLDivElement> & {
    payload: unknown;
    config: ChartConfig;
    tooltipLabel?: string;
    hideLabel?: boolean;
    indicator?: "line" | "dot" | "dashed";
    hideIndicator?: boolean;
    nestLabel?: boolean;
  };
  interface Props {
    payload: $$Props["payload"];
    config: $$Props["config"];
    tooltipLabel?: $$Props["tooltipLabel"];
    hideLabel?: $$Props["hideLabel"];
    indicator?: $$Props["indicator"];
    hideIndicator?: $$Props["hideIndicator"];
    nestLabel?: $$Props["nestLabel"];
    class?: $$Props["class"];
  }

  let {
    payload,
    config,
    tooltipLabel = undefined,
    hideLabel = false,
    indicator = "dot",
    hideIndicator = false,
    nestLabel = false,
    class: className = undefined
  }: Props = $props();
  
  let itemConfig = $derived(getPayloadConfigFromPayload(config, payload));
</script>

{#if itemConfig}
  <div
    class={cn(
      "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
      className,
    )}
  >
    {#if !hideLabel}
      {tooltipLabel}
    {/if}
    <div class="grid gap-1.5">
      {#each itemConfig as item}
        <div
          class={cn(
            "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
            indicator === "dot" && "items-center",
          )}
        >
          {#if item?.icon}
            <item.icon />
          {:else if !hideIndicator}
            <div
              class={cn(
                "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                {
                  "h-2.5 w-2.5": indicator === "dot",
                  "w-1": indicator === "line",
                  "w-0 border-[1.5px] border-dashed bg-transparent":
                    indicator === "dashed",
                  "my-0.5": nestLabel && indicator === "dashed",
                },
              )}
              style="--color-bg: {item?.color}; --color-border: {item?.color};"
></div>
          {/if}
          <div
            class={cn(
              "flex flex-1 justify-between leading-none",
              nestLabel ? "items-end" : "items-center",
            )}
          >
            <div class="grid gap-1.5">
              <span class="text-muted-foreground">
                {item?.label}
              </span>
            </div>
            <span class="text-foreground font-mono font-medium tabular-nums">
              {item?.value}
            </span>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
