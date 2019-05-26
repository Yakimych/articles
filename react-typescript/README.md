# Adding ReasonML to a React TypeScript codebase

The most natural way to introduce [ReasonML](https://reasonml.github.io/) into an existing [React](https://reactjs.org/) codebase is by writing a few components in [ReasonReact](https://reasonml.github.io/reason-react/). Nowadays, with [0.7.0 and support for react hooks](https://reasonml.github.io/reason-react/blog/2019/04/10/react-hooks), it's not that different from writing components in JavaScript. In this article, however, we are going to explore an alternative way into an existing codebase &mdash; creating an API-calling-and-decoding layer in Reason.

Note: This is the second article in my miniseries about integrating Reason into an existing codebase. For a more basic explanation about how everything hangs together, check out the first article: [Adding ReasonML to an existing codebase](https://github.com/Yakimych/reason-in-typescript/blob/master/basic-javascript/README.md). Curious about using Reason in a Vue.js codebase? The second article, [Adding ReasonML to a Vue application](https://github.com/Yakimych/reason-in-typescript/blob/master/reason-in-vue/README.md), explains just that :smiley:

## Step 0: Starting point

Our starting point is a React application created via [create-react-app](https://facebook.github.io/create-react-app/). This guide will work equally well for a pure JavaScript codebase, but to make things a bit tricker, let's say this is a [TypeScript](https://www.typescriptlang.org/) application &mdash; this will require our API-calling functions to generate TypeScript types, rather than plain JavaScript. Good news &mdash; `genType` integration [has become much easier](https://twitter.com/BlaineBublitz/status/1109976216969322498) with BuckleScript 5.
