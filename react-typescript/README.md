# Adding ReasonML to a React TypeScript codebase

The most natural way to introduce [ReasonML](https://reasonml.github.io/) into an existing [React](https://reactjs.org/) codebase is by writing a few components in [ReasonReact](https://reasonml.github.io/reason-react/). Nowadays, with [0.7.0 and support for react hooks](https://reasonml.github.io/reason-react/blog/2019/04/10/react-hooks), it's not that different from writing components in JavaScript. In this article, however, we are going to explore an alternative way into an existing codebase &mdash; creating an API-calling-and-decoding layer in Reason.

Note: This is the third article in my miniseries about integrating Reason into an existing codebase. For a more basic explanation about how everything hangs together, check out the first article: [Adding ReasonML to an existing codebase](https://github.com/Yakimych/reason-in-typescript/tree/master/basic-javascript). Curious about using Reason in a Vue.js codebase? The second article, [Adding ReasonML to a Vue application](https://github.com/Yakimych/reason-in-typescript/tree/master/reason-in-vue), explains just that :smiley:

## Step 0: Starting point

Our starting point is a React application created via [create-react-app](https://facebook.github.io/create-react-app/). This guide will work equally well for a pure JavaScript codebase, but to make things a bit tricker, let's say this is a [TypeScript](https://www.typescriptlang.org/) application &mdash; this will require our API-calling functions to generate TypeScript types, rather than plain JavaScript. Good news &mdash; `genType` integration [has become much easier](https://twitter.com/BlaineBublitz/status/1109976216969322498) with BuckleScript 5.

## Step 1: Adding BuckleScript

We are going to need [BuckleScript](https://bucklescript.github.io/) for compiling ReasonML or OCaml code to JavaScript and [genType](https://github.com/cristianoc/genType) in order to generate TypeScript types. More about this in [Part 1](https://github.com/Yakimych/reason-in-typescript/tree/master/basic-javascript) of the mini series.

Let's go ahead and install the packages:

```
npm install --save-dev bs-platform gentype
npm install -g bs-platform
```

We're going to need to make sure `bucklescript` runs before babel, so let's add the command to the `start` and `build` scripts in `package.json`:

```json
"scripts": {
  "start": "bsb -make-world && react-scripts start",
  "build": "bsb -make-world && react-scripts build"
}
```

The last thing left before we can start writing code is to add [bsconfig.json](https://bucklescript.github.io/docs/en/build-configuration.html):

```json
{
  "name": "reason-in-react-typescript",
  "sources": [
    {
      "dir": "src/reason",
      "subdirs": true
    }
  ],
  "package-specs": [
    {
      "module": "es6-global",
      "in-source": true
    }
  ],
  "suffix": ".bs.js",
  "namespace": true,
  "refmt": 3,
  "gentypeconfig": {
    "language": "typescript"
  }
}
```

## Step 2: Writing a function in Reason

Note that `src/reason` is specified as the sources directory, so let's create it and add a `TestFunctions.re` file so that we can test our setup:

```ocaml
let reasonSum = (a, b) => a + b;
```

If you're using [VS Code](https://code.visualstudio.com/) with the [reason-language-server](https://github.com/jaredly/reason-language-server) extension, a `TestFunctions.bs.js` file will immediately get generated next to the `.re` file:

```javascript
function reasonSum(a, b) {
  return (a + b) | 0;
}
```

Annotating the function with `[@genType]` would produce a `TestFunctions.gen.tsx` file next to `TestFunctions.bs.js`:

```ocaml
[@genType]
let reasonSum = (a, b) => a + b;
```

```typescript
// tslint:disable-next-line:no-var-requires
const Curry = require("bs-platform/lib/es6/curry.js");

// tslint:disable-next-line:no-var-requires
const TestFunctionsBS = require("./TestFunctions.bs");

export const reasonSum: (_1: number, _2: number) => number = function(
  Arg1: any,
  Arg2: any
) {
  const result = Curry._2(TestFunctionsBS.reasonSum, Arg1, Arg2);
  return result;
};
```

At this point we can use the `reasonSum` function from JavaScript or TypeScript &mdash; let's call it from our React component:

```typescript
import * as React from "react";
import { reasonSum } from "./reason/TestFunctions.gen";

export const TestComponent = () => (
  <div>Result of a ReasonML function call: {reasonSum(1, 2)}</div>
);
```

It is possible to `import reasonSum` from `TestFunctions.bs.js` instead, if we were working with a pure JavaScript codebase. In this case, we won't get any type information.

Note that if you're running from the terminal and would like changes in Reason files to get transpiled and picked up on the fly, your would need to have `bsb -make-world -w` running in the background:

![Compilation on the fly](https://user-images.githubusercontent.com/5010901/58385381-c1645480-7fef-11e9-972b-54a1c20bf29b.gif)

## Step 3: Calling the API and decoding the response in Reason

The next step is adding an API call that will fetch some interesting information about a random number from http://numbersapi.com.

A call to `http://numbersapi.com/random/math?json` would produce the following response:

```json
{
  "text": "880 is the number of 4×4 magic squares.",
  "number": 880,
  "found": true,
  "type": "math"
}
```

We're going to make the API call with [bs-fetch](https://github.com/reasonml-community/bs-fetch) and decode the response with [bs-json](https://github.com/glennsl/bs-json):

```
npm install --save bs-fetch @glennsl/bs-json
```

An important step that is easy to forget is adding those dependencies to `bsconfig.json`:

```json
  "bs-dependencies": ["@glennsl/bs-json", "bs-fetch"]
```

Now we can create a new file `NumberFacts.re`, model the type and create a decoder:

```ocaml
[@genType]
type numberFact = {
  number: int,
  text: string,
  isFound: bool,
};

module Decode = {
  let fact = json =>
    Json.Decode.{
      number: json |> field("number", int),
      text: json |> field("text", string),
      isFound: json |> field("found", bool),
    };
};
```

This generates a `numberFact` type in TypeScript:

```typescript
export type numberFact = {
  readonly number: number;
  readonly text: string;
  readonly isFound: boolean;
};
```

The API call itself can be performed this way:

```ocaml
[@genType]
let fetchNumberFact = () =>
  Js.Promise.(
    Fetch.fetch("http://numbersapi.com/random/math?json")
    |> then_(Fetch.Response.json)
    |> then_(json => json |> Decode.fact |> resolve)
  );
```

The inferred type in Reason is `unit => Js.Promise.t(numberFact)`, as expected. The generated TypeScript function looks like this:

```typescript
export const fetchNumberFact: (_1: void) => Promise<numberFact> = function(
  Arg1: any
) {
  const result = NumberFactsBS.fetchNumberFact(Arg1);
  return result.then(function _element($promise: any) {
    return { number: $promise[0], text: $promise[1], isFound: $promise[2] };
  });
};
```

I explain the differences between the code generated by BuckleScript and genType in the [first article](https://github.com/Yakimych/reason-in-typescript/tree/master/basic-javascript) of this miniseries.

## Step 4: Tying it all together

This is all we have to do on the Reason side of things. Now it is time to call our function from the React component and display the result:

```typescript
import React, { useState, useEffect } from "react";
import {
  numberFact as NumberFact,
  fetchNumberFact
} from "./reason/NumberFacts.gen";

export const App: React.FC = () => {
  const [numberFact, setNumberFact] = useState<NumberFact | null>(null);

  const fetchNewFact = () =>
    fetchNumberFact()
      .then(newFact => setNumberFact(newFact))
      .catch(e => console.log("Error fetching number fact: ", e));

  useEffect(() => {
    fetchNewFact();
  }, []);

  return (
    <div className="App">
      {numberFact === null ? (
        "Loading initial number fact..."
      ) : (
        <div className="number-fact">
          <div>Number: {numberFact.number}</div>
          <div>Fact: "{numberFact.text}"</div>
          <div>{numberFact.isFound ? "Found" : "Not found!"}</div>
          <button onClick={fetchNewFact}>Fetch new fact</button>
        </div>
      )}
    </div>
  );
};
```

A new fact will be automatically loaded after the component is mounted. Clicking the "Fetch new fact" button would load a fresh random number fact &mdash; all done via ReasonML code.

## Summary

Adding ReasonML to an existing React codebase can be done in a matter of minutes. After this initial setup, it becomes possible to write logic in ReasonML or OCaml and use it in existing React components. This approach is an alternative to jumping straight into [ReasonReact](https://reasonml.github.io/reason-react/) (in case that seems too big of a step). The source code is available on [GitHub](https://github.com/Yakimych/articles/tree/master/react-typescript).

The same approach can be used for adding ReasonML to a [Vue.js application](https://github.com/Yakimych/reason-in-typescript/tree/master/reason-in-vue), or pretty much [any other JavaScript application](https://github.com/Yakimych/articles/tree/master/basic-javascript).
