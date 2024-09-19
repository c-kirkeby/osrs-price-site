export interface Step {
  id: number;
  quantity: number;
}

export interface Recipe {
  inputs: Step[];
  outputs: Step[];
}
