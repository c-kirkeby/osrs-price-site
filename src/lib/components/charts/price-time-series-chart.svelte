<script lang="ts">
  import type { TimeSeries } from "$lib/types/time-series";
  import { LineChart } from "layerchart";
  import { formatDistanceToNowStrict, formatRelative } from "date-fns";
  import { scaleTime } from "d3-scale";
  import { min } from "d3-array";
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
    avgHighPrice: {
      label: "Buy Price",
      color: "var(--chart-1)",
    },
    avgLowPrice: {
      label: "Sell Price",
      color: "var(--chart-5)",
    },
  } satisfies Chart.ChartConfig;

  let flatData = $derived(
    data.flatMap((d): { date: Date; value: number; type: "high" | "low" }[] =>
      [
        d.avgHighPrice !== null
          ? {
              date: new Date(d.timestamp * 1000),
              value: d.avgHighPrice,
              type: "high",
            }
          : null,
        d.avgLowPrice !== null
          ? {
              date: new Date(d.timestamp * 1000),
              value: d.avgLowPrice,
              type: "low",
            }
          : null,
      ].filter(
        (d): d is { date: Date; value: number; type: "high" | "low" } =>
          d !== null,
      ),
    ),
  );

  let processedData = $derived.by(() => {
    let avgHighPrice: number | null = null;
    let avgLowPrice: number | null = null;

    return data.map((d) => {
      if (d.avgHighPrice !== null) {
        avgHighPrice = d.avgHighPrice;
      }
      if (d.avgLowPrice !== null) {
        avgLowPrice = d.avgLowPrice;
      }
      return {
        ...d,
        avgLowPrice,
        avgHighPrice,
      } as TimeSeries;
    });
  });

  let x = $derived((x: TimeSeries) => new Date(x.timestamp * 1000));
  let yDomain = $derived([min(flatData.map((d) => d.value)), null]);
</script>

{#if data.length > 0}
  <div class="pb-4">
    <Chart.Container config={chartConfig} class="h-62.5 w-full">
      <LineChart
        data={processedData}
        {x}
        xScale={scaleTime()}
        {yDomain}
        padding={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 0,
        }}
        points={{
          r: 2,
          data,
        }}
        props={{
          yAxis: {
            format: (d) => compactNumberFormatter.format(d),
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
            key: "avgHighPrice",
            label: chartConfig.avgHighPrice.label,
            color: chartConfig.avgHighPrice.color,
          },
          {
            key: "avgLowPrice",
            label: chartConfig.avgLowPrice.label,
            color: chartConfig.avgLowPrice.color,
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
                    {numberFormatter.format(value as number)}
                  </span>
                </div>
              </div>
            {/snippet}
          </Chart.Tooltip>
        {/snippet}
      </LineChart>
    </Chart.Container>
  </div>
{/if}
