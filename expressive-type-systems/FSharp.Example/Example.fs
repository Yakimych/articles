namespace FSharp.Example

type ApiCallResult =
    | Success of int
    | Error of string

module ApiCallResultExample =
    let successResult = Success(12)
    let errorResult = Error("An error has occured")
