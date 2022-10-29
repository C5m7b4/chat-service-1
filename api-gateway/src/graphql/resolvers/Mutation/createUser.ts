import UserService from '#root/adapters/UsersService';

interface Args {
  password: string;
  username: string;
}

const createUserResolver = async (obj: any, { password, username }: Args) => {
  return await UserService.createUser({ password, username });
};

export default createUserResolver;
