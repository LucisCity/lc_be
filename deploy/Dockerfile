FROM node:16.15.0 AS builder

ENV APP_HOME=/home/app
WORKDIR $APP_HOME
# COPY --chown=app:app package.json $APP_HOME/
RUN npm install -g prisma
COPY package.json $APP_HOME/
RUN yarn install
COPY . $APP_HOME
RUN yarn generate
RUN yarn build

CMD ["npm", "run", "start:main"]