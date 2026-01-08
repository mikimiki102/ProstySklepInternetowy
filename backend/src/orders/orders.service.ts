import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(params: {
    userId: string;
    items: {
      productId: number;
      title: string;
      price: number;
      quantity: number;
    }[];
  }) {
    if (!params.items || params.items.length === 0) {
      throw new ForbiddenException('Cart is empty');
    }

    const total = params.items.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0,
    );

    return this.prisma.order.create({
      data: {
        userId: params.userId,
        total,
        items: {
          create: params.items.map((it) => ({
            productId: it.productId,
            titleSnapshot: it.title,
            priceSnapshot: it.price,
            quantity: it.quantity,
          })),
        },
      },
      include: { items: true },
    });
  }

  listMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }

  async getMyOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Not allowed');

    return order;
  }
}
