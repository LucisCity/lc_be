# Prepare

Register facebook app and setup login facebook: https://developers.facebook.com/

# Installation

## Update ENV

```
cp .env.example .env
```

## Run with docker:

Update docker file and run deploy file

```bash
cd deploy
cp .env.example .env
cp docker-compose.yml.example docker-compose.yml
deploy.sh
docker exec -it lc_api bash && yarn db:push
```

## Running the app local

```bash
npm install
npm run generate

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
