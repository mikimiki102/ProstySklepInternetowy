import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@Controller()
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  // public: lista opinii do produktu
  @Get('products/:productId/reviews')
  list(@Param('productId') productId: string) {
    return this.reviews.listByProduct(Number(productId));
  }

  // zalogowany: dodaj opinię (1 per user per product)
  @UseGuards(JwtAuthGuard)
  @Post('products/:productId/reviews')
  create(
    @Param('productId') productId: string,
    @Body() dto: CreateReviewDto,
    @Req() req: any,
  ) {
    return this.reviews.createForProduct({
      productId: Number(productId),
      userId: req.user.userId,
      rating: dto.rating,
      message: dto.message,
    });
  }

  // zalogowany: edytuj (właściciel lub admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('reviews/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
    @Req() req: any,
  ) {
    return this.reviews.updateReview({
      reviewId: id,
      userId: req.user.userId,
      role: req.user.role,
      rating: dto.rating,
      message: dto.message,
    });
  }

  // zalogowany: usuń (właściciel lub admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('reviews/:id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.reviews.deleteReview({
      reviewId: id,
      userId: req.user.userId,
      role: req.user.role,
    });
  }
}
