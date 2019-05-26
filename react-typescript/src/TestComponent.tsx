import * as React from "react";
import { reasonSum } from "./reason/TestFunctions.gen";

export const TestComponent = () => (
  <div>Result of a ReasonML function call: {reasonSum(1, 2)}</div>
);
