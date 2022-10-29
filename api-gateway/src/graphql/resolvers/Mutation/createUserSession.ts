import UserService from '#root/adapters/UsersService';
import { ResolverContext } from '#root/graphql/types';

interface Args {
  password: string;
  username: string;
}

const createUserSessionResolver = async (
  obj: any,
  { password, username }: Args,
  context: ResolverContext
) => {
  const userSession = await UserService.createUserSession({
    password,
    username,
  });

  context.res.cookie('userSessionId', userSession.id, { httpOnly: true });

  return userSession;
};

export default createUserSessionResolver;
