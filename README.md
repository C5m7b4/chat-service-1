# chat service

all of this work came from this [youtube playlist](https://www.youtube.com/watch?v=PUmXufS9y-8&list=PLnTRniWXnjf8QRhvnklsyapGfFZ6ACdSf&index=1)

Here is what our folder structure is going to look like:

![alt folder-structure](images/01_folder_structure.png)
 
We are going to start with the api-gateway and add a Dockerfile like so:

 ```js
FROM node:14

COPY . ./opt/app

WORKDIR /opt/app

RUN yarn

CMD yarn watch
 ```

We are going to install these depenencies in the api-gateway folder

```js
 yarn add -D module-alias ts-node-dev typescript @types/node
```

then let's add our start script

```js
  "scripts":{
    "watch": "ts-node-dev --respawn index.dev.ts"
  },
```


We'll add that file index.d.ts in the root of our api-gateway folder

```js
import 'module-alias/register';

import './src/index';
```

then create our src/index.ts

```js
console.log('api-gateway says hi');

```

then you should be able to run yarn watch and see it tracking your changes

at this point, let's setup our git ignore file

```js
npx gitignore node
```

take the contents we have so far and copy them into the other services folders and change the naming around to match accordingly

then go into each folder and run yarn to install the node_modules

in the phpmyadmin folder create a file called config.user.inc.php and it should look like this:

```js
<?php
  $i++;
  $cfg['Servers'][$i]['verbose'] = 'chat-service';
  $cfg['Servers'][$i]['host'] = 'chat-service-db';
  $cfg['Servers'][$i]['port'] = '';
  $cfg['Servers'][$i]['socket'] = '';
  $cfg['Servers'][$i]['connect_type'] = 'tcp';
  $cfg['Servers'][$i]['extension'] = 'mysqli';
  $cfg['Servers'][$i]['auth_type'] = 'config';
  $cfg['Servers'][$i]['user'] = 'root';
  $cfg['Servers'][$i]['password'] = 'password';
  $cfg['Servers'][$i]['AllowNoPassword'] = false;

  $i++;
  $cfg['Servers'][$i]['verbose'] = 'users-service';
  $cfg['Servers'][$i]['host'] = 'users-service-db';
  $cfg['Servers'][$i]['port'] = '';
  $cfg['Servers'][$i]['socket'] = '';
  $cfg['Servers'][$i]['connect_type'] = 'tcp';
  $cfg['Servers'][$i]['extension'] = 'mysqli';
  $cfg['Servers'][$i]['auth_type'] = 'config';
  $cfg['Servers'][$i]['user'] = 'root';
  $cfg['Servers'][$i]['password'] = 'password';
  $cfg['Servers'][$i]['AllowNoPassword'] = false;
```

this will actually be really cool. it's the only php that we will see though!!

now, in the root of the project add a file called docker-compose.yml

now your folders should look like this
![alt folder_structures2](images/02_folder_structure2.png)

this should be the contents:

```js
version: "3.8"
services:
  api-gateway:
    build:
      context: "."
      dockerfile: "./api-gateway/Dockerfile"
    depends_on:
      - chat-service
      - users-service
    ports:
      - "7000:7000"
    volumes:
      - ./api-gateway:/opt/app 

  chat-service:
    build:
      context: "."
      dockerfile: "./chat-service/Dockerfile"
    depends_on:
      - chat-service-db
    ports:
      - "7100:7100"
    volumes:
      - ./chat-service:/opt/app    

  chat-service-db:
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=db
    image: mysql:5.7.20
    ports:
      - "7200:3306"

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    ports:
      - "7300:80"
    volumes:
      - ./phpmyadmin/config.user.inc.php:/etc/phpmyadmin/config.user.inc.php

  users-service:
    build:
      context: "."
      dockerfile: "./users-service/Dockerfile"
    depends_on:
      - users-service-db
    ports:
      - "7101:7101"
    volumes:
      - ./users-service:/opt/app    

  users-service-db:
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=db
    image: mysql:5.7.20
    ports:
      - "7201:3306"


```

now you should be able to run the command 

```js
docker-compose up
```

and then your terminal will go crazy, but at the end, you should be able to find these three lines

![alt hi](images/03-hi.png)

if all that worked out well, you can type ctrl-d and it will kill the services, but there is one plugin that we are going to look at. Go to your extensions and install this plugin

![alt docker-plugin](images/05-docker-plugin.png)

even though we did ctrl-c, you will notice that the containers are still there

![alt-containers](images/06-stopped-containers.png)

to actually get them to do away

```js
docker-compose down
```

now you should be clean and ready to proceeed. If you have everything setup correctly, you should be able to go to localhost:7300 and see both of your databases:

![alt phpmyadmin](images/07-phpmyadmin.png)

this is a neat way of working with multiple databases

just make sure that you can see the db database on both

![alt chat-service-db](images/08-chat-service-db.png)
![alt users-service-db](images/09-users-service-db.png)

## branch 2

go into users_service folder and let's install some dependencies

```js
yarn add config mysql2 reflect-metadata typeorm
yarn add -D @types/config ts-node
```

next up we are going to create a db folder in the src folder of the users-service and create a file called connection.ts

it should look like this:

```js
import config from 'config';
import { createConnection, Connection } from 'typeorm';

let connection: Connection;

export const initConnection = async () => {
  connection = await createConnection({
    type: 'mysql',
    url: <string>config.get('USERS_SERVICE_DB_URL'),
  });
};

const getConnection = () => connection;

export default getConnection;

```

now lets create a config folder in the root of users-service and add a default.ts file

```js
export const USERS_SERVICE_DB_URL = 'mysql://root:password@users-service-db/db';

```

this will basically be the connection string to mysql

then we are going to create another file in the root of the users-service called tsconfig.json

```js
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "module": "CommonJS",
    "paths":{
      "#root/*":["./src/*"]
    },
    "skipLibCheck": true,
    "strict": true,
    "strictPropertyInitialization": false,
    "target": "es5"
  }
}
```

then we are going to come back over to our index.ts inside of the src folder inside of users-service

```js
import 'reflect-metadata';

import { initConnection } from '#root/db/connection';

initConnection().then(() => {
  console.log('DB connection established');
});

console.log('users_service says hi');
```

then we need to add the alias to the package.json. add this to the bottom of the package.json

```js
  "_moduleAliases":{
    "#root":"./src"
  }
```

now when we run docker-compose up we should get a console message 'DB connection established'

## migrations

******************************************

cd into users_service and create a file calle ormconfig.json

```js
{
  "cli":{
    "migrationsDir":"src/db/migrations"
  },
  "entities": ["src/db/entities/*.ts"],
  "logging": false,
  "migrations": ["src/db/migrations/*.ts"],
  "synchronize": true,
  "type": "mysql",
  "url":"mysql://root:password@users-service-db/db"
}
```

for now, we are going to downgrade our version of typeorm. I will look into updating this when I get a chance 😡

```js
yarn add typeorm@0.2.29
```

then we are going to run this command

```js
yarn typeorm migration:create -n users
```

this should generate a migrations folder inside of your db folder:

![alt migrations](images/010-migrations.png)

inside of this file it should look like this:

```js
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class Users1666988136226 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        columns: [
          {
            isPrimary: true,
            length: '36',
            name: 'id',
            type: 'char',
          },
          {
            length: '25',
            name: 'username',
            type: 'varchar',
          },
          {
            length: '60',
            name: 'passwordHash',
            type: 'char',
          },
          {
            default: 'now()',
            name: 'createdAt',
            type: 'timestamp',
          },
        ],
        name: 'users',
      })
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        columnNames: ['username'],
        isUnique: true,
        name: 'unique_username',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}

```

now we are going to add two scripts to our package.json

```js
    "db:migrate":"ts-node ./node_modules/typeorm/cli.js migration:run",
    "db:migrate:undo":"ts-node ./node_modules/typeorm/cli.js migration:revert"
```

now let's spin everything up with docker-compose up and we will connect to the container and run our first migration. to get into our running containers, we are going to use this command:

```js
docker-compose exec users-service bash
```

now you should have a prompt and if you run an ls command you should see this:

![alt contents](images/011-contents.png)


now we can run the command

```js
yarn db:migrate
```

there is going to be a bunch of stuff printed out to your bash. It should look familiar if you are familiar with sql syntax and creating tables. So, now if we go back into phpmyadmin, we should see our table. To get back to phpmyadmin go to localhost:7300, select the users-service and expand the db to see the users table

![alt users](images/012-users-table.png)

create a folder called entities inside the db folder and create a file called User.ts
the contents should look like this

```js
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export default class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ select: false })
  passwordHash: string;

  @CreateDateColumn()
  createdAt: string;
}

```

now go into your connection.ts file and import that entity

```js
import User from './entities/User';
```

then add this line right above type: 'mysql

```js
entities: [User],
```

you can check the repo file if you are having trouble with this

## start of video 3 from series

******************************************

```js
yarn add express cors
yarn add -D @types/express @types/cors
```

then create a folder inside of src called server and create a startServer.ts file inside of that. Then create a helpers folder inside of src and create a filed called accessEnv.ts
the contents should look like this:

```js
const cache: { [key: string]: string } = {};

const accessEnv = (key: string, defaultValue: string) => {
  if (!(key in process.env) || typeof process.env[key] === undefined) {
    if (defaultValue) return defaultValue;
    throw new Error(`${key} not found in process.env`);
  }

  if (!(key in cache)) {
    cache[key] = <string>process.env[key];
  }

  return cache[key];
};

export default accessEnv;

```

now we will go back to start server and make it look like this

```js
import bodyParser from 'body-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import accessEnv from '#root/helpers/accessEnv';

const PORT = parseInt(accessEnv('PORT', '7101'), 10);

const startServer = () => {
  const app = express();

  app.use(bodyParser.json());

  app.use(
    cors({
      origin: (origin, cb) => cb(null, true),
      credentials: true,
    })
  );

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    return res.status(500).json({ message: err.message });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.info(`Users service is running on port ${PORT}`);
  });
};

export default startServer;

```

now let's go back to index.ts and make it look like this:

```js
import 'reflect-metadata';

import { initConnection } from '#root/db/connection';
import startServer from '#root/server/startServer';

initConnection().then(() => {
  startServer();
});

```

now let's do a docker-compose up and we should see this:

![alt users-service](images/013-users-service.png)

you can go to localhost:7101 and you should see this:

![alt cannot-get](images/014-cannot-get.png)

now let's create a file in the server director called routes.ts
it should look like this:

```js
import { Express } from 'express';
import { getRepository } from 'typeorm';
import User from '#root/db/entities/User';

const setupRoutes = (app: Express) => {
  const userRepository = getRepository(User);

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

```

then we are going to import that into startServer

```js
import setupRoutes from './routes';
```

now in startServer we need to add this line right above our error handler code:

```js
setupRoutes(app)
```

now run press ctrl-c on the command line to kill everything and run a docker-compose down. then we are going to modify our package.json a little bit

```js
"watch": "ts-node-dev --poll --respawn index.dev.ts",
```

then run docker-compose-up and let's test things out. You may have to go back to the migrations and re-run your migration if you have been using docker-compose down becuase the users table may not be there anymore.

so if we go to localhost:7101/users/test we will see this:

![alt user-not found](images/015-user-not-found.png)

so let's manually enter a user into phpmyadmin first, but we are going to need a hashed password so go to [bcrypt generator](https://bcrypt-generator.com/) and just put in password and hash that and use that for the passwordHash when you create a fake user. then go to browse and copy the id so we can use that in the url

![alt password](images/016-password.png)

now we can test the url again

![alt user](images/017-user.png)

## Start of video 4 from series

******************************************

now we are going to create a migration for our user sessions so then we can start to work on authentication. cd back into users-service and type this command

```js
yarn typeorm migration:create -n userSessions
```

that should give us a new file in the migrations folder which we should make look like this:

```js
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class UserSessions1666993435523 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        columns: [
          {
            isPrimary: true,
            length: '36',
            name: 'id',
            type: 'char',
          },
          {
            length: '36',
            name: 'userId',
            type: 'char',
          },
          {
            default: 'now()',
            name: 'createdAt',
            type: 'timestamp',
          },
          {
            name: 'expiresAt',
            type: 'datetime',
          },
        ],
        name: 'userSessions',
      })
    );

    await queryRunner.createForeignKey(
      'userSessions',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('userSessions');
  }
}

```

now let's start our docker-compose up and we will run this command

```js
docker-compose exec users-service bash
```

once your in, run this command

```js
yarn db:migrate
```

now we should be able to go over to phpmyadmin and see our new table

![alt usersSession](images/018-usersSessions.png)

now go into the entities folder and create a file called UserSession.ts

```js
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('userSessions')
export default class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('char', { length: 36 })
  userId: string;

  @CreateDateColumn()
  createdAt: string;

  @Column('datetime')
  expiresAt: string;
}

```

now import UserSession into the connection.ts like so

```js
import UserSession from './entities/UserSession'
```

and add it to the array inside of this file

now create a file called passwordCompareSync.ts inside of the helpers folder

let install bcryptjs so cd into the users-service folder and run

```js
yarn add bcryptjs
yarn add -D @types/bcryptjs
yarn add dayjs
yarn add uuid
yarn add -D @types/uuid
````

inside passwordCompareSync, make it look like this:

```js
import bcrypt from 'bcryptjs';

const passwordCompareSync = (passwordToTest: string, passwordHash: string) =>
  bcrypt.compareSync(passwordToTest, passwordHash);

export default passwordCompareSync;

```

now import that into our routes

```js
import passwordCompareSync from '#root/helpers/passwordCompareSync'
```

let's go into default.ts and paste in this line:

```js
const USER_SESSION_EXPIRY_HOURS=1
```

now add these two imports into the routes.ts file

```js
import config from 'config'
import dayjs from 'dayjs';
```

and then at the top of the routes.ts file add this line

```js
const USER_SESSION_EXPIRY_HOURS = <number>config.get('USER_SESSION_EXPIRY_HOURS')
```

then in the helpers folder create a file called generateUUID.ts

```js
import { v4 as uuidv4 } from 'uuid';

const generateUUID = () => uuidv4();

export default generateUUID;

```

finally back to our routes.ts file
the imports should now look like this:

```js
import config from 'config';
import dayjs from 'dayjs';
import { Express } from 'express';
import { getConnection, getRepository } from 'typeorm';

import User from '#root/db/entities/User';
import UserSession from '#root/db/entities/UserSession';
import passwordCompareSync from '#root/helpers/passwordCompareSync';
import generateUUID from '#root/helpers/generateUUID';
```

we are going to add this right after we generate the express app

```js
  const connection = getConnection();
```

and then we are going to add a new route

```js
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
```

now we can use either insomnia or postman to test our new post endpoint. I'm going to use insomnia so here is how this works:

![alt insomnia](images/019-insomnia.png)

click on the create button

![alt create](images/020-create.png)
![alt require-collection](images/021-request-collection.png)
![alt create-collection](images/023-create-collection.png)

now we are going to create our post request
![alt create-request](images/024-create-request.png)
![alt json-body](images/025-json-body.png)

we also need to run docker-compose up

now if we run our post request, we should see this
![alt-sessions](images/026-sessions.png)

you can also test out sending an empty body
![alt empty-body](images/027-empty-body.png)

and a wrong password
![alt invalid-password](images/028-invalid-password.png)

and an invalid username
![alt invalid-username](images/029-invalid-username.png)