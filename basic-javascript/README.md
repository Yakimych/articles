# Adding ReasonML to an existing codebase (Part 1)

First things first, stating the not-so-obvious: **Adding [ReasonML](https://reasonml.github.io/) to an existing JavaScript application is extremely easy!** In fact, it's not that more difficult than adding [Flow](https://flow.org/). So if you've heard about ReasonML and are curious about trying it out, but not sure how to integrate it into an existing codebase &mdash; good news &mdash; you can be up-and-running within 10 minutes :smiley:

This is going to be a miniseries about adding ReasonML to an existing codebase. In this part, we're going to look at the basics, by using an example with a vanilla JavaScript setup with webpack:

- writing code in ReasonML
- calling it from JavaScript
- using ReasonML types as JavaScript records (via genType)

In Part 2 we are going to look at how to add some API-calling-and-decoding functions written in ReasonML to a [Vue.js](https://vuejs.org/) application. And in Part 3 we're going to use the same API caller in a [React](https://reactjs.org/) [TypeScript](https://www.typescriptlang.org/) application. So let's get started.

## Step 0: Starting point

The starting point is an (almost) empty application created by following the [Getting Started](https://webpack.js.org/guides/getting-started/) section from the [webpack](https://webpack.js.org/) guide. The `index.js` file looks like this:

```javascript
function component() {
  const element = document.createElement("div");

  element.innerHTML = `Placeholder content`;

  return element;
}

document.body.appendChild(component());
```

We have 2 scripts in `package.json`:

```json
"scripts": {
"build": "webpack",
"start": "webpack-dev-server --open"
}
```
