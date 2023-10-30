CREATE TABLE IF NOT EXISTS "item" (
	"id" serial NOT NULL,
	"is_members" boolean,
	"alch_low" integer,
	"alch_high" integer,
	"buy_limit" integer,
	"value" integer,
	"buy_price" integer,
	"buy_price_timestamp" timestamp,
	"sell_price" integer,
	"sell_price_timestamp" timestamp,
	"icon" text,
	"examine_text" text,
	"last_updated" timestamp
);
