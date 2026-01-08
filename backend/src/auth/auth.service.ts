import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

type JwtPayload = { sub: string; role: 'USER' | 'ADMIN' };

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private signAccessToken(payload: JwtPayload) {
    return this.jwt.sign(payload);
  }

  private signRefreshToken(payload: JwtPayload) {
    const secret = this.config.get<string>('JWT_REFRESH_SECRET')!;
    const expiresInSeconds = 7 * 24 * 60 * 60;
    return this.jwt.sign(payload, { secret, expiresIn: expiresInSeconds });
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const days = 7;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  async register(email: string, name: string, password: string) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new ForbiddenException('Email already in use');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.createUser({
      email,
      name,
      passwordHash,
      role: 'USER',
    });

    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayload = { sub: user.id, role: user.role };
    const accessToken = this.signAccessToken(payload);
    const refreshToken = this.signRefreshToken(payload);

    await this.storeRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      refreshToken,
    };
  }

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    try {
      const secret = this.config.get<string>('JWT_REFRESH_SECRET')!;
      const decoded = this.jwt.verify<JwtPayload>(refreshToken, { secret });

      const records = await this.prisma.refreshToken.findMany({
        where: {
          userId: decoded.sub,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      for (const r of records) {
        const ok = await bcrypt.compare(refreshToken, r.tokenHash);
        if (ok) {
          const accessToken = this.signAccessToken({
            sub: decoded.sub,
            role: decoded.role,
          });
          return { accessToken };
        }
      }

      throw new UnauthorizedException('Refresh token not recognized');
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;

    const all = await this.prisma.refreshToken.findMany({
      where: { revokedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    for (const r of all) {
      const ok = await bcrypt.compare(refreshToken, r.tokenHash);
      if (ok) {
        await this.prisma.refreshToken.update({
          where: { id: r.id },
          data: { revokedAt: new Date() },
        });
        return;
      }
    }
  }
}
