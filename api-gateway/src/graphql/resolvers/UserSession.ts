import UsersService from '#root/adapters/UsersService';
import { UserSessionType } from '#root/graphql/types';

const UserSession = {
  // id: async (userSession: UserSessionType) => {
  //   const user = await UsersService.fetchUser({ userId: userSession.userId });
  //   return user?.username;
  // },
  user: async (userSession: UserSessionType) => {
    return await UsersService.fetchUser({ userId: userSession.userId });
  },
};

export default UserSession;
