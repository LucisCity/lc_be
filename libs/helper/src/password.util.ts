import * as bcrypt from 'bcrypt';
import PasswordValidator = require('password-validator');

// --- Create password validator schema
const schema = new PasswordValidator();
schema.is().min(8).is().max(32).has().letters().has().digits();

const validate = (value: string) => {
  const valid = schema.validate(value);
  return valid;
};

async function hashPassword(password: string): Promise<string> {
  const hash = await bcrypt.hash(
    password,
    parseInt(process.env.PASS_SALT ?? '10'),
  );
  return hash;
}

const comparePassword = async (
  planePw: string,
  hashedPw: string,
): Promise<boolean> => {
  return bcrypt.compare(planePw, hashedPw);
};

export const PasswordUtils = {
  hashPassword,
  comparePassword,
  validate,
};

// export interface JwtToken {
//   user_id: number;
//   timestamp?: number;
//   expiresIn?: string;
// }

// const getUserToken = (data: JwtToken) => {
//   return jwt.sign(
//     {
//       user_id: data.user_id,
//       timestamp: data.timestamp || Date.now(),
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: data.expiresIn || '12h' },
//   );
// };

// const verifyToken = (token: string): any => {
//   try {
//     return jwt.verify(token, process.env.JWT_SECRET);
//   } catch (error: any) {
//     console.log('err verifyToken :', error.message);
//   }
// };

// export const JwtUtils = {
//   getUserToken,
//   verifyToken,
// };
