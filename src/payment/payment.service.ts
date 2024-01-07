import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DebtService } from 'src/debt/debt.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import dollarToCents from 'src/utils/dollar-to-cents';
import Stripe from 'stripe';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';

@Injectable()
export class PaymentService {

  constructor(
    private readonly debtService: DebtService,
    private configService: ConfigService,
    @InjectStripeClient() private stripeClient: Stripe
  ) { }

  async createCheckoutSession(createPaymentDto: CreatePaymentDto, user: any) {
    const debt: any = await this.debtService.findByCriteria({
      _id: createPaymentDto.debtID
    })

    if (!debt) throw new NotFoundException({ success: false, msg: "no such debt found" })

    const currentPayments = debt.payments.filter(payment => payment.status == "pending" || payment.status == "overdue")

    if (!currentPayments) throw new NotFoundException({ success: false, msg: "this debt is all paid" })

    const purchaseAmount = dollarToCents(currentPayments[0].amount);

    const purchaseDebtID = currentPayments[0]._id;

    const session = await this.stripeClient.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "GOD Debt Payment",
            },
            unit_amount_decimal: purchaseAmount.toString()
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://jesus-today.com/dashboard/accounts/${createPaymentDto.debtID}?payment_success=true`,
      cancel_url: `https://jesus-today.com/dashboard/accounts/${createPaymentDto.debtID}?payment_success=false`,
      metadata: {
        "debtID": createPaymentDto.debtID,
        "optionID": purchaseDebtID.toString(),
        "email": debt.email
      }
    })


    return session.url;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}

function InjectStripe() {
  throw new Error('Function not implemented.');
}
