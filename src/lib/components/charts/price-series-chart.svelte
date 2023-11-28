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

  const formatter = new Intl.NumberFormat();

  export let data: TimeSeries[];

  const x = (data: TimeSeries) => data.timestamp;
  const y = [
    (data: TimeSeries) => data.avgHighPrice,
    (data: TimeSeries) => data.avgLowPrice,
  ];
  const triggers = {
    [Line.selectors.line]: (data: TimeSeries) => data.avgHighPrice,
  };
  const XTickFormat = (tick: number) =>
    new Date(tick * 1000).toLocaleDateString();

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
          <div class="text-xs col-span-2">${new Date(
            data.timestamp * 1000,
          ).toLocaleDateString()}</div>
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
  <VisXYContainer {data} class="font-sans text-muted-foreground" height="400">
    <VisLine {x} {y} />
    <VisTooltip {triggers} />
    <VisAxis type="x" tickFormat={XTickFormat} gridLine={false} />
    <VisAxis type="y" tickFormat={YTickFormat} gridLine={false} />
    <VisScatter {x} {y} size={5} />
    <VisBulletLegend {items} />
    <VisCrosshair {template} />
  </VisXYContainer>
{:else}
  <div class="h-[400px] flex items-center text-xl justify-center">No data</div>
{/if}
