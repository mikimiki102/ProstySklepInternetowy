import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/order.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  // checkout
  @Post('orders')
  create(@Body() dto: CreateOrderDto, @Req() req: any) {
    return this.orders.createOrder({
      userId: req.user.userId,
      items: dto.items.map((it) => ({
        productId: it.productId,
        title: it.title,
        price: it.price,
        quantity: it.quantity,
      })),
    });
  }

  // historia zamówień zalogowanego usera
  @Get('orders')
  list(@Req() req: any) {
    return this.orders.listMyOrders(req.user.userId);
  }

  // szczegóły jednego zamówienia
  @Get('orders/:id')
  getOne(@Param('id') id: string, @Req() req: any) {
    return this.orders.getMyOrder(req.user.userId, id);
  }
}
