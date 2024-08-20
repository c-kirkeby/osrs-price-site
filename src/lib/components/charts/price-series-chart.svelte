<script lang="ts">
  import type { TimeSeries } from "$lib/types/time-series";
  import {
    Chart,
    Svg,
    Axis,
    Spline,
    Tooltip,
    TooltipItem,
    Highlight,
  } from "layerchart";
  import { formatDistanceToNowStrict, formatRelative, format } from "date-fns";
  import { scaleOrdinal, scaleTime } from "d3-scale";
  import { flatGroup } from "d3-array";
  import capitalize from "lodash/capitalize";
  import { getCompactNumberFormatter } from "$lib/utils";

  $: compactNumberFormatter = getCompactNumberFormatter();

  export let data: TimeSeries[];

  const chartColours = {
    high: "hsl(var(--chart-1))",
    low: "hsl(var(--chart-5))",
  };

  $: flatData = data.flatMap((d) => [
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
  ]);
  $: yDomain = [
    Math.min(...flatData.filter((d) => d.value !== null).map((d) => d.value)),
    null,
  ];

  $: dataByType = flatGroup(flatData, (data) => data.type);
</script>

{#if data.length > 0}
  <div class="h-[250px] pb-4">
    <Chart
      data={flatData}
      x="date"
      xScale={scaleTime()}
      y="value"
      {yDomain}
      yNice
      r="type"
      rScale={scaleOrdinal()}
      rDomain={Object.keys(chartColours)}
      rRange={Object.values(chartColours)}
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
          format={(data) => compactNumberFormatter.format(data)}
          tickLength={0}
          grid
        />
        <Axis
          placement="bottom"
          format={(date) =>
            formatDistanceToNowStrict(date, {
              addSuffix: true,
            })}
          tickLength={0}
        />
        {#each dataByType as [type, data]}
          {@const colour = rScale(type)}
          <Spline {data} class={`stroke-2 stroke-${colour}`} stroke={colour} />
          <Highlight
            y={(d) => d.value}
            points={{
              spring: false,
              r: 4,
              class: `fill-${colour} stroke-${colour}`,
            }}
          />
        {/each}
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
          {capitalize(formatRelative(data.date, new Date()).slice())}
        </div>
        <div class="grid gap-1.5">
          {#each dataByType as [type]}
            {@const colour = rScale(type)}
            <div
              class="flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground"
            >
              <div
                class={`shrink-0 rounded-[2px] border-[${colour}] bg-[${colour}] w-2.5 h-2.5`}
              ></div>
              <div class="flex flex-1 justify-between leading-none">
                <span class="text-muted-foreground">
                  {capitalize(type)} Price</span
                >
              </div>
              <span class="font-mono font-medium tabular-nums text-foreground">
                {data.value.toLocaleString()}
              </span>
            </div>
          {/each}
        </div></Tooltip
      >
    </Chart>
  </div>
{:else}
  <div class="h-[250px] flex items-center text-xl justify-center">No data</div>
{/if}
