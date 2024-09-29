<script lang="ts">
  import type { TimeSeries } from "$lib/types/time-series";
  import { LineChart, Tooltip } from "layerchart";
  import { formatDistanceToNowStrict, formatRelative } from "date-fns";
  import { scaleTime } from "d3-scale";
  import { min } from "d3-array";
  import ChartTooltip from "$lib/components/ui/charts/chart-tooltip.svelte";
  import capitalize from "lodash/capitalize";
  import { getCompactNumberFormatter, getNumberFormatter } from "$lib/utils";

  $: numberFormatter = getNumberFormatter();
  $: compactNumberFormatter = getCompactNumberFormatter();

  export let data: TimeSeries[];

  const chartConfig = {
    avgHighPrice: {
      label: "Buy Price",
      color: "hsl(var(--chart-1))",
    },
    avgLowPrice: {
      label: "Sell Price",
      color: "hsl(var(--chart-5))",
    },
  };

  $: flatData = data.flatMap((d) =>
    [
      {
        date: new Date(d.timestamp * 1000),
        value: d.avgHighPrice,
        type: "high",
      },
      {
        date: new Date(d.timestamp * 1000),
        value: d.avgLowPrice,
        type: "low",
      },
    ].filter((d) => d.value !== null),
  );

  let processedData: TimeSeries[];

  $: {
    let avgHighPrice: number | null = null;
    let avgLowPrice: number | null = null;

    processedData = data.map((d) => {
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
  }

  $: yDomain = [min(flatData.map((d) => d.value)), null];
</script>

{#if data.length > 0}
  <div class="h-[250px] pb-4">
    <LineChart
      data={processedData}
      x={(x) => new Date(x.timestamp * 1000)}
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
          format: (data) => compactNumberFormatter.format(data),
          tickLength: 0,
        },
        highlight: {
          motion: false,
          points: {
            class: "stroke-none",
          },
        },
        xAxis: {
          format: (date) =>
            formatDistanceToNowStrict(date, {
              addSuffix: true,
            }),
        },
      }}
      series={[
        { key: "avgHighPrice", color: chartConfig.avgHighPrice.color },
        { key: "avgLowPrice", color: chartConfig.avgLowPrice.color },
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
              avgHighPrice: numberFormatter.format(data.avgHighPrice),
              avgLowPrice: numberFormatter.format(data.avgLowPrice),
            }}
            indicator="dot"
          />
        </Tooltip.Root>
      </svelte:fragment>
    </LineChart>
  </div>
{:else}
  <div class="h-[250px] flex items-center text-xl justify-center">No data</div>
{/if}
