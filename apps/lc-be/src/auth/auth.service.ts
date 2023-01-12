import { AppError } from '@libs/helper/errors/base.error';
import { PasswordUtils } from '@libs/helper/password.util';
import { randString } from '@libs/helper/string.helper';
import { PrismaService } from '@libs/prisma';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { FbDebugResponse, RegisterInput } from './auth.type';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailService, EventType, VerifyInput } from '@libs/helper/email';
import { ReferralType } from '@libs/prisma/@generated/prisma-nestjs-graphql/prisma/referral-type.enum';
import { User } from '@prisma/client';
import { NotificationService } from '@libs/subscription/notification.service';
import { ErrorCode } from '@libs/helper/error-code/error-code.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly FB_APP_TOKEN = process.env.FB_APP_TOKEN;

  // private readonly gClient = new OAuth2Client(this.GOOGLE_CLIENT_ID);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private http: HttpService,
    private eventEmitter: EventEmitter2,
    private mailService: EmailService,
    private notificationService: NotificationService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
      include: {
        profile: true,
        wallet: true,
        kyc_verification: true,
      },
    });
    if (!user) {
      this.logger.debug('login: user not found');
      throw new AppError('User not found', ErrorCode.USER_NOT_FOUND);
    }
    if (!user.password) {
      throw new AppError('This user doesnt have password', ErrorCode.USER_DONT_HAVE_PASSWORD);
    }
    const isValid = await PasswordUtils.comparePassword(pass, user.password);
    if (!isValid) {
      throw new AppError('Wrong Password', ErrorCode.WRONG_PASSWORD);
    }
    const jwtToken = this.jwt.sign({
      id: user.id,
      role: user.role,
    });
    this.eventEmitter.emit('user.loggedin', {});

    // delete password before send to client
    delete user.password;
    return {
      token: jwtToken,
      user,
    };
  }

  async register(input: RegisterInput) {
    // const isStrong = PasswordUtils.validate(pass);
    try {
      const hashPass = await PasswordUtils.hashPassword(input.password);
      const inviter = await this.getInviter(input.ref_code);
      const user = await this.prisma.user.create({
        data: {
          role: 'USER',
          email: input.email,
          ref_code: randString(6),
          invited_by: inviter?.id ?? null,
          password: hashPass,
          profile: {
            create: {},
          },
          wallet: {
            create: {},
          },
        },
      });

      if (inviter) {
        await this.addReferral(inviter, user.id);
      }

      // Send email verify
      const payload: VerifyInput = {
        token: this.jwt.sign(
          { email: input.email },
          {
            expiresIn: `${process.env.VERIFY_JWT_EXPIRE ?? '2h'}`,
          },
        ),
        userName: input.email.split('@')[0],
        email: input.email,
      };
      this.eventEmitter.emit(EventType.verifyEmail, payload);

      return true;
    } catch (err) {
      this.logger.warn(err);
      throw err;
      // throw new AppError('ACCOUNT EXIST', ErrorCode.ACCOUNT_EXISTED);
    }
  }

  async loginGoogle(token: string, refCode?: string) {
    try {
      const response = await firstValueFrom(
        this.http.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`),
      );
      // console.log('response: ', response);

      // const result = await this.gClient.verifyIdToken({
      //   idToken: token,
      //   audience: process.env.GOOGLE_CLIENT_ID,
      // });
      // payload = result.getPayload();
      const {
        sub,
        email,
        email_verified,
        // name,
        picture,
        given_name,
        family_name,
        // locale,
      } = response.data;
      if (!sub) {
        throw new AppError('Something went wrong', ErrorCode.ERROR_500);
      }
      if (!email || !email_verified) {
        throw new AppError('Email invalid!', ErrorCode.EMAIL_INVALID);
      }

      // Valid, is owner
      let userInfo = await this.prisma.user.findFirst({
        where: {
          OR: [
            {
              google_id: sub,
            },
            {
              email,
            },
          ],
        },
        include: {
          profile: true,
          wallet: true,
          kyc_verification: true,
        },
      });
      if (!userInfo) {
        const inviter = await this.getInviter(refCode);
        // create new if not exist user
        userInfo = await this.prisma.user.create({
          data: {
            google_id: sub,
            email,
            ref_code: randString(6),
            invited_by: inviter?.id,
            profile: {
              create: {
                avatar: picture,
                given_name,
                family_name,
                display_name:
                  family_name && given_name ? family_name + ' ' + given_name : !family_name ? given_name : family_name,
              },
            },
            wallet: {
              create: {},
            },
          },
          include: {
            profile: true,
            wallet: true,
            kyc_verification: true,
          },
        });
        if (inviter) {
          await this.addReferral(inviter, userInfo.id);
        }
      }
      const timestamp = Date.now();
      const jwtToken = this.jwt.sign({
        id: userInfo.id,
        timestamp,
      });
      this.eventEmitter.emit('user.loggedin', {});

      return {
        token: jwtToken,
        user: userInfo,
      };
    } catch (err) {
      this.logger.debug(err);
      throw new AppError('Bad request', ErrorCode.BAD_REQUEST);
    }
  }

  async loginFacebook(accessToken: string, refCode?: string) {
    // console.log('accessToken:', accessToken);
    // console.log('this.FB_APP_SECRET:', this.FB_APP_TOKEN);
    let response: any;
    try {
      response = await firstValueFrom(
        this.http.get(
          'https://graph.facebook.com/debug_token?input_token=' + accessToken + '&access_token=' + this.FB_APP_TOKEN,
        ),
      );
      response = response.data;
      // console.log("debug_fb: ", response.data)
    } catch (err) {
      this.logger.debug(err);
      throw new AppError('Bad request', ErrorCode.BAD_REQUEST);
    }
    const data: FbDebugResponse = response.data;
    if (data.error) {
      throw new AppError(data.error.message || 'Check token error', ErrorCode.ERROR_500);
    }
    if (!data.is_valid) {
      throw new AppError('Bad request', ErrorCode.BAD_REQUEST);
    }
    // get user info
    try {
      response = await firstValueFrom(
        this.http.get(
          'https://graph.facebook.com/me?fields=id,name,gender,cover,picture,email&access_token=' + accessToken,
        ),
      );
      response = response.data;
      // console.log("me_fb: ", response)
    } catch (err) {
      this.logger.debug(err);
      throw new AppError('Bad request', ErrorCode.BAD_REQUEST);
    }

    const facebook_id = response.id;
    const email = response.email;
    // let fullName = response.name || (email && email.substring(0, email.lastIndexOf('@')))
    const firstName = response.first_name ?? response.name;
    const lastName = response.last_name;
    // let gender = response.gender// === 'male'
    const avatar = response.picture && response.picture.data && response.picture.data.url;

    if (!facebook_id) {
      throw new AppError('Facebook Id Not found', ErrorCode.FB_ID_NOT_FOUND);
    }

    // Valid, is owner
    let userInfo = await this.prisma.user.findFirst({
      where: {
        facebook_id,
      },
      include: {
        profile: true,
        wallet: true,
        kyc_verification: true,
      },
    });

    if (!userInfo) {
      const inviter = await this.getInviter(refCode);
      // create new if not exist user
      userInfo = await this.prisma.user.create({
        data: {
          facebook_id,
          email,
          ref_code: randString(6),
          invited_by: inviter?.id,
          profile: {
            create: {
              avatar,
              given_name: firstName,
              family_name: lastName,
              display_name: firstName && lastName ? firstName + ' ' + lastName : !firstName ? lastName : firstName,
            },
          },
          wallet: {
            create: {},
          },
        },
        include: {
          profile: true,
          wallet: true,
          kyc_verification: true,
        },
      });

      if (inviter) {
        await this.addReferral(inviter, userInfo.id);
      }
    }

    const timestamp = Date.now();
    const jwtToken = this.jwt.sign({
      id: userInfo.id,
      timestamp,
    });

    this.eventEmitter.emit('user.loggedin', {});

    return {
      token: jwtToken,
      user: userInfo,
    };
  }

  async verifyEmail(token: string) {
    try {
      const payload: { email: string } = this.jwt.verify(token);
      if (!payload || !payload.email) {
        throw new AppError('Token invalid', ErrorCode.TOKEN_INVALID);
      }

      const user = await this.prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });
      if (!user) {
        throw new AppError('Token invalid', ErrorCode.TOKEN_INVALID);
      }
      await this.prisma.user.update({
        where: {
          email: payload.email,
        },
        data: {
          status: 'ACTIVE',
        },
      });
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        throw new AppError('Token invalid', ErrorCode.TOKEN_INVALID);
      }
      throw err;
    }
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        profile: true,
      },
    });
    if (!user) {
      throw new AppError('User not found', ErrorCode.USER_NOT_FOUND);
    }

    // Send email verify
    const payload: VerifyInput = {
      token: this.jwt.sign(
        {
          id: user.id,
        },
        {
          expiresIn: `${process.env.VERIFY_JWT_EXPIRE ?? '2h'}`,
        },
      ),
      userName: user.profile.user_name ?? email.split('@')[0],
      email: email,
    };
    this.eventEmitter.emit(EventType.forgot, payload);

    return true;
  }

  async resetPassword(token: string, newPass: string) {
    const data: { id: string } = this.jwt.verify(token);
    if (!data) {
      throw new AppError('Token invalid', ErrorCode.TOKEN_INVALID);
    }
    console.log('data: ', data);
    await this._resetPassword(newPass, data.id);
  }

  async _resetPassword(newPass: string, userId: string) {
    // check strong pass
    if (PasswordUtils.validate(newPass) !== true) {
      throw new AppError(
        'New password invalid, password must length from 8-32, contain letter and digit ',
        ErrorCode.INVALID_NEW_PASS,
      );
    }
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new AppError('Bad request', ErrorCode.BAD_REQUEST);
    }
    const newHashPass = await PasswordUtils.hashPassword(newPass);
    if (newHashPass === user.password) {
      throw new AppError('New password must not same old password', ErrorCode.NEW_PASS_SAME_OLD_PASS);
    }

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: newHashPass,
      },
    });
  }

  private async addReferral(inviter: User, userId: string) {
    try {
      await this.prisma.referralLog.create({
        data: {
          user_id: userId,
          invited_by: inviter.id,
          type: ReferralType.REGISTER,
          is_claim: false,
        },
      });
      await this.notificationService.createAndPushNoti(
        inviter.id,
        'Someone just used your referral code',
        `An user just used your referral code to join Lucis City`,
      );
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  private async getInviter(refCode: string) {
    if (refCode) {
      return await this.prisma.user.findFirst({
        where: { ref_code: refCode },
      });
    }
    return null;
  }

  async getJwtPayload(authorization: string) {
    try {
      const token = authorization?.split(' ')[1];
      return await this.jwt.verifyAsync(token);
    } catch (e) {
      return null;
    }
  }
}
