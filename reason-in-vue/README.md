# Adding ReasonML to a Vue application

Despite the fact that [ReasonML](https://reasonml.github.io/) is a natural fit for React, thanks to [BuckleScript](https://bucklescript.github.io/) it can easily be used in any JavaScript application. And yes &mdash; this includes [Vue.js](https://vuejs.org/)!

If you're working with Vue and like OCaml/ReasonML, or whether you've heard all the hype and are curious to try &mdash; in this article I will show how to use code written in Reason from Vue.

Note: This is the second article in my miniseries about integrating Reason into an existing codebase. For a more basic explanation about how everything hangs together, check out the first article: [Adding ReasonML to an existing codebase](https://github.com/Yakimych/reason-in-typescript/blob/master/basic-javascript/README.md). In Part 3 we're going to integrate Reason into a [React](https://reactjs.org/) [TypeScript](https://www.typescriptlang.org/) codebase.

## Step 0: Starting point

Our starting point is a freshly created Vue application with the help of the [Vue CLI](https://cli.vuejs.org/guide/creating-a-project.html) default preset. It is worth noting that thanks to [genType](https://github.com/cristianoc/genType), this guide would work equally well for a [TypeScript](https://www.typescriptlang.org/) application.
