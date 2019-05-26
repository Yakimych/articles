import { jsSum } from "./testFunctions";

function component() {
  const element = document.createElement("div");
  element.innerHTML = `The result of a JavaScript function call is ${jsSum(1, 2)}`;

  return element;
}

document.body.appendChild(component());
