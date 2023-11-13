# OSRS Price Site

A free and open-source site for browsing and comparing prices of in the MMORPG Old-School RuneScape using the wiki's [realtime pricing API](https://oldschool.runescape.wiki/w/RuneScape:Real-time_Prices).

## Pre-requisites

- Node.js
- Docker and docker-compose

## Developing

Run the Postgres Database with the following docker-compose command:

```bash
docker-compose up -d
```

Once you've installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.
