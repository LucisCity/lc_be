import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const CRYPTO_PASS = process.env.CRYPTO_PASS ?? 'DEFAULT_PASS';
const CRYPTO_SALT = process.env.CRYPTO_SALT ?? 'DEFAULT_SALT';
const CRYPTO_IV = process.env.CRYPTO_IV ?? '25d0cefa4ff25b72a04f17ccf6058d39';
// const iv = randomBytes(16);
// console.log('CRYPTO_IV:', CRYPTO_IV);
// console.log('iv: ', iv.toString('hex'));

export async function encrypt(value: string) {
  // The key length is dependent on the algorithm.
  // In this case for aes256, it is 32 bytes.
  const key = (await promisify(scrypt)(CRYPTO_PASS, CRYPTO_SALT, 32)) as Buffer;
  const cipher = createCipheriv(
    'aes-256-ctr',
    key,
    Buffer.from(CRYPTO_IV, 'hex'),
  );

  const encryptedText = Buffer.concat([cipher.update(value), cipher.final()]);
  return encryptedText.toString('hex');
}

export async function decrypt(value: string) {
  const key = (await promisify(scrypt)(CRYPTO_PASS, CRYPTO_SALT, 32)) as Buffer;
  const decipher = createDecipheriv(
    'aes-256-ctr',
    key,
    Buffer.from(CRYPTO_IV, 'hex'),
  );
  const decryptedText = Buffer.concat([
    decipher.update(Buffer.from(value, 'hex')),
    decipher.final(),
  ]);
  return decryptedText.toString();
}
