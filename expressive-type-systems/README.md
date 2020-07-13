## Expressive type systems

Sometimes we hear the phrase "...this and this [language/type system] is more expressive than [some other language/type system]". But what exactly does this mean in practice? In this article I am going to provide an example comparing C# and F#, as well as a quick comparison of the state of things on the frontend (e.g. JavaScript/TypeScript and OCaml/ReasonML/Elm).

Let us start with trying to model a relatively common situation &mdash; some value getting retrieved from an external system (e.g. an API call). Such a request might A) Succeed, returning a number-value, or B) Fail, returning an error message. A somewhat naive and straightforward way of modelling this in C# would be by creating a data structure with an `IsSuccess` boolean property, as well as nullable properties for the `ReturnedValue` and `ErrorMessage`.

```csharp
public class ApiCallResult
{
    public ApiCallResult(bool isSuccess, int? returnedValue, string errorMessage)
    {
        IsSuccess = isSuccess;
        ReturnedValue = returnedValue;
        ErrorMessage = errorMessage;
    }

    public bool IsSuccess { get; }
    public int? ReturnedValue { get; }
    public string ErrorMessage { get; }
}
```

We would expect the `ReturnedValue` to be null in case `IsSuccess` is `false`, and `ErrorMessage` to be `null` in case `IsSuccess` is `true`, but how can we enforce this? Yet again, a straightforward way of doing so is by adding some checks in our constructor and throwing exceptions whenever the checks fail:

```csharp
public ApiCallResult(bool isSuccess, int? returnedValue, string errorMessage)
{
    if (isSuccess && returnedValue == null)
    {
        throw new ArgumentException($"{nameof(returnedValue)} should be set when {nameof(isSuccess)} is true");
    }

    if (!isSuccess && string.IsNullOrEmpty(errorMessage))
    {
        throw new ArgumentException($"{nameof(errorMessage)} should be set when {nameof(isSuccess)} is false");
    }

    if (isSuccess && !string.IsNullOrEmpty(errorMessage))
    {
        throw new ArgumentException($"{nameof(errorMessage)} cannot be set when {nameof(isSuccess)} is true");
    }

    if (!isSuccess && returnedValue != null)
    {
        throw new ArgumentException($"{nameof(returnedValue)} cannot be set when {nameof(isSuccess)} is false");
    }

    IsSuccess = isSuccess;
    ReturnedValue = returnedValue;
    ErrorMessage = errorMessage;
}
```

In order to make sure this behavior doesn't get broken in the future, we might want to add some [tests](TODO: link) (a TDD-practitioner would likely perform those steps in a different order :) ).

We can do better though &mdash; instead of using one constructor for creating an `ApiCallResult` object and checking for all invalid permutations of input parameters, we could create two private constructors &mdash; one for each case, and two static methods for creating a `SuccessResult` and `ErrorResult`. In this case, we make sure that the consumer of our class cannot go wrong:

```C#
public class SmarterApiCallResult
{
    public static SmarterApiCallResult CreateSuccessResult(int returnedValue)
    {
        return new SmarterApiCallResult(returnedValue);
    }

    public static SmarterApiCallResult CreateErrorResult(string errorMessage)
    {
        return new SmarterApiCallResult(errorMessage);
    }

    private SmarterApiCallResult(int returnedValue)
    {
        IsSuccess = true;
        ReturnedValue = returnedValue;
    }

    private SmarterApiCallResult(string errorMessage)
    {
        if (string.IsNullOrEmpty(errorMessage))
        {
            throw new ArgumentException($"{nameof(errorMessage)} cannot be null");
        }

        IsSuccess = false;
        ErrorMessage = errorMessage;
    }

    public bool IsSuccess { get; }
    public int? ReturnedValue { get; }
    public string ErrorMessage { get; }
}
```

We still need to check that the `errorMessage` string is not `null`, because strings are nullable in C#. Yet again, in order to make sure this behavior doesn't get broken in the future, let's make sure we add the relevant tests:

```csharp
public class SmarterSampleTests
{
    [Fact]
    public void ErrorMessage_IsEmpty_OnSuccessResult()
    {
        var successResult = SmarterApiCallResult.CreateSuccessResult(123);
        Assert.True(string.IsNullOrEmpty(successResult.ErrorMessage));
    }

    [Fact]
    public void ReturnedValue_IsEmpty_OnErrorResult()
    {
        var errorResult = SmarterApiCallResult.CreateErrorResult("An error has occurred");
        Assert.False(errorResult.ReturnedValue.HasValue);
    }

    [Fact]
    public void ErrorMessage_CannotBeEmpty_OnErrorResult()
    {
        Assert.Throws<ArgumentException>(() => SmarterApiCallResult.CreateErrorResult(null));
    }
}
```

This example is definitely "smarter" and less verbose than the "naive" one, and we could go even further by modelling this via inheritance, but I won't go down that path, and instead compare to an implementation of the same concept in F#:

```fsharp
type ApiCallResult =
    | Success of int
    | Error of string
```

Yes, that's it, it's **done**. That's really all you need to achieve **those exact** constraints. An [Algebraic Data Type](TODO: Link) (ADTs) allows us to represent the same model with the same constraints in 3 lines of code!

But wait, what about tests? Good question! This is a clear example of how a (more expressive) type system may indeed eliminate the need for _a certain type_ of tests. We get the same guarantee that the C# tests provide, but on a type system level, which means that there is no way of writing valid F# code that would somehow bypass those guarantees. In fact, writing tests for invalid scenarios in F# is not possible, as such tests won't compile.

### What about JavaScript/TypeScript as opposed to ReasonML/OCaml/Elm?

One of the common situations where we encounter similar data structures in JavaScript applications is Redux actions. While one does not have any guarantees in JavaScript by default, TypeScripts type system allows for similar constraints in a somewhat verbose way:

```typescript
type ApiCallResult =
  | {
      kind: "success";
      returnedValue: number;
    }
  | {
      kind: "error";
      errorMessage: string;
    };
```

It is possible to use the same data structure in JavaScript, as well as adding tests (similar to C#) for validation (a common way of doing this with e.g. Redux is by using actions and [action creators](TODO: Link)). A similar data structure can be defined with much less verbose syntax in ReasonML:

```reason
type apiCallResult =
  | Success(int)
  | Error(string);
```

## Why is this important?

One thing that's pretty much uncontroversial when it comes to software development, is that the ultimate goal is making our users happy. How do expressive type systems make our users happy? Most users of our software never see our code, let alone care about what language or type system we use. This is true, but this does **not** mean that our technology choices don't affect our users.

In this case, a more expressive type system allows us, as developers, to focus on the core of the problem: analyzing the requirements, and implementing the logic; as opposed to writing checks for all possible permutations of invalid states, as well as complementing with a test suite that needs to be written and maintained. [Making impossible states impossible](TODO: Link) has been one of the common themes in the functional programming community, and it really helps both during initial development, as well as during refactoring when fixing bugs, or responding to new or changing requirements.

## Summary

What those examples clearly demonstrate is that a "more expressive" language or type system allows us to _express more_ (1) with less code (2) in a more concicse and readable way. The second point is made even more obvious when working with ADTs (switching/pattern matching), but this might be a topic for another article.
