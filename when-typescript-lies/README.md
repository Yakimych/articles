# When TypeScript lies... and how to make it honest

A switch from plain JavaScript to TypeScript at our department about a year ago proved to be one of the most succesfull technical decisions we've made in a while. Surprisingly, the productivity boost when working with our frontend code exceeded any expectations. In this article, however, I am going to focus on some of the problems that TypeScript does not solve (even though one might think it would), and what we are doing in order to try to mitigate those problems.

## When TypeScript lies &mdash; API responses

The most obvious challenge when relying on a type system, is to make sure that the guarantees it provides do not break whenever some piece of data comes from an external source, such as a remote server via an API call.

```ts
const getUsers = (): Promise<User[]> => {
  const result = axios.get<UserApiResponse>("http://server_url/users");
  return result.data.users;
};
```

We are happy to "strongly type" both the `getUsers` function, as well as `axios.get` via a generic type parameter, but what happens if whatever comes back from the server does not have a field called `users`? Our IDE will tell us that accessing `users` is safe, and it will readily help us with intellisense:

![Intellisense provides potentially unreliable type information](https://user-images.githubusercontent.com/5010901/61309186-0176d500-a7f2-11e9-91ab-02454ca65683.png)

The compiler and typechecker will be even more happy to confirm that the types are correct and it is safe to use the returned Promise wherever the function is called. Moreover, a whole chain of function calls that depends on the initial typing is going to look good all the way down to the UI, where we enthusiastically map over the `users` array (_cough_ undefined _cough_) and get a runtime crash &mdash; just like we would with good old JavaScript.

![An object that cannot be undefined according to the type system is undefined at runtime](https://user-images.githubusercontent.com/5010901/61309132-edcb6e80-a7f1-11e9-9893-b8cf525029be.png)

What's even more disturbing is that depending on the journey of the `users` through the codebase, it might (or might not) be rather tricky to trace the origin of the error once we encounter the runtime crash. For example, in case of an array, the variable can be passed around freely from function call to function call &mdash; not just ignoring, but essentially hiding the problem with the incorrect type, until at some point we finally decide to map over it. While this is (_totally_...?) normal for JavaScript, where we're used to this kind of stuff and just patiently wait for it to crash in runtime, with TypeScript it's even more annoying, because of the expectations that the type system is supposed to help deal with exactly such kind of problems.

## When TypeScript lies &mdash; JSON.parse()

At first glance, since we have full control over what we `JSON.stringify` and later `JSON.parse` of the frontend, this shouldn't be as much of a problem as when receiving data from extrernal sources. However, there are unpleasant gotchas, such as in the example below. Let's say we have an type with a `Date` field:

```ts
type SomeEvent = {
  description: string;
  date: Date;
};
```

And we want to stringify and later parse the result into another object of type `SomeEvent`:

```ts
const someEvent: SomeEvent = {
  description: "Birthday",
  date: new Date()
};

const serializedEvent: string = JSON.stringify(someEvent);

const deserializedEvent: SomeEvent = JSON.parse(serializedEvent);
```

This seems like a reasonable operation, and TypeScript will not fight us along the way, even though we could potentially assign any type to `deserializedEvent`. However, because the date is stringified into... well... a string, the parsed type is in fact `{ description: string; date: string; }`. Moreover, this would painfully crash at runtime if we try to call e.g. `getDate()` on this "date": `Uncaught TypeError: deserializedEvent.date.getDate is not a function`.

![Intellisense tells us getDate() exists and is safe to use, but it crashes at runtime](https://user-images.githubusercontent.com/5010901/61804139-b123f680-ae33-11e9-9b4c-0ea840b34a8d.png)

![Runtime errors when trying to call getDate() on an actual string](https://user-images.githubusercontent.com/5010901/61803814-2642fc00-ae33-11e9-89f3-f292122a460a.png)

This is not really a problem with TypeScript itself, or JavaScript for that matter, rather a consequence of how strings are represented in JSON. This is, however, an example of a situation when TypeScript gives us false confidence in what we can and cannot do at a certain place in the code.

## How to make it honest

There are a few ways to mitigate those problems &mdash; some requiring more magic, others &mdash; more code.

### The less magical approach

The most straightforward approach would be to write code that validates the API responses before returning them from the API-calling functions. Validating everything by hand is rather tedious, but there are a few JSON-decoding libraries for TypeScript, such as [json-type-validation](https://github.com/mojotech/json-type-validation) and [io-ts](https://github.com/gcanti/io-ts). Those were in turn inspired by [JSON Decoders in Elm](https://guide.elm-lang.org/effects/json.html) and [bs-json for ReasonML](https://github.com/glennsl/bs-json).

This does require writing decoders for all types that mirror API-responses in the application and adds quite a bit of extra code:

```ts
type User = {
  id: number;
  name: string;
};

const userDecoder = object({
  id: number(),
  name: string()
});
```

Existing decoders can be composed together in order to decode composite objects:

```ts
type UsersApiResponse = {
  users: Array<User>;
};

const userApiResponseDecoder = object({
  users: array(userDecoder)
});
```

When getting data from the API we can keep ourselves in check by being extra honest and marking the return type from axios responses as `unknown`. After all, we don't really know at "compile time" what the server is going to return, do we? :)

Now TypeScript will not even allow us to freely pass around `apiResponse.users` and pretend like we are sure it's an array of users. We would have to decode the `apiResponse` first:

```ts
const getUsers = (apiBaseUrl: string) => {
  const apiResponse = axios.get<unknown>(apiBaseUrl);

  return apiResponse.data.users; // Error: Object is of type 'unknown'
};
```

![The type system prevents us from returning undecoded JSON](https://user-images.githubusercontent.com/5010901/61309289-32efa080-a7f2-11e9-9a2d-cdb1b9b15bf7.png)

```ts
const getUsers = (apiBaseUrl: string) => {
  const apiResponse = axios.getUsers<unknown>(apiBaseUrl);
  const decodedResponse = usersApiResponseDecoder.runWithException(
    apiResponse.data
  );

  return decodedResponse.users; // Now we can safely access the user array
};
```

![If we get to the return statement in runtime, the type is guaranteed to be correct according to TypeScript](https://user-images.githubusercontent.com/5010901/61309336-4864ca80-a7f2-11e9-9056-74715e7d79ae.png)

In this case we are still going to crash at runtime, but we're going to fail early and fail with a clear error message: `DecoderError: the key 'users' is required but was not present`, which means that not only do we get palpable clues as to how to fix the error, but also that TypeScript is not lying any more at any point in the codebase! :)

### The "magical" approach

The approach based on decoders requires writing both API-calling code as well as the decoders themselves by hand. In a perfect world, we would like to avoid this, and instead have everything autogenerated from the API schema/definition. [swagger-codegen](https://github.com/swagger-api/swagger-codegen) is one such solution &mdash; given a Swagger spec file, it can generate API-calling code in a wide variety of languages, including TypeScript. And if we make the code generation as part of out CI pipeline, we won't even need decoders, since the API calling code will always match the API itself!

While "magical" solutions might sometimes be tricky to understand or debug, this approach offers some noticeable benefits over writing validation or decoding code by hand. For instance, we don't have to write and maintain lots of extra code that validates API response whenever the API changes. In fact, breaking changes to the API would be (indirectly) caught by the TypeScript compiler, which means we're getting a lot of (automated) help in ensuring that we're not shipping a broken product.

### The "crazy-but-fun" approach

Oh, and for the more adventurous kind &mdash; it is also possible to implement an [API-calling layer in ReasonML](https://github.com/Yakimych/articles/blob/master/react-typescript/README.md), generate TypeScript types via [genType](https://github.com/cristianoc/genType) and tie everything together with the rest of the codebase via [BuckleScript](https://bucklescript.github.io/). Seems overkill, but why not learn a new technology and have some fun at the same time? :)
