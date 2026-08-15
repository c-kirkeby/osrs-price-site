<script lang="ts">
  import type { TimeSeries } from "$lib/types/time-series";
  import { BarChart } from "layerchart";
  import { formatDistanceToNowStrict, formatRelative } from "date-fns";
  import { scaleTime } from "d3-scale";
  import { capitalize } from "es-toolkit/string";
  import { getCompactNumberFormatter, getNumberFormatter } from "$lib/utils";
  import * as Chart from "$lib/components/ui/chart/index.js";

  let numberFormatter = $derived(getNumberFormatter());
  let compactNumberFormatter = $derived(getCompactNumberFormatter());

  interface Props {
    data: TimeSeries[];
  }

  let { data }: Props = $props();

  const chartConfig = {
    highPriceVolume: {
      label: "Buy Volume",
      color: "var(--chart-1)",
    },
    lowPriceVolume: {
      label: "Sell Volume",
      color: "var(--chart-5)",
    },
  } satisfies Chart.ChartConfig;

  let x = $derived((x: TimeSeries) => new Date(x.timestamp * 1000));
</script>

{#if data.length > 0}
  <div class="pb-4">
    <Chart.Container config={chartConfig} class="h-[150px] w-full">
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
            format: (d) => compactNumberFormatter.format(Math.abs(d)),
          },
          xAxis: {
            format: (date) =>
              formatDistanceToNowStrict(date, {
                addSuffix: true,
              }),
            ticks: (scale) => scaleTime(scale.domain(), scale.range()).ticks(),
          },
        }}
        series={[
          {
            key: "highPriceVolume",
            label: chartConfig.highPriceVolume.label,
            color: chartConfig.highPriceVolume.color,
            props: {
              strokeWidth: 0,
              radius: 0,
            },
          },
          {
            key: "lowPriceVolume",
            label: chartConfig.lowPriceVolume.label,
            color: chartConfig.lowPriceVolume.color,
            value: (d: TimeSeries) => -d.lowPriceVolume,
            props: {
              strokeWidth: 0,
              radius: 0,
            },
          },
        ]}
      >
        {#snippet tooltip()}
          <Chart.Tooltip
            indicator="dot"
            labelFormatter={(value) =>
              capitalize(formatRelative(value as Date, new Date()))}
          >
            {#snippet formatter({ value, name, item })}
              {@const color =
                chartConfig[item.key as keyof typeof chartConfig]?.color}
              <div class="flex w-full items-center gap-2">
                <div
                  style="--color-bg: {color}; --color-border: {color};"
                  class="size-2.5 shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)"
                ></div>
                <div
                  class="flex flex-1 shrink-0 justify-between items-center leading-none"
                >
                  <span class="text-muted-foreground">{name}</span>
                  <span
                    class="font-mono font-medium text-foreground tabular-nums"
                  >
                    {numberFormatter.format(Math.abs(value as number))}
                  </span>
                </div>
              </div>
            {/snippet}
          </Chart.Tooltip>
        {/snippet}
      </BarChart>
    </Chart.Container>
  </div>
{/if}
