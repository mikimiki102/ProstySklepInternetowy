import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  listByProduct(productId: number) {
    return this.prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  async createForProduct(params: {
    productId: number;
    userId: string;
    rating: number;
    message: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: params.userId },
      select: { email: true },
    });
    if (!user) throw new NotFoundException('User not found');

    try {
      return await this.prisma.review.create({
        data: {
          productId: params.productId,
          userId: params.userId,
          email: user.email,
          rating: params.rating,
          message: params.message,
        },
      });
    } catch (e: any) {
      // UNIQUE(userId, productId) => 1 opinia per user per produkt
      if (e?.code === 'P2002') {
        throw new ForbiddenException('You already reviewed this product');
      }
      throw e;
    }
  }

  async updateReview(params: {
    reviewId: string;
    userId: string;
    role: 'USER' | 'ADMIN';
    rating: number;
    message: string;
  }) {
    const review = await this.prisma.review.findUnique({
      where: { id: params.reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');

    const isOwner = review.userId === params.userId;
    if (!isOwner && params.role !== 'ADMIN')
      throw new ForbiddenException('Not allowed');

    return this.prisma.review.update({
      where: { id: params.reviewId },
      data: { rating: params.rating, message: params.message },
    });
  }

  async deleteReview(params: {
    reviewId: string;
    userId: string;
    role: 'USER' | 'ADMIN';
  }) {
    const review = await this.prisma.review.findUnique({
      where: { id: params.reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');

    const isOwner = review.userId === params.userId;
    if (!isOwner && params.role !== 'ADMIN')
      throw new ForbiddenException('Not allowed');

    await this.prisma.review.delete({ where: { id: params.reviewId } });
    return { ok: true };
  }
}
