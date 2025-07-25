import { copy, rename } from "./operations.js?v=79c92de1";

export const migration0002 = [
  rename("setting--number-of-extra-modulars", "setting--min-extra-modulars"),
  copy("setting--min-extra-modulars", "setting--max-extra-modulars"),
];
