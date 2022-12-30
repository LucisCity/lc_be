## Referral

- Add transaction type (in database): (code : "CLAIM_REFERRER", description: "any")
- Add .env: REWARD_REFERRAL

## Invest

- Add into .env:

* ADMIN_PORT=9001
* ADMIN_REGISTER_ENABLE=false

- Docker config:

* add into .env in deploy folder: ADMIN_PORT
* add container config for admin copy from docker-compose.yml.example

- Update db: first time init so only need run

```
docker exec -it lc_api bash & yarn db:push
```

## Blockchain
- Add pool type (indatabase)
    - INSERT INTO public.pool_wallet_type (code, description) VALUES ('USDT_POOL'::varchar(100), 'pool for usdt'::text)
- Add .env: USDT_ADDRESS=


## Account

- Add endpoint prefix: /api/*
- Add .env: 
 S3_BUCKET=
 S3_BUCKET_METADATA=
 S3_REGION=
 S3_ACCESS_KEY=
 S3_SECRET=

