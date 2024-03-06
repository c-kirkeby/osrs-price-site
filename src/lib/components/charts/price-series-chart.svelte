<script lang="ts">
  import type { TimeSeries } from "$lib/types/time-series";
  import { getCompactNumberFormatter, getNumberFormatter } from "$lib/utils";
  import {
    Chart,
    Svg,
    Axis,
    Spline,
    Tooltip,
    TooltipItem,
    Highlight,
  } from "layerchart";
  import { formatDistanceToNowStrict } from "date-fns";
  import { scaleTime } from "d3-scale";
  import { format } from "date-fns/format";

  $: numberFormatter = getNumberFormatter();
  $: compactNumberFormatter = getCompactNumberFormatter();

  export let data: TimeSeries[];

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
    <div class="h-[200px]">
      <Chart
        {data}
        x="timestamp"
        y="avgHighPrice"
        y1="avgLowPrice"
        xScale={scaleTime()}
        {yDomain}
        yNice
        padding={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 0,
        }}
        tooltip={{
          mode: "voronoi",
        }}
      >
        <Svg>
          <Axis
            placement="left"
            format={formatPrice}
            rule={{ class: "stroke-primary" }}
            labelProps={{
              class: "fill-primary",
            }}
          />
          <Axis
            placement="bottom"
            format={formatTimestamp}
            rule={{ class: "stroke-primary" }}
            labelProps={{
              class: "fill-primary",
            }}
          />
          <Spline
            data={avgHighPriceSeries}
            y={avgHighPriceAccessor}
            class="stroke-2 stroke-primary"
          />
          <Spline
            data={avgLowPriceSeries}
            y={avgLowPriceAccessor}
            class="stroke-2 stroke-secondary"
          />
          <Highlight points lines />
        </Svg>
        <Tooltip
          header={(d) =>
            format(new Date(d.timestamp * 1000), "yyyy-MM-dd HH:mm:ss")}
          let:data
        >
          <TooltipItem label="High Price" value={data.avgHighPrice} />
          <TooltipItem label="Low Price" value={data.avgLowPrice} />
        </Tooltip>
      </Chart>
    </div>
  </div>
{:else}
  <div class="h-[250px] flex items-center text-xl justify-center">No data</div>
{/if}
