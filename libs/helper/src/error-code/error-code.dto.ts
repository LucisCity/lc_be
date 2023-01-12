import { registerEnumType } from '@nestjs/graphql';

export enum ErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  NOT_ENOUGH_NFT = 'NOT_ENOUGH_NFT',
  INVALID_TIME_VOTE_SELL = 'INVALID_TIME_VOTE_SELL',
  SELL_VOTED = 'SELL_VOTED',
  EMAIL_INVALID = 'EMAIL_INVALID',
  ERROR_500 = 'ERROR_500',
  FB_ID_NOT_FOUND = 'FB_ID_NOT_FOUND',
  TOKEN_INVALID = 'TOKEN_INVALID',
  NEW_PASS_SAME_OLD_PASS = 'NEW_PASS_SAME_OLD_PASS',
  SIGNATURE_EXPIRED = 'SIGNATURE_EXPIRED',
  SIGNATURE_WRONG = 'SIGNATURE_WRONG',
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  BALANCE_NOT_ENOUGH = 'BALANCE_NOT_ENOUGH',
  BALANCE_POOL_NOT_ENOUGH = 'BALANCE_POOL_NOT_ENOUGH',
  USERNAME_DUPLICATED = 'USERNAME_DUPLICATED',
  DUPLICATE_WALLET_ADDRESS = 'DUPLICATE_WALLET_ADDRESS',
  KYC_PENDING_OR_SUCCEED = 'KYC_PENDING_OR_SUCCEED',
  USER_CONNECTED_WALLET = 'USER_CONNECTED_WALLET',
  TEST_SERVER_ERROR = 'TEST_SERVER_ERROR',
  ACCOUNT_EXISTED = 'ACCOUNT_EXISTED',
  INVITEE_NOT_EXIST = 'INVITEE_NOT_EXIST',
  REFERRAL_CLAIMED = 'REFERRAL_CLAIMED',
  WRONG_OLD_PASS = 'WRONG_OLD_PASS',
  INVALID_NEW_PASS = 'INVALID_NEW_PASS',
  NOT_VIP_USER = 'NOT_VIP_USER',
  PROFIT_IS_ZERO = 'PROFIT_IS_ZERO',
  WRONG_PASSWORD = 'WRONG_PASSWORD',
}

registerEnumType(ErrorCode, {
  name: 'ErrorCode',
  description: 'all back-end error code',
});
