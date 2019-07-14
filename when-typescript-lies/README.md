A switch from plain JavaScript to TypeScript at our company about a year ago proved to be one of the most succesfull technical decisions we've made in a while. Surprisingly, the productivity boost when working with our frontend code exceeded any expectations. In this article, however, I am going to focus on some of the problems that TypeScript does not solve (even though one would think it would), and what we are doing in order to try to mitigate those problems.

When TypeScript lies &mdash; API responses

The most obvious challenge when relying on a type system, is to make sure that the guarantees it provides do not break whenever some piece of data comes from an external source, such as from a remote server via an API call.

```
const getItems = (): Promise<List<MyItem>> => {
  const result = axios.get<MyType>("http://server_url/");
  return result.items;
}
```

We are happy to "strongly type" both the `getItems` function, as well as `axios.get`, but what happens if whatever comes back from the server does not have a field called `items`? Our IDE will tell us that accessing `items` is safe, and it will readily help us with intellisense:

[SCREENSHOT]

The compiler and typechecker will happily confirm that the types are correct and it is safe to use the returned Promise wherever the function is called. Moreover, a whole chain of function calls that depends on the ...

When TypeScript lies &mdash; JSON.deserialize (?)

At first glance, since
