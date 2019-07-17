export const sum = (a: number, b: number) => a + b;

type User = {
  id: number;
  name: string;
};

type UsersApiResponse = {
  users: User[];
};

import axios from "axios";

const getUsers = async (): Promise<User[]> => {
  const response = await axios.get<UsersApiResponse>("asd");

  return response.data.users;
};

type SomeEvent = {
  description: string;
  date: Date;
};

const jsonTest = (): SomeEvent => {
  const someEvent: SomeEvent = {
    description: "Birthday",
    date: new Date()
  };

  const serializedEvent: string = JSON.stringify(someEvent);

  const deserializedEvent: SomeEvent = JSON.parse(serializedEvent);

  return deserializedEvent;
};

// someEvent.date
// Wed Jul 17 2019 20:56:50 GMT+0200 (Central European Summer Time)

// deserializedEvent.date
// "2019-07-17T18:56:50.128Z"

// deserializedEvent.date.getDay()
// Uncaught TypeError: deserializedEvent.date.getDay is not a function
