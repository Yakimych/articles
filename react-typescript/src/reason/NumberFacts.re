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

[@genType]
let fetchNumberFact = () =>
  Js.Promise.(
    Fetch.fetch("http://numbersapi.com/random/math?json")
    |> then_(Fetch.Response.json)
    |> then_(json => json |> Decode.fact |> resolve)
  );
