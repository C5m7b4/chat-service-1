import config from 'config';
import dayjs from 'dayjs';
import { Express } from 'express';
import { getConnection, getRepository } from 'typeorm';

import User from '#root/db/entities/User';
import UserSession from '#root/db/entities/UserSession';
import passwordCompareSync from '#root/helpers/passwordCompareSync';
import generateUUID from '#root/helpers/generateUUID';

const USER_SESSION_EXPIRY_HOURS = <number>(
  config.get('USER_SESSION_EXPIRY_HOURS')
);

const setupRoutes = (app: Express) => {
  const connection = getConnection();
  const userRepository = getRepository(User);

  app.post('/sessions', async (req, res, next) => {
    if (!req.body.username || !req.body.password) {
      return next(new Error('Invalid body'));
    }

    try {
      const user = await userRepository.findOne(
        { username: req.body.username },
        {
          select: ['id', 'passwordHash'],
        }
      );

      if (!user) return next(new Error('Invalid username'));

      if (!passwordCompareSync(req.body.password, user.passwordHash)) {
        return next(new Error('invalid password'));
      }

      const expiresAt = dayjs()
        .add(USER_SESSION_EXPIRY_HOURS, 'hour')
        .toISOString();

      const sessionToken = generateUUID();

      const userSession = {
        expiresAt,
        id: sessionToken,
        userId: user.id,
      };

      await connection
        .createQueryBuilder()
        .insert()
        .into(UserSession)
        .values(userSession);

      return res.json(userSession);
    } catch (error) {
      return next(error);
    }
  });

  app.get('/users/:userId', async (req, res, next) => {
    try {
      const user = await userRepository.findOne(req.params.userId);

      if (!user) return next(new Error('Invalid user ID'));

      return res.json(user);
    } catch (e) {
      return next(e);
    }
  });
};

export default setupRoutes;
