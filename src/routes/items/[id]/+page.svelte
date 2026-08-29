<script lang="ts">
  import {
    CircleArrowDown,
    CircleArrowUp,
    Info,
    ExternalLinkIcon,
    TrendingUp,
    TrendingDown,
    HeartIcon,
  } from "@lucide/svelte";
  import * as Card from "$lib/components/ui/card";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import {
    calculateTax,
    calculateRoi,
    cn,
    getNumberFormatter,
    getCompactNumberFormatter,
    getSignedPrefix,
    styleSignedNumberCell,
  } from "$lib/utils";
  import type { TimeSeriesOption } from "$lib/types/time-series";
  import PriceTimeSeriesChart from "$lib/components/charts/price-time-series-chart.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import TimeStepDropdown from "./(components)/time-step-dropdown.svelte";
  import { page } from "$app/state";
  import { alchPriceState } from "$lib/state/alch.svelte.js";
  import { settings } from "$lib/state/settings.svelte";
  import { formatDistanceToNowStrict } from "date-fns/formatDistanceToNowStrict";
  import { format } from "date-fns/format";
  import { currentItemState } from "$lib/state/current-item.svelte.js";
  import { isLoading } from "$lib/state/loading.svelte.js";
  import { goto, invalidate } from "$app/navigation";
  import VolumeTimeSeriesChart from "$lib/components/charts/volume-time-series-chart.svelte";
  import { onMount } from "svelte";
  import { config } from "$lib/config";
  import { favouritesState } from "$lib/state/favourites.svelte.js";
  import { resolve } from "$app/paths";

  let formatter = $derived(getNumberFormatter());
  let compactFormatter = $derived(getCompactNumberFormatter());
  let isFavouriteItem = $derived(
    (currentItemState.item &&
      favouritesState.favourites?.includes(currentItemState.item.id)) ||
      false,
  );

  let { data } = $props();

  let options: TimeSeriesOption[] = [
    { value: "5m", label: "Last day" },
    { value: "1h", label: "Last 7 days" },
    { value: "6h", label: "Last 30 days" },
    { value: "24h", label: "Last 12 months" },
  ];

  let selected = $derived(
    options.find(
      (option) => option.value === page.url.searchParams.get("time_step"),
    ) ??
      ({
        value: "5m",
        label: "Last day",
      } satisfies TimeSeriesOption),
  );

  let intervalId: ReturnType<typeof setInterval> | undefined;
  let interval = () => {
    return setInterval(async () => {
      invalidate("items:history");
    }, config.pollMs);
  };

  function handleVisibilityChange() {
    if (document.hidden) {
      clearInterval(intervalId);
      intervalId = undefined;
    } else {
      intervalId = intervalId || interval();
    }
  }

  onMount(() => {
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
      false,
    );
    handleVisibilityChange();
  });

  let history = $derived(data.history.data);

  let totalVolume = $derived(
    data.history.data.reduce(
      (sum, tick) => (sum += tick.lowPriceVolume + tick.highPriceVolume),
      0,
    ),
  );

  let tax = $derived(
    currentItemState.item?.low
      ? calculateTax(currentItemState.item.low, currentItemState.item.id)
      : null,
  );
  let margin = $derived(
    currentItemState.item?.low &&
      currentItemState.item.high &&
      typeof tax === "number"
      ? Math.floor(currentItemState.item.high - currentItemState.item.low - tax)
      : null,
  );
  let highAlchProfit = $derived(
    currentItemState.item?.highalch &&
      currentItemState.item.high &&
      alchPriceState.price?.high
      ? Math.floor(
          currentItemState.item.highalch -
            currentItemState.item.high -
            alchPriceState.price?.high,
        )
      : null,
  );
  let lowAlchProfit = $derived(
    currentItemState.item?.lowalch &&
      currentItemState.item.high &&
      alchPriceState.price?.high
      ? Math.floor(
          currentItemState.item.lowalch -
            currentItemState.item.high -
            alchPriceState.price?.high,
        )
      : null,
  );
  let potentialProfit = $derived(
    margin && currentItemState.item?.limit
      ? Math.floor(margin * currentItemState.item.limit)
      : null,
  );
  let returnOnInvestment = $derived(
    currentItemState.item?.low && margin && tax
      ? calculateRoi(currentItemState.item.low, margin)
      : null,
  );
  let buyPriceChangePeriodStart = $derived(
    history?.find((entry) => entry.avgHighPrice)?.avgHighPrice || 0,
  );
  let buyPriceChangePeriodEnd = $derived(
    history?.findLast((entry) => entry.avgHighPrice)?.avgHighPrice || 0,
  );
  let buyPriceChange = $derived(
    buyPriceChangePeriodEnd - buyPriceChangePeriodStart,
  );
  let buyPriceChangePercentage = $derived(
    buyPriceChangePeriodStart > 0
      ? (buyPriceChange / buyPriceChangePeriodStart) * 100
      : 0,
  );
  let sellPriceChangePeriodStart = $derived(
    history?.find((entry) => entry.avgLowPrice)?.avgLowPrice || 0,
  );
  let sellPriceChangePeriodEnd = $derived(
    history?.findLast((entry) => entry.avgLowPrice)?.avgLowPrice || 0,
  );
  let sellPriceChange = $derived(
    sellPriceChangePeriodEnd - sellPriceChangePeriodStart,
  );
  let sellPriceChangePercentage = $derived(
    sellPriceChangePeriodStart > 0
      ? (sellPriceChange / sellPriceChangePeriodStart) * 100
      : 0,
  );

  async function fetchHistory(option: TimeSeriesOption) {
    goto(resolve(`/items/${page.params.id}?time_step=${option.value}`));
  }
</script>

<svelte:head>
  <title>{currentItemState.item?.name}</title>
</svelte:head>

{#if !isLoading.value}
  <section
    class={cn("flex-1 flex-col space-y-4 p-4 md:flex relative", {
      container: settings.current.compact,
    })}
  >
    <div class="flex items-center justify-between">
      <h1 class="md:text-3xl text-xl tracking-tight">
        {#if currentItemState.item?.icon}
          <img
            src={`https://oldschool.runescape.wiki/images/${encodeURIComponent(
              currentItemState.item.icon.replaceAll(" ", "_"),
            )}`}
            alt={currentItemState.item.name}
            class="object-contain inline-block mr-2"
          />
        {/if}
        <span class="font-bold">{currentItemState.item?.name}</span>
        <span class="text-muted-foreground text-sm ml-2">
          (ID: {currentItemState.item?.id})
        </span>
      </h1>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          class="ml-auto hidden h-8 w-8 md:flex gap-1"
          target="_blank"
          onclick={() => {
            const id = currentItemState.item?.id;
            if (!isFavouriteItem && id) {
              favouritesState.favourites = [
                ...(favouritesState.favourites || []),
                id,
              ];
            } else {
              favouritesState.favourites =
                favouritesState.favourites?.filter(
                  (favourite) => favourite !== currentItemState.item?.id,
                ) ?? [];
            }
          }}
        >
          <HeartIcon
            class={cn("size-4", { "fill-primary": isFavouriteItem })}
          />
          <span class="sr-only">
            {#if isFavouriteItem}
              Remove from favourites
            {:else}
              Add to favourites
            {/if}
          </span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          class="ml-auto hidden h-8 md:flex gap-1"
          href={`https://oldschool.runescape.wiki/w/Special:Lookup?type=item&id=${page.params.id}`}
          target="_blank"
        >
          <ExternalLinkIcon class="size-3.5" />
          Wiki
        </Button>
      </div>
    </div>

    <div
      class="grid flex-1 items-start gap-4 sm:py-0 md:grid-cols-3 xl:grid-cols-3"
    >
      <div class="grid auto-rows-max items-start gap-4 md:col-span-2">
        <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Card.Root class="sm:col-span-2">
            <Card.Header
              class="flex flex-row items-center justify-between space-y-0 pb-2"
            >
              <Card.Title class="text-sm font-medium">Buy Price</Card.Title>
              <CircleArrowDown />
            </Card.Header>
            <Card.Content>
              <p>
                <span class="text-2xl font-bold">
                  {#if currentItemState.item?.high}
                    {formatter.format(currentItemState.item.high)}
                  {:else}
                    Unknown
                  {/if}
                </span>
                {#if buyPriceChange !== 0}
                  <span
                    class={cn("text-sm", styleSignedNumberCell(buyPriceChange))}
                    >{getSignedPrefix(buyPriceChange)}{compactFormatter.format(
                      buyPriceChange,
                    )}
                    {#if buyPriceChange > 0}
                      <TrendingUp class="inline size-4" />
                    {:else if buyPriceChange < 0}
                      <TrendingDown class="inline size-4" />
                    {/if}
                    {formatter.format(
                      buyPriceChangePercentage,
                    )}{buyPriceChangePercentage !== 0 ? "%" : ""}</span
                  >
                {/if}
              </p>
              {#if currentItemState.item?.highTime}
                <Tooltip.Root>
                  <Tooltip.Trigger>
                    <p class="text-xs text-muted-foreground">
                      {formatDistanceToNowStrict(
                        new Date(currentItemState.item.highTime * 1000),
                        {
                          addSuffix: true,
                        },
                      )}
                      <Info class="inline-block h-3 w-3" />
                    </p>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <span
                      >{format(
                        new Date(currentItemState.item.highTime * 1000),
                        "yyyy-MM-dd HH:mm:ss",
                      )}</span
                    >
                  </Tooltip.Content>
                </Tooltip.Root>
              {/if}
            </Card.Content>
          </Card.Root>
          <Card.Root class="sm:col-span-2">
            <Card.Header
              class="flex flex-row items-center justify-between space-y-0 pb-2"
            >
              <Card.Title class="text-sm font-medium">Sell Price</Card.Title>
              <CircleArrowUp />
            </Card.Header>
            <Card.Content>
              <p>
                <span class="text-2xl font-bold">
                  {#if currentItemState.item?.low}
                    {formatter.format(currentItemState.item.low)}
                  {:else}
                    Unknown
                  {/if}
                </span>
                {#if sellPriceChange !== 0}
                  <span
                    class={cn(
                      "text-sm",
                      styleSignedNumberCell(sellPriceChange),
                    )}
                    >{getSignedPrefix(sellPriceChange)}{compactFormatter.format(
                      sellPriceChange,
                    )}
                    {#if sellPriceChange > 0}
                      <TrendingUp class="inline size-4" />
                    {:else if sellPriceChange < 0}
                      <TrendingDown class="inline size-4" />
                    {/if}
                    {formatter.format(
                      sellPriceChangePercentage,
                    )}{sellPriceChangePercentage !== 0 ? "%" : ""}</span
                  >
                {/if}
              </p>
              {#if currentItemState.item?.lowTime}
                <Tooltip.Root>
                  <Tooltip.Trigger>
                    <p class="text-xs text-muted-foreground">
                      {formatDistanceToNowStrict(
                        new Date(currentItemState.item.lowTime * 1000),
                        {
                          addSuffix: true,
                        },
                      )}
                      <Info class="inline-block h-3 w-3" />
                    </p>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <span
                      >{format(
                        new Date(currentItemState.item.lowTime * 1000),
                        "yyyy-MM-dd HH:mm:ss",
                      )}</span
                    >
                  </Tooltip.Content>
                </Tooltip.Root>
              {/if}
            </Card.Content>
          </Card.Root>
        </div>
        <Card.Root>
          <Card.Header
            class="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row"
          >
            <div class="grid flex-1 gap-1 text-center sm:text-left">
              <Card.Title>Item History</Card.Title>
              <Card.Description>
                Showing the price history for the last {selected.label.toLowerCase()}.
              </Card.Description>
            </div>
            <TimeStepDropdown {selected} onSelectedChange={fetchHistory} />
          </Card.Header>
          <Card.Content class="px-2 pt-4 sm:px-6 sm:pt-6">
            {#if history.length === 0}
              <div
                class=" h-[400px] flex flex-col items-center justify-center gap-1 text-center"
              >
                <h3 class="text-2xl font-bold tracking-tight">
                  No data for the selected period
                </h3>
                <p class="text-sm text-muted-foreground">
                  Try selecting a different period.
                </p>
              </div>
            {:else}
              <PriceTimeSeriesChart data={history} />
              <VolumeTimeSeriesChart data={history} />
            {/if}
          </Card.Content>
        </Card.Root>
      </div>
      <div>
        <Card.Root class="overflow-hidden">
          <Card.Content class="p-6 text-sm">
            <div class="grid gap-3">
              <div class="font-semibold">Item Details</div>
              <ul class="grid gap-3">
                <Tooltip.Root>
                  <li class="flex items-center justify-between">
                    <Tooltip.Trigger>
                      <span class="text-muted-foreground"
                        >Margin
                        <Info class="inline-block h-3 w-3" />
                      </span>
                    </Tooltip.Trigger>
                    {#if typeof margin !== "undefined" && margin !== null}
                      <span class={styleSignedNumberCell(margin)}
                        >{getSignedPrefix(margin)}{formatter.format(
                          margin,
                        )}</span
                      >
                    {:else}
                      -
                    {/if}
                  </li>
                  <Tooltip.Content>
                    {#if currentItemState.item?.high && currentItemState.item.low && typeof tax === "number"}
                      <span
                        >{formatter.format(currentItemState.item.high)} - {formatter.format(
                          currentItemState.item.low,
                        )} -
                        {formatter.format(tax)} (tax)</span
                      >
                    {/if}
                  </Tooltip.Content>
                </Tooltip.Root>
                <li class="flex items-center justify-between">
                  <span class="text-muted-foreground">Limit</span>
                  <span>
                    {#if currentItemState.item?.limit}
                      {formatter.format(currentItemState.item.limit)}
                    {:else}
                      -
                    {/if}</span
                  >
                </li>
                <Tooltip.Root>
                  <li class="flex items-center justify-between">
                    <Tooltip.Trigger>
                      <span class="text-muted-foreground">
                        Potential Profit

                        <Info class="inline-block size-3" />
                      </span>
                    </Tooltip.Trigger>

                    <span class={styleSignedNumberCell(margin)}>
                      {#if potentialProfit}
                        {getSignedPrefix(potentialProfit)}{formatter.format(
                          potentialProfit,
                        )}
                      {:else}
                        -
                      {/if}</span
                    >
                  </li>
                  <Tooltip.Content>
                    {#if margin && currentItemState.item?.limit}
                      <span>
                        {formatter.format(margin)} × {formatter.format(
                          currentItemState.item.limit,
                        )}
                      </span>
                    {/if}
                  </Tooltip.Content>
                </Tooltip.Root>
                <Tooltip.Root>
                  <li class="flex items-center justify-between">
                    <Tooltip.Trigger>
                      <span class="text-muted-foreground"
                        >ROI <Info class="inline-block h-3 w-3" /></span
                      >
                    </Tooltip.Trigger>
                    <span class={styleSignedNumberCell(margin)}>
                      {#if returnOnInvestment}
                        {getSignedPrefix(returnOnInvestment)}{formatter
                          .format(returnOnInvestment)
                          ?.concat("%")}
                      {:else}
                        -
                      {/if}
                    </span>
                  </li>
                  <Tooltip.Content>
                    {#if currentItemState.item?.low && margin && tax}
                      <span>
                        {formatter.format(margin)} / {formatter.format(
                          currentItemState.item?.low,
                        )} × 100
                      </span>
                    {/if}
                  </Tooltip.Content>
                </Tooltip.Root>
                <Tooltip.Root>
                  <li class="flex items-center justify-between">
                    <Tooltip.Trigger>
                      <span class="text-muted-foreground"
                        >Tax

                        <Info class="inline-block size-3" />
                      </span>
                    </Tooltip.Trigger>
                    {#if tax}
                      {formatter.format(tax)}
                    {:else}
                      -
                    {/if}
                  </li>
                  <Tooltip.Content>
                    {#if currentItemState.item?.low}
                      <span>
                        1% of {formatter.format(currentItemState.item.low)}
                      </span>
                    {/if}
                  </Tooltip.Content>
                </Tooltip.Root>
              </ul>
              <Separator class="my-2" />
              <ul class="grid gap-3">
                <Tooltip.Root>
                  <li class="flex items-center justify-between">
                    <Tooltip.Trigger>
                      <span class="text-muted-foreground"
                        >High Alch Profit
                        <Info class="inline-block h-3 w-3" />
                      </span>
                    </Tooltip.Trigger>
                    <span class={styleSignedNumberCell(highAlchProfit)}>
                      {#if highAlchProfit}
                        {getSignedPrefix(highAlchProfit)}{formatter.format(
                          highAlchProfit,
                        )}
                      {:else}
                        -
                      {/if}
                    </span>
                  </li>
                  <Tooltip.Content>
                    {#if currentItemState.item?.highalch && currentItemState.item.high && alchPriceState.price?.high}
                      <span>
                        {formatter.format(currentItemState.item.highalch)} - {formatter.format(
                          currentItemState.item.high,
                        )} - {formatter.format(alchPriceState.price.high)} (alch price)
                      </span>
                    {/if}
                  </Tooltip.Content>
                </Tooltip.Root>
                <li class="flex items-center justify-between">
                  <span class="text-muted-foreground">High Alch</span>
                  <span>
                    {#if currentItemState.item?.highalch}
                      {formatter.format(currentItemState.item.highalch)}
                    {:else}
                      -
                    {/if}
                  </span>
                </li>
                <Tooltip.Root>
                  <li class="flex items-center justify-between">
                    <Tooltip.Trigger>
                      <span class="text-muted-foreground"
                        >Low Alch Profit
                        <Info class="inline-block h-3 w-3" />
                      </span>
                    </Tooltip.Trigger>
                    <span class={styleSignedNumberCell(lowAlchProfit)}>
                      {#if lowAlchProfit}
                        {getSignedPrefix(lowAlchProfit)}{formatter.format(
                          lowAlchProfit,
                        )}
                      {:else}
                        -
                      {/if}
                    </span>
                  </li>
                  <Tooltip.Content>
                    {#if currentItemState.item?.lowalch && currentItemState.item.high && alchPriceState.price?.high}
                      <span>
                        {formatter.format(currentItemState.item.lowalch)} - {formatter.format(
                          currentItemState.item.high,
                        )} - {formatter.format(alchPriceState.price.high)} (alch price)
                      </span>
                    {/if}
                  </Tooltip.Content>
                </Tooltip.Root>
                <li class="flex items-center justify-between">
                  <span class="text-muted-foreground">Low Alch</span>
                  <span>
                    {#if currentItemState.item?.lowalch}
                      {formatter.format(currentItemState.item.lowalch)}
                    {:else}
                      -
                    {/if}
                  </span>
                </li>
              </ul>
              <Separator class="my-2" />
              <ul class="grid gap-3">
                <li class="flex items-center justify-between">
                  <span class="text-muted-foreground"
                    >Volume ({selected.label})</span
                  >
                  <span>
                    {#if typeof totalVolume !== "undefined"}
                      {formatter.format(totalVolume)}
                    {:else}
                      -
                    {/if}
                  </span>
                </li>
              </ul>
              <Separator class="my-2" />
              <ul class="grid gap-3">
                <li class="flex items-center justify-between">
                  <span class="text-muted-foreground">Members</span>
                  <span>
                    {#if typeof currentItemState.item?.members !== "undefined"}
                      {currentItemState.item.members ? "Yes" : "No"}
                    {:else}
                      -
                    {/if}
                  </span>
                </li>
              </ul>
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  </section>
{/if}
