import { headers } from "./headers";

export interface Mapping {
  examine: string;
  members: boolean;
  id: number;
  lowalch?: number;
  limit?: number;
  value?: number;
  highalch?: number;
  icon?: string;
  name: string;
}

export type Prices = Record<number, Price>;

export interface Price {
  high?: number;
  highTime?: number;
  low?: number;
  lowTime?: number;
}

export type Volumes = Record<number, number>;

export async function fetchMappings(fetcher = fetch): Promise<Mapping[]> {
  const response = await fetcher(
    "https://prices.runescape.wiki/api/v1/osrs/mapping",
    {
      headers,
    },
  );

  type JSONResponse = Mapping[];

  const data: JSONResponse = await response.json();
  if (response.ok) {
    return data;
  }

  return Promise.reject(
    new Error(
      `Failed to fetch mappings: ${response.status} ${response.statusText}`,
    ),
  );
}

export async function fetchPrices(fetcher = fetch): Promise<Prices> {
  const response = await fetcher(
    "https://prices.runescape.wiki/api/v1/osrs/latest",
    {
      headers,
    },
  );

  interface JSONResponse {
    data: Prices;
  }

  const { data }: JSONResponse = await response.json();
  if (response.ok) {
    return data;
  }

  return Promise.reject(
    new Error(
      `Failed to fetch prices: ${response.status} ${response.statusText}`,
    ),
  );
}

export async function fetchVolumes(fetcher = fetch): Promise<Volumes> {
  const response = await fetcher(
    "https://prices.runescape.wiki/api/v1/osrs/volumes",
    {
      headers,
    },
  );

  interface JSONResponse {
    data: Volumes;
  }

  const { data }: JSONResponse = await response.json();
  if (response.ok) {
    return data;
  }

  return Promise.reject(
    new Error(
      `Failed to fetch volumes: ${response.status} ${response.statusText}`,
    ),
  );
}
