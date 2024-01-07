import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Public()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) { }

  @Post('login')
  @HttpCode(200)
  signin(@Body() body: LoginDto) {
    return this.authService.signIn(body);
  }

  @Post('signup')
  signUpDebtor(@Body() body: CreateUserDto) {
    return this.authService.signUp(body);
  }

  @Post('forgot')
  @HttpCode(200)
  forgot(@Body('email') email: string) {
    return this.authService.forgot(email);
  }


  @Get('verify')
  // @Redirect()
  async verify(@Query('token') token: string) {
    try {
      await this.authService.verify(token)
      // return { url: 'https://happy-delivery-business.vercel.app/auth/verify-account' };
      return {
        success: true,
        message: "Account Verified Successfully",
      }
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }

  @Public()
  @Post('reset')
  @HttpCode(200)
  async reset(@Body() body: any) {
    if (!body.newPassword || !body.confirmPassword || body.newPassword != body.confirmPassword) {
      throw new BadRequestException("password mismatch");
    }
    const [res, err] = await this.authService.reset(body.email, body.newPassword, body.token);
    if (res) return { success: true, message: "password changed successfuly" }
    else {
      return { success: false, error: err }
    }
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Body('token') token: string,
  ) {
    try {
      return { accessToken: await this.authService.refresh(token) }
    } catch (error) {
      console.log(error)
      throw new ForbiddenException(error.message);
    }
  }
}
