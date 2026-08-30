import { defineEnvVars } from "@sveltejs/kit/env";
import * as v from 'valibot'

export const variables = defineEnvVars({
  RECIPES_ENDPOINT: { public: true, static: true, schema: v.pipe(v.string(), v.url()) },
  USER_AGENT: { public: true, static: true, schema: v.string() }
})
