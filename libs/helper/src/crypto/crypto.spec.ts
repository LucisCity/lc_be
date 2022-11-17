import { randomBytes } from 'crypto';
import { decrypt, encrypt } from './crypto';

describe('Crypto helper', function () {
  // it('test generate iv', function () {
  //   const iv = randomBytes(16);
  //   console.log('iv: ', iv.toString('hex'));
  // });
  it('test enctyp-decrypt', async function () {
    const result = await encrypt('hex');
    console.log('encrypt: ', result);
    const dResult = await decrypt(result);
    console.log('dResult: ', dResult);
  });
});
