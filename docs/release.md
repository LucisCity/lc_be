## Referral

- Add transaction type (in database): (code : "CLAIM_REFERRER", description: "any")
- Add .env: REWARD_REFERRAL

## Invest

- Add into .env:

* ADMIN_PORT=9001
* ADMIN_REGISTER_ENABLE=false

- Update db: first time init so only need run

```
docker exec -it lc_api bash & yarn db:push
```
