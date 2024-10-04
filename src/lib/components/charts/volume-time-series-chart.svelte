<script lang="ts">
  import type { TimeSeries } from "$lib/types/time-series";
  import { BarChart, Tooltip } from "layerchart";
  import { formatDistanceToNowStrict, formatRelative } from "date-fns";
  import { scaleLinear, scaleTime, scaleUtc } from "d3-scale";
  import { max, min } from "d3-array";
  import ChartTooltip from "$lib/components/ui/charts/chart-tooltip.svelte";
  import capitalize from "lodash/capitalize";
  import { getCompactNumberFormatter, getNumberFormatter } from "$lib/utils";

  $: numberFormatter = getNumberFormatter();
  $: compactNumberFormatter = getCompactNumberFormatter();

  export let data: TimeSeries[];

  const chartConfig = {
    highPriceVolume: {
      label: "Buy Volume",
      color: "hsl(var(--chart-1))",
    },
    lowPriceVolume: {
      label: "Sell Volume",
      color: "hsl(var(--chart-5))",
    },
  };

  $: flatData = data.flatMap((d) =>
    [
      {
        date: new Date(d.timestamp * 1000),
        value: d.highPriceVolume,
        type: "high",
      },
      {
        date: new Date(d.timestamp * 1000),
        value: d.lowPriceVolume,
        type: "low",
      },
    ].filter((d) => d.value !== null),
  );

  let processedData: TimeSeries[];

  $: {
    let highPriceVolume: number | null = null;
    let lowPriceVolume: number | null = null;

    processedData = data.map((d) => {
      if (d.highPriceVolume !== null) {
        highPriceVolume = d.highPriceVolume;
      }
      if (d.lowPriceVolume !== null) {
        lowPriceVolume = d.lowPriceVolume;
      }
      return {
        ...d,
        lowPriceVolume,
        highPriceVolume,
      } as TimeSeries;
    });
    console.debug(processedData);
  }

  $: x = (x) => new Date(x.timestamp * 1000);
</script>

{#if data.length > 0}
  <div class="h-[250px] pb-4">
    <BarChart
      {x}
      data={processedData}
      padding={{
        top: 5,
        right: 10,
        left: 10,
        bottom: 0,
      }}
      props={{
        yAxis: {
          format: (data) => compactNumberFormatter.format(Math.abs(data)),
          tickLength: 0,
        },
        xAxis: {
          format: (date) =>
            formatDistanceToNowStrict(date, {
              addSuffix: true,
            }),
        },
      }}
      series={[
        {
          key: "highPriceVolume",
          color: chartConfig.highPriceVolume.color,
        },
        {
          key: "lowPriceVolume",
          color: chartConfig.lowPriceVolume.color,
          value: (d) => -d.lowPriceVolume,
        },
      ]}
    >
      <svelte:fragment slot="tooltip">
        <Tooltip.Root let:data variant="none">
          <ChartTooltip
            tooltipLabel={capitalize(
              formatRelative(
                new Date(data.timestamp * 1000),
                new Date(),
              ).slice(),
            )}
            config={chartConfig}
            payload={{
              ...data,
              highPriceVolume: numberFormatter.format(data.highPriceVolume),
              lowPriceVolume: numberFormatter.format(data.lowPriceVolume),
            }}
            indicator="dot"
          />
        </Tooltip.Root>
      </svelte:fragment>
    </BarChart>
  </div>
{:else}
  <div class="h-[250px] flex items-center text-xl justify-center">No data</div>
{/if}
