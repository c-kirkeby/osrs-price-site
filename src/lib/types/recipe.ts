import type { Item } from "./item";

export interface Step {
  id: number;
  quantity: number;
  type: "input" | "output";
  subText?: string;
  cost?: number;
  notes?: string;
}

export interface Recipe {
  name: string;
  inputs: Step[];
  outputs: Step[];
}

export type ItemRecipe = Item & {
  children?: StepItem[];
};

export type StepItem = Step & Item;

export type RecipeStepRow = Step & Partial<
    Pick<Item, "id" | "name" | "high" | "low" | "highTime" | "lowTime">
  >;

export type RecipeRow = {
  name?: string;
  children?: RecipeStepRow[];
} & Partial<RecipeStepRow>;
