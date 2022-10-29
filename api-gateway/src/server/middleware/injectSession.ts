import { NextFunction, Request, Response } from 'express';

import UsersService from '#root/adapters/UsersService';

const injectSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.cookies.userSessionId) {
    const userSession = await UsersService.fetchUsersSession({
      sessionId: req.cookies.userSessionId,
    });

    res.locals.userSession = userSession;
    console.log('userSession injected', userSession);
  }

  return next();
};

export default injectSession;
