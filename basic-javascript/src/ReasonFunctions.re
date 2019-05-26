let reasonSum = (a, b) => a + b;

type user = {
  id: int,
  name: string,
  isActive: bool,
};

[@genType]
let getUser = (): user => {id: 1, name: "User1", isActive: true};
