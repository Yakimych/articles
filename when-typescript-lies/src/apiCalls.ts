import axios from "axios";
import {
  Decoder,
  object,
  number,
  string,
  array
} from "@mojotech/json-type-validation";

type User = {
  id: number;
  name: string;
};

type UsersApiResponse = {
  users: User[];
};

const getUsers = async (): Promise<User[]> => {
  const response = await axios.get<UsersApiResponse>("server_url/api/users");

  return response.data.users;
};

/* Solution with decoders */
const userDecoder: Decoder<User> = object({
  id: number(),
  name: string()
});

const userApiresponseDecoder: Decoder<UsersApiResponse> = object({
  users: array(userDecoder)
});

const getUsersDecoded = async (): Promise<User[]> => {
  const response = await axios.get<unknown>("server_url/api/users");

  const decodedResponse = userApiresponseDecoder.runWithException(
    response.data
  );

  // Safe to access users at this point
  return decodedResponse.users;
};
