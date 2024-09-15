<script lang="ts">
  import type { TimeSeries } from "$lib/types/time-series";
  import {
    VisAxis,
    VisBulletLegend,
    VisCrosshair,
    VisLine,
    VisScatter,
    VisTooltip,
    VisXYContainer,
  } from "@unovis/svelte";
  import { Line } from "@unovis/ts";
  import { formatDistanceToNowStrict, formatRelative } from "date-fns";
  import capitalize from "lodash/capitalize";

  const formatter = new Intl.NumberFormat("en-AU", {
    notation: "compact",
    compactDisplay: "short",
  });

  export let data: TimeSeries[];

  $: avgHighPriceSeries = data.filter((d) => d.avgHighPrice !== null);
  $: avgLowPriceSeries = data.filter((d) => d.avgLowPrice !== null);

  const x = (data: TimeSeries) => data.timestamp;
  const y = [
    (data: TimeSeries) => (data.avgHighPrice ? data.avgHighPrice : undefined),
    (data: TimeSeries) => (data.avgLowPrice ? data.avgLowPrice : undefined),
  ];

  const yAvgLowPrice = (data: TimeSeries) => data.avgLowPrice;
  const yAvgHighPrice = (data: TimeSeries) => data.avgHighPrice;

  const triggers = {
    [Line.selectors.line]: (data: TimeSeries) => data.avgHighPrice,
  };
  const XTickFormat = (tick: number) =>
    formatDistanceToNowStrict(new Date(tick * 1000), {
      addSuffix: true,
    });

  const YTickFormat = (tick: number) => formatter.format(tick);
  const items = [
    {
      name: "Buy Price",
    },
    {
      name: "Sell Price",
    },
  ];

  const template = (data: TimeSeries) => {
    return `
      <div class="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py text-xs shadow-xl">
        <div class="grid gap-1.5">
          <div class="text-xs col-span-2 text-foreground">
            ${capitalize(formatRelative(data.timestamp * 1000, new Date()).slice())}
          </div>
          <div class="grid gap-1.5">
            <div class="flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground">
              <div class="shrink-0 rounded-[2px] border-[var(--vis-color0)] bg-[var(--vis-color0)] w-2.5 h-2.5"></div>
              <div class="flex flex-1 justify-between leading-none">
                <span class="text-muted-foreground">Buy Price</span>
              </div>
              <span class="font-mono font-medium tabular-nums text-foreground">${formatter.format(data.avgHighPrice)}</span>
            </div>
            <div class="flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground">
              <div class="shrink-0 rounded-[2px] border-[var(--vis-color1)] bg-[var(--vis-color1)] w-2.5 h-2.5"></div>
              <div class="flex flex-1 justify-between leading-none">
                <span class="text-muted-foreground">Sell Price</span>
              </div>
              <span class="font-mono font-medium tabular-nums text-foreground">${formatter.format(data.avgLowPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  };
</script>

{#if data.length > 0}
  <VisXYContainer
    class="font-sans text-muted-foreground"
    height="250"
    padding={{
      top: 5,
      right: 10,
      left: 10,
      bottom: 0,
    }}
    --vis-tooltip-border-color="rgba(0, 0, 0, 0)"
    --vis-tooltip-background-color="rgba(0, 0, 0, 0)"
    --vis-dark-tooltip-border-color="rgba(0, 0, 0, 0)"
    --vis-dark-tooltip-background-color="rgba(0, 0, 0, 0)"
  >
    <VisLine
      curveType="linear"
      data={avgLowPriceSeries}
      {x}
      y={yAvgLowPrice}
      color="var(--vis-color1)"
    />
    <VisLine
      curveType="linear"
      data={avgHighPriceSeries}
      {x}
      y={yAvgHighPrice}
      color="var(--vis-color0)"
    />
    <VisTooltip {triggers} />
    <VisAxis type="x" tickFormat={XTickFormat} gridLine={false} />
    <VisAxis type="y" tickFormat={YTickFormat} gridLine={false} />
    <VisScatter {data} {x} {y} size={4} />
    <VisBulletLegend {items} />
    <VisCrosshair {data} {template} />
  </VisXYContainer>
{:else}
  <div class="h-[250px] flex items-center text-xl justify-center">No data</div>
{/if}
