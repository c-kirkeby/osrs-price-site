<script lang="ts">
  import type { TimeSeries } from "$lib/types/time-series";
  import { BarChart, Tooltip } from "layerchart";
  import { formatDistanceToNowStrict, formatRelative } from "date-fns";
  import { scaleTime } from "d3-scale";
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

  $: x = (x) => new Date(x.timestamp * 1000);
</script>

{#if data.length > 0}
  <div class="h-[150px] pb-4">
    <BarChart
      {x}
      {data}
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
          tickLength: 0,
          ticks: (scale) => scaleTime(scale.domain(), scale.range()).ticks(),
        },
      }}
      series={[
        {
          key: "highPriceVolume",
          color: chartConfig.highPriceVolume.color,
          props: {
            strokeWidth: 0,
            radius: 0,
          },
        },
        {
          key: "lowPriceVolume",
          color: chartConfig.lowPriceVolume.color,
          value: (d) => -d.lowPriceVolume,
          props: {
            strokeWidth: 0,
            radius: 0,
          },
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
{/if}
