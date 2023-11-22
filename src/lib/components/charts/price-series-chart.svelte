<script lang="ts">
  import type { TimeSeries } from "$lib/types/time-series";
  import {
    VisAxis,
    VisBulletLegend,
    VisCrosshair,
    VisLine,
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
      <div class="flex gap-2 flex-col">
        <div class="flex flex-row justify-between">
          <div class="text-xs">Date</div>
          <div class="text-xs">${new Date(
            data.timestamp * 1000,
          ).toLocaleDateString()}</div>
        </div>
        <div class="flex flex-row justify-between">
          <div class="text-xs">Buy Price</div>
          <div class="text-xs">${formatter.format(data.avgHighPrice)}</div>
        </div>
        <div class="flex flex-row justify-between">
          <div class="text-xs">Sell Price</div>
          <div class="text-xs">${formatter.format(data.avgLowPrice)}</div>
        </div>
      </div>
    `;
  };
</script>

<VisXYContainer {data} class="font-sans text-muted-foreground" height={400}>
  <VisLine {x} {y} />
  <VisTooltip {triggers} />
  <VisAxis type="x" tickFormat={XTickFormat} gridLine={false} />
  <VisAxis type="y" tickFormat={YTickFormat} gridLine={false} />
  <VisBulletLegend {items} />
  <VisCrosshair {template} />
</VisXYContainer>
