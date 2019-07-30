type SomeEvent = {
  description: string;
  date: Date;
};

const jsonParse = (): SomeEvent => {
  const someEvent: SomeEvent = {
    description: "Birthday",
    date: new Date()
  };

  const serializedEvent: string = JSON.stringify(someEvent);

  const deserializedEvent: SomeEvent = JSON.parse(serializedEvent);

  // Runtime crash
  deserializedEvent.date.getDate();

  return deserializedEvent;
};

/*
someEvent.date
Wed Jul 17 2019 20:56:50 GMT+0200 (Central European Summer Time)

deserializedEvent.date
"2019-07-17T18:56:50.128Z"

deserializedEvent.date.getDay()
Uncaught TypeError: deserializedEvent.date.getDay is not a function
*/
