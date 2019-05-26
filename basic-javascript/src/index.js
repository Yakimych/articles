import { jsSum } from "./testFunctions";
import { reasonSum } from "./ReasonFunctions.bs";
import { getUser } from "./ReasonFunctions.gen";

function component() {
  const element = document.createElement("div");

  const resultFromJs = jsSum(1, 2);
  const resultFromReason = reasonSum(1, 2);

  element.innerHTML = `The result of a JavaScript function call is ${resultFromJs}
                       <br />
                       The result of a ReasonML function call is ${resultFromReason}`;

  const user = getUser();
  console.log("User: ", user);
  const userGreeting = `Hello, ${user.name}!`;
  alert(userGreeting);

  return element;
}

document.body.appendChild(component());
