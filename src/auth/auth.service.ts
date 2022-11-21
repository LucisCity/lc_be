import { AppError } from '@libs/helper/errors/base.error';
import { PasswordUtils } from '@libs/helper/password.util';
import { randString } from '@libs/helper/string.helper';
import { PrismaService } from '@libs/prisma';
import { HttpService, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { firstValueFrom } from 'rxjs';
import { FbDebugResponse, RegisterInput } from './auth.type';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  private readonly FB_APP_ID = process.env.FB_APP_ID;
  private readonly FB_APP_TOKEN = process.env.FB_APP_TOKEN;
  private readonly gClient = new OAuth2Client(this.GOOGLE_CLIENT_ID);
  private readonly userSv: any;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private http: HttpService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (!user || !user.password) {
      this.logger.debug('login: user not found');
      throw new AppError('Bad request');
    }
    const isValid = await PasswordUtils.comparePassword(pass, user.password);
    if (!isValid) {
      throw new AppError('Bad request', 'BAD_REQUEST');
    }
    const jwtToken = this.jwt.sign({
      id: user.id,
      role: user.role,
    });

    return {
      token: jwtToken,
      user,
    };
  }

  async register(input: RegisterInput) {
    // const isStrong = PasswordUtils.validate(pass);
    const hashPass = await PasswordUtils.hashPassword(input.password);
    const user = await this.prisma.user.create({
      data: {
        role: 'USER',
        email: input.email,
        ref_code: randString(10),
        invite_by: input.ref_code,
        password: hashPass,
        profile: {
          create: {
            given_name: input.email.split('@')[0],
          },
        },
      },
    });
    return user;
  }

  async loginGoogle(token: string, code?: string) {
    let payload: any;
    try {
      const result = await this.gClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = result.getPayload();
    } catch (err) {
      this.logger.debug(err);
      throw new AppError('Bad request', 'BAD_REQUEST');
    }

    // console.log('payload:', payload)
    // const domain = payload['hd'];
    const {
      sub,
      email,
      email_verified,
      name,
      picture,
      given_name,
      family_name,
      locale,
    } = payload;
    if (!sub) {
      throw new AppError('Something went wrong', '500');
    }
    if (!email || !email_verified) {
      throw new AppError('Please provide email!', 'INPUT_NOT_VALID');
    }

    // Valid, is owner
    let userInfo = await this.userSv.user(
      {
        OR: [
          {
            google_id: sub,
          },
          {
            email,
          },
        ],
      },
      true,
    );
    let is_login = false;
    if (!userInfo) {
      is_login = true;
      // create new if not exist user
      userInfo = await this.userSv.create({
        google_id: sub,
        email,
        code: randString(10),
        profile: {
          create: {
            avatar: picture,
            given_name,
            family_name,
            display_name:
              family_name && given_name
                ? family_name + ' ' + given_name
                : !family_name
                ? given_name
                : family_name,
          },
        },
      });
    }
    const timestamp = Date.now();
    const jwtToken = this.jwt.sign({
      id: userInfo.id,
      timestamp,
    });

    const user_infor = await this.prisma.user.findUnique({
      where: {
        id: userInfo.id,
      },
      include: {
        profile: true,
      },
    });

    return {
      token: jwtToken,
      user: user_infor,
    };
  }

  async loginFacebook(accessToken: string, code?: string) {
    console.log('accessToken:', accessToken);
    console.log('this.FB_APP_SECRET:', this.FB_APP_TOKEN);
    let response: any;
    try {
      response = await firstValueFrom(
        this.http.get(
          'https://graph.facebook.com/debug_token?input_token=' +
            accessToken +
            '&access_token=' +
            this.FB_APP_TOKEN,
        ),
      );
      response = response.data;
      // console.log("debug_fb: ", response.data)
    } catch (err) {
      this.logger.debug(err);
      throw new AppError('Bad request', 'BAD_REQUEST');
    }
    const data: FbDebugResponse = response.data;
    if (data.error) {
      throw new AppError(data.error.message || 'Check token error', '500');
    }
    if (!data.is_valid) {
      throw new AppError('Bad request', 'BAD_REQUEST');
    }
    // get user info
    try {
      response = await firstValueFrom(
        this.http.get(
          'https://graph.facebook.com/me?fields=id,name,gender,cover,picture,email&access_token=' +
            accessToken,
        ),
      );
      response = response.data;
      // console.log("me_fb: ", response)
    } catch (err) {
      this.logger.debug(err);
      throw new AppError('Bad request', 'BAD_REQUEST');
    }

    const facebook_id = response.id;
    const email = response.email;
    // let fullName = response.name || (email && email.substring(0, email.lastIndexOf('@')))
    const firstName = response.first_name ?? response.name;
    const lastName = response.last_name;
    // let gender = response.gender// === 'male'
    const avatar =
      response.picture && response.picture.data && response.picture.data.url;

    if (!facebook_id) {
      throw new AppError('Info not enough', 'INPUT_NOT_VALID');
    }

    // Valid, is owner
    let userInfo = await this.userSv.user(
      {
        facebook_id,
      },
      true,
    );
    let is_login = false;
    if (!userInfo) {
      is_login = true;
      // create new if not exist user
      userInfo = await this.userSv.create({
        facebook_id,
        email,
        code: randString(10),
        profile: {
          create: {
            avatar,
            given_name: firstName,
            family_name: lastName,
            display_name:
              firstName && lastName
                ? firstName + ' ' + lastName
                : !firstName
                ? lastName
                : firstName,
          },
        },
      });
    }

    const timestamp = Date.now();
    const jwtToken = this.jwt.sign({
      id: userInfo.id,
      timestamp,
    });

    const user_infor = await this.prisma.user.findUnique({
      where: {
        id: userInfo.id,
      },
      include: {
        profile: true,
      },
    });

    return {
      token: jwtToken,
      user: user_infor,
    };
  }
}
