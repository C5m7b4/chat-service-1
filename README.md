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

in the phpmyadmin folder create a file called config.user.php and it should look like this:

```js
<?php
  $i++;
  $cfg['Servers'][$i]['verbose'] = 'chat-service'
  $cfg['Servers'][$i]['host'] = 'chat-service_db'
  $cfg['Servers'][$i]['port'] = ''
  $cfg['Servers'][$i]['socket'] = ''
  $cfg['Servers'][$i]['connection_type'] = 'tcp'
  $cfg['Servers'][$i]['extension'] = 'mysqli'
  $cfg['Servers'][$i]['auth_type'] = 'config'
  $cfg['Servers'][$i]['user'] = 'root'
  $cfg['Servers'][$i]['password'] = 'password'
  $cfg['Servers'][$i]['AllowNoPassword'] = false

  $i++;
  $cfg['Servers'][$i]['verbose'] = 'users-service'
  $cfg['Servers'][$i]['host'] = 'users-service_db'
  $cfg['Servers'][$i]['port'] = ''
  $cfg['Servers'][$i]['socket'] = ''
  $cfg['Servers'][$i]['connection_type'] = 'tcp'
  $cfg['Servers'][$i]['extension'] = 'mysqli'
  $cfg['Servers'][$i]['auth_type'] = 'config'
  $cfg['Servers'][$i]['user'] = 'root'
  $cfg['Servers'][$i]['password'] = 'password'
  $cfg['Servers'][$i]['AllowNoPassword'] = false
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
      - 7000:7000
    volumes:
      - ./api-gateway:/opt/app 

  chat-service:
    build:
      context: "."
      dockerfile: "./chat-service/Dockerfile"
    depends_on:
      - chat-service-db
    ports:
      - 7100:7100
    volumes:
      - ./chat-service:/opt/app    

  chat-service-db:
    environment:
      - MYSQL_ROOT_PASSWORD=MYSQL_ROOT_PASSWORD
      - MYSQL_DATABASE=serice_db
    image: mysql:5.7.20
    ports:
      - 7200:7200

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    ports:
      - 7300:7300
    volumes:
      - ./phpmyadmin/config.user.inc.php:/etc/phpmyadmin/config.user.inc.php

  users-service:
    build:
      context: "."
      dockerfile: "./users-service/Dockerfile"
    depends_on:
      - users-service-db
    ports:
      - 7101:7101
    volumes:
      - ./users-service:/opt/app    

  users-service-db:
    environment:
      - MYSQL_ROOT_PASSWORD=MYSQL_ROOT_PASSWORD
      - MYSQL_DATABASE=serice_db
    image: mysql:5.7.20
    ports:
      - 7201:7201


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

now you should be clean and ready to proceeed.