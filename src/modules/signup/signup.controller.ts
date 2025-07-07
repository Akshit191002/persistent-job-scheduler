import { Controller, Post, Body } from '@nestjs/common';
import { SignupService } from './signup.service';

@Controller('api')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Post('signup')
  async signup(@Body('email') email: string) {
    await this.signupService.createUser(email);
    return { message: 'user created' };
  }
}
