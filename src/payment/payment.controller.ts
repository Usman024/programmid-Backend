import { Controller, Post, Body, Patch, Param, Delete, Req, RawBodyRequest, Redirect, Get } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { FastifyRequest } from 'fastify';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Debt, DebtDocument } from 'src/debt/entities/debt.entity';
import { AgendaService } from "@agent-ly/nestjs-agenda";
import { add, sub } from 'date-fns';
import { EmailService } from 'src/email/email.service';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';

@Public()
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly agendaService: AgendaService,
    private readonly emailService: EmailService,
    @InjectModel(Debt.name) private readonly debtModel: Model<DebtDocument>,
    @InjectStripeClient() private stripeClient: Stripe
  ) { }

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto, @Req() req: any) {
    return {
      url: await this.paymentService.createCheckoutSession(createPaymentDto, req.user)
    }
  }

  // @Get('nook')
  // async nook() {
  //   return "nook nook"
  // }

  @Post('hook')
  async webhooks(
    @Req() req: RawBodyRequest<FastifyRequest>,
  ) {
    console.log("webhook hit");

    const sig = req.headers['stripe-signature'];

    let event;


    try {
      event = this.stripeClient.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK!);
    } catch (err) {
      console.log(`❌ Error message: ${err.message}`);
    }

    // Successfully constructed event
    console.log('✅ Success:', event);


    switch (event.type) {
      case 'checkout.session.completed':
        const response = event.data.object;

        const metadata = event.data.object.metadata;

        const paidAmount = response.amount_total / 100;

        const debt: any = await this.debtModel.findByIdAndUpdate(metadata.debtID, {
          $set: {
            'payments.$[elem].status': "paid",
          },
          $inc: {
            'dueAmount': -paidAmount,
          }
        }, {
          arrayFilters: [{ 'elem._id': metadata.optionID }],
          new: true,
        });

        const currentPayments: any[] = debt.payments.filter(payment => payment.status == "pending" || payment.status == "overdue")

        if (currentPayments.length > 0) {
          const nextDate = new Date(currentPayments[0].date);

          this.emailService.sendReminderEmail(metadata.email, sub(nextDate, {
            days: 5
          }))

          this.emailService.sendReminderEmail(metadata.email, nextDate)

          this.emailService.sendReminderEmail(metadata.email, add(nextDate, {
            days: 1
          }))

        } else {
          await this.debtModel.findByIdAndUpdate(metadata.debtID, { status: "completed" });
        }

        // Then define and call a function to handle the event payment_intent.succeeded
        break;

      case 'checkout.session.async_payment_succeeded':

        const res = event.data.object;

        const md = event.data.object.metadata;

        const amount = res.amount_total / 100;

        const d: any = await this.debtModel.findByIdAndUpdate(md.debtID, {
          $set: {
            'payments.$[elem].status': "paid",
          },
          $inc: {
            'dueAmount': -amount,
          }
        }, {
          arrayFilters: [{ 'elem._id': md.optionID }],
          new: true,
        });

        const cPayments: any[] = d.payments.filter(payment => payment.status == "pending" || payment.status == "overdue")

        if (cPayments.length > 0) {
          const nextDate = new Date(cPayments[0].date);

          this.emailService.sendReminderEmail(md.email, sub(nextDate, {
            days: 5
          }))

          this.emailService.sendReminderEmail(md.email, nextDate)

          this.emailService.sendReminderEmail(md.email, add(nextDate, {
            days: 1
          }))

        } else {
          await this.debtModel.findByIdAndUpdate(metadata.debtID, { status: "completed" });
        }


        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return
  }

  // @Post('email')
  // email(@Body() body: any) {
  //   const today = new Date();
  //   const scheduleDate = add(today, {
  //     minutes: 5
  //   })

  //   this.emailService.sendReminderEmail("moeed9daska@gmail.com", sub(scheduleDate, {
  //     minutes: 1
  //   }))

  //   this.emailService.sendReminderEmail("moeed9daska@gmail.com", sub(scheduleDate, {
  //     minutes: 2
  //   }))

  //   this.emailService.sendReminderEmail("moeed9daska@gmail.com", sub(scheduleDate, {
  //     minutes: 3
  //   }))

  //   this.emailService.sendReminderEmail("moeed9daska@gmail.com", sub(scheduleDate, {
  //     minutes: 4
  //   }))

  //   this.emailService.sendReminderEmail("moeed9daska@gmail.com", sub(scheduleDate, {
  //     minutes: 5
  //   }))

  //   this.emailService.sendReminderEmail("moeed9daska@gmail.com", scheduleDate)

  //   this.emailService.sendReminderEmail("moeed9daska@gmail.com", add(scheduleDate, {
  //     minutes: 1
  //   }))

  //   this.emailService.sendReminderEmail("moeed9daska@gmail.com", add(scheduleDate, {
  //     minutes: 2
  //   }))

  //   this.emailService.sendReminderEmail("moeed9daska@gmail.com", add(scheduleDate, {
  //     minutes: 3
  //   }))

  //   this.emailService.sendReminderEmail("moeed9daska@gmail.com", add(scheduleDate, {
  //     minutes: 4
  //   }))

  //   this.emailService.sendReminderEmail("moeed9daska@gmail.com", add(scheduleDate, {
  //     minutes: 5
  //   }))
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }
}
function StripeWebhookHandler(arg0: string) {
  throw new Error('Function not implemented.');
}

