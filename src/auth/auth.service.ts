import { BadRequestException, ConflictException, ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { Role } from './role.enum';
import { LoginDto } from './dto/login.dto';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { randomUUID } from 'crypto';
// import { InjectTwilio, TwilioClient } from 'nestjs-twilio';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) { }

  async signIn(loginDto: LoginDto) {

    const user = await this.userService.findOneByCriteria({ email: loginDto.email }, ['+password', '+refreshToken', '+expenses', '+ssn']);

    if (!user) {
      throw new ForbiddenException('Invalid Credentials');
    }

    if (user.banned) {
      throw new ForbiddenException('Account Banned');
    }

    if (!user.emailVerified) {
      const verificationToken = this.createVerificationToken({
        sub: user._id,
      });

      await this.emailService.sendAccountVerificationEmail(
        user.email,
        `${this.configService.get<string>('DOMAIN')}/auth/verify?token=${verificationToken}`
      );
      throw new ForbiddenException('Email Not Verified');
    }

    if (!user.phoneVerified) {
      throw new ForbiddenException('Phone Not Verified');
    }

    const isValid = await bcrypt.compare(loginDto.password, user.password);


    if (!isValid) {
      throw new ForbiddenException('Invalid Credentials');
    }

    return {
      ...user.toJSON(),
      accessToken: this.signUser(user._id, user.email, user.role)
    };
  }

  async signUp(signupDto: CreateUserDto) {

    const existingUser = await this.userService
      .findOneByCriteria({
        $or: [{ email: signupDto.email }, { ssn: signupDto.ssn }]
      }, ['+password', '+refreshToken']);

    if (existingUser) {
      throw new ConflictException("account already exists");
    }

    const refreshToken = this.createRefreshToken(signupDto.email);

    let tempPassword = "";

    if (!signupDto.password) {
      signupDto.password = randomUUID();
      tempPassword = signupDto.password;
    }

    signupDto.password = await bcrypt.hash(signupDto.password, 8);

    (signupDto as any).refreshToken = refreshToken;

    const user = await this.userService.create(signupDto);

    const verificationToken = this.createVerificationToken({
      sub: user._id,
    });

    this.emailService.sendAccountVerificationEmail(
      user.email,
      `${this.configService.get<string>('DOMAIN')}/auth/verify?token=${verificationToken}`,
      tempPassword
    );

    return true;
  }


  async forgot(email: string) {
    const user = await this.userService.findOneByCriteria({ email }, []);
    if (!user) { return; }
    const resetToken = this.createResetToken({ sub: user.id });
    return this.emailService.sendPasswordResetEmail(email, `https://jesus-today.com/auth/reset?token=${resetToken}`);
  }

  async verify(token: string) {

    const claims = await this.jwtService.verify(token, {
      secret: this.configService.get<string>('VERIFICATION_SECRET'),
    });

    if (!claims) {
      throw new ForbiddenException('Invalid Token');
    }

    await this.userService.update(claims.sub, {
      emailVerified: true,
    });

    return true;
  }

  signUser(userID: string, email: string, role: string) {
    return this.jwtService.sign({ sub: userID, email, role });
  }

  createVerificationToken(payload: { sub: string }) {
    return this.jwtService.sign(payload, {
      expiresIn: '1h',
      secret: this.configService.get<string>('VERIFICATION_SECRET'),
    });
  }

  createResetToken(payload: { sub: string }) {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('RESET_EXPIRES'),
      secret: this.configService.get<string>('RESET_SECRET'),
    });
  }

  createRefreshToken(userID: string) {
    return this.jwtService.sign({
      sub: userID,
    }, {
      expiresIn: this.configService.get<string>('REFRESH_EXPIRES'),
      secret: this.configService.get<string>('REFRESH_SECRET'),
    });
  }

  async reset(email: string, newPassword: string, token: string) {
    try {
      const salt = await bcrypt.genSalt(8);
      const claims = await this.jwtService.verify(token, {
        secret: this.configService.get<string>('RESET_SECRET'),
      });
      const updatedPassword = await bcrypt.hash(newPassword, +this.configService.get<number>('SALT_ROUNDS'));
      const [userUpdated, err] = await this.userService.findOneAndUpdateByCriteria({ _id: claims.sub }, { password: updatedPassword });
      if (err) { return [null, err.message]; }

      return [userUpdated, null];
    } catch (error) {
      throw error;
    }
  }

  async refresh(token: string) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("token", token);
        const claims = await this.jwtService.verify(token, {
          secret: this.configService.get<string>('REFRESH_SECRET'),
        });
        if (claims) {
          const user = await this.userService.findOneByCriteria({ email: claims.sub }, ['+email +role']);
          const accessToken = this.signUser(user._id, user.email, user.role);
          return resolve(accessToken);
        }
        return reject('Invalid token');
      } catch (error) {
        return reject(error);
      }
    });
  }
}




  // refresh(token: string) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const claims = await this.jwtService.verify(token, {
  //         secret: this.configService.get<string>('REFRESH_SECRET'),
  //       });
  //       if (claims) {
  //         const user = await this.userService.findOne(claims.sub);
  //         const accessToken = this.signUser(user._id, user.email, user.roles, user.verified, user.banned);
  //         return resolve(accessToken);
  //       }
  //       return reject('Invalid token');
  //     } catch (error) {
  //       return reject(error);
  //     }
  //   });
  // }





  // reset(password: string, resetToken: string) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const user = await this.userService.findOneByResetToken(resetToken);
  //       const claims = this.jwtService.verify(resetToken, {
  //         secret: this.configService.get<string>('RESET_SECRET')
  //       });
  //       if (!claims) { throw new ForbiddenException() }
  //       await user.updateOne({
  //         $set: {
  //           password: await bcrypt.hash(password, 8)
  //         }
  //       })
  //       return resolve(true);
  //     } catch (error) {
  //       return reject(error)
  //     }
  //   });
  // }
