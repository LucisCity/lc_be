## Referral
- Add transaction type (in database)
  - INSERT INTO transaction_type (code, description) VALUES ('CLAIM_REFERRAL', 'claim referral')
- Add .env: REWARD_REFERRAL=

## Blockchain
- Add pool type (indatabase)
  - INSERT INTO public.pool_wallet_type (code, description) VALUES ('USDT_POOL'::varchar(100), 'pool for usdt'::text)
- Add .env: USDT_ADDRESS=