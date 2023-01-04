/\*\*

- - Flow compute profit:
- - when end this period
- - get all valid project (enable, time to compute profit)
- - check user bought nft
- - crete log and increase profit_wallet amount
- - Flow claim:
- - check profit_wallet
- - create log, decrease amount
- - relay attack
-
- Test case:
- - Project must enable
- - valid time compute profit ->
- - user bought nft
- - user not claim profit in this period
- - valid claim amount (user may be not claim many period)
- - user sell nft (not compute profit in this period)
- - relay attack
    \*/
