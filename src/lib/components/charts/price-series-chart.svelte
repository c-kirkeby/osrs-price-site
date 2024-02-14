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
  import { format } from "date-fns/format";
  import { formatDistanceToNowStrict } from "date-fns";

  const formatter = new Intl.NumberFormat();

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
      <div class="grid gap-2 grid-cols-2">
          <div class="text-xs col-span-2">${format(
            new Date(data.timestamp * 1000),
            "yyyy-MM-dd HH:mm:ss",
          )}</div>
          <div class="text-xs">
            <svg class="inline-block align-baseline" height="10" width="10"><circle cx="5" cy="5" r="5" fill="var(--vis-color0)" /></svg>
            Buy Price
            </div>
          <div class="text-xs">${formatter.format(data.avgHighPrice)}</div>
          <div class="text-xs">
            <svg class="inline-block align-baseline" height="10" width="10"><circle cx="5" cy="5" r="5" fill="var(--vis-color1)" /></svg>
            Sell Price</div>
          <div class="text-xs">${formatter.format(data.avgLowPrice)}</div>
      </div>
    `;
  };
</script>

{#if data.length > 0}
  <VisXYContainer class="font-sans text-muted-foreground" height="200">
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
  <div class="h-[200px] flex items-center text-xl justify-center">No data</div>
{/if}
