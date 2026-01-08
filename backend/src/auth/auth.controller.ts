import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from './auth.guard';
import { UsersService } from '../users/users.service';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.name, dto.password);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, user, refreshToken } = await this.auth.login(
      dto.email,
      dto.password,
    );

    const cookieName = process.env.REFRESH_COOKIE_NAME ?? 'rt';
    res.cookie(cookieName, refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/auth',
    });

    return { accessToken, user };
  }

  @Post('refresh')
  async refresh(@Req() req: Request) {
    const cookieName = process.env.REFRESH_COOKIE_NAME ?? 'rt';
    const token = (req as any).cookies?.[cookieName];
    return this.auth.refresh(token);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookieName = process.env.REFRESH_COOKIE_NAME ?? 'rt';
    const token = (req as any).cookies?.[cookieName];
    await this.auth.logout(token);

    res.clearCookie(cookieName, { path: '/auth' });
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const user = await this.users.findById(req.user.userId);
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin-only')
  adminOnly() {
    return { ok: true, message: 'Hello admin' };
  }
}
