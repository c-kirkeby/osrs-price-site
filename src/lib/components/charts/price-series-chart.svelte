<script lang="ts">
  import type { TimeSeries } from "$lib/types/time-series";
  import { Chart, Svg, Axis, Spline, Tooltip, Highlight } from "layerchart";
  import { formatDistanceToNowStrict, formatRelative } from "date-fns";
  import { scaleOrdinal, scaleTime } from "d3-scale";
  import capitalize from "lodash/capitalize";
  import { getCompactNumberFormatter } from "$lib/utils";

  $: compactNumberFormatter = getCompactNumberFormatter();

  export let data: TimeSeries[];

  const chartColours = {
    highPrice: "hsl(var(--chart-1))",
    lowPrice: "hsl(var(--chart-5))",
  };

  $: avgHighPriceSeries = data.filter((d) => d.avgHighPrice !== null);
  $: avgLowPriceSeries = data.filter((d) => d.avgLowPrice !== null);
  $: yDomain = [Math.min(...avgLowPriceSeries.map(avgLowPriceAccessor)), null];

  function avgHighPriceAccessor(d: TimeSeries) {
    return d.avgHighPrice;
  }

  function avgLowPriceAccessor(d: TimeSeries) {
    return d.avgLowPrice;
  }

  function formatTimestamp(d: TimeSeries["timestamp"]) {
    return formatDistanceToNowStrict(new Date(d * 1000), {
      addSuffix: true,
    });
  }

  function formatPrice(
    d: TimeSeries["avgHighPrice"] | TimeSeries["avgLowPrice"],
  ) {
    return compactNumberFormatter.format(d);
  }
</script>

{#if data.length > 0}
  <div class="pb-4">
    <div class="h-[250px]">
      <Chart
        {data}
        x="timestamp"
        y="avgHighPrice"
        xScale={scaleTime()}
        {yDomain}
        yNice
        rDomain={Object.keys(chartColours)}
        rRange={Object.values(chartColours)}
        rScale={scaleOrdinal()}
        padding={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 0,
        }}
        tooltip={{
          mode: "voronoi",
        }}
        let:rScale
      >
        <Svg>
          <Axis
            placement="left"
            format={formatPrice}
            rule={{ class: "hsl(var(--chart-1))" }}
            labelProps={{
              class: "fill-foreground",
            }}
            grid={{ class: "stroke-border/50" }}
          />
          <Axis
            placement="bottom"
            format={formatTimestamp}
            labelProps={{
              class: "fill-foreground",
            }}
          />
          <Spline
            data={avgHighPriceSeries}
            y={avgHighPriceAccessor}
            class="stroke-2 stroke-[hsl(var(--chart-1))]"
          />
          <Spline
            data={avgLowPriceSeries}
            y={avgLowPriceAccessor}
            class="stroke-2 stroke-[hsl(var(--chart-5))]"
          />
          <Highlight
            points={{
              tweened: false,
              spring: false,
              r: 0.5,
            }}
          ></Highlight>
        </Svg>
        <Tooltip
          let:data
          classes={{
            container:
              "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 text-xs shadow-xl",
            content: "grid gap-1.5",
          }}
        >
          <div slot="header" let:data>
            {capitalize(
              formatRelative(data.timestamp * 1000, new Date()).slice(),
            )}
          </div>
          <div class="grid gap-1.5">
            {#if data.avgHighPrice}
              <div
                class="flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground"
              >
                <div
                  class="shrink-0 rounded-[2px] border-[hsl(var(--chart-1))] bg-[hsl(var(--chart-1))] w-2.5 h-2.5"
                ></div>
                <div class="flex flex-1 justify-between leading-none">
                  <span class="text-muted-foreground">High Price</span>
                </div>
                <span
                  class="font-mono font-medium tabular-nums text-foreground"
                >
                  {data.avgHighPrice.toLocaleString()}
                </span>
              </div>
            {/if}
            {#if data.avgLowPrice}
              <div
                class="flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground"
              >
                <div
                  class="shrink-0 rounded-[2px] border-[hsl(var(--chart-5))] bg-[hsl(var(--chart-5))] w-2.5 h-2.5"
                ></div>
                <div class="flex flex-1 justify-between leading-none">
                  <span class="text-muted-foreground">Low Price</span>
                </div>
                <span
                  class="font-mono font-medium tabular-nums text-foreground"
                >
                  {data.avgLowPrice.toLocaleString()}
                </span>
              </div>
            {/if}
          </div></Tooltip
        >
      </Chart>
    </div>
  </div>
{:else}
  <div class="h-[250px] flex items-center text-xl justify-center">No data</div>
{/if}
