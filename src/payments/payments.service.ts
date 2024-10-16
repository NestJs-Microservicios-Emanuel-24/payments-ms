import { Inject, Injectable, Logger } from '@nestjs/common';
import { envs, NATS_SERVICE } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { OrderActions } from 'src/common/enums/orders-actions.enum';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripe_secret);
  private readonly logger = new Logger('Payment Service');
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items, orderId } = paymentSessionDto;

    const lineItems = items.map((item) => {
      return {
        price_data: {
          currency: currency,
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), //32 dolares
        },
        quantity: item.quantity,
      };
    });

    const session = await this.stripe.checkout.sessions.create({
      //colocar el id de mi order
      payment_intent_data: {
        metadata: { orderId: orderId },
      },
      //aqui los productos
      line_items: lineItems,
      mode: 'payment',
      success_url: envs.srtipe_success_url,
      cancel_url: envs.srtipe_cancel_url,
    });
    //return session;
    return {
      cancelUrl: session.cancel_url,
      successUrl: session.success_url,
      url: session.url,
    };
  }
  async stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;
    const endpointSecret = envs.srtipe_en_point_secret_url;
    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        endpointSecret,
      );
    } catch (error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
      return;
    }

    switch (event.type) {
      case 'charge.succeeded':
        const chargeSucceeded = event.data.object;
        //aqui llamar al microservicio
        const payload = {
          stripePaymentId: chargeSucceeded.id,
          orderId: chargeSucceeded.metadata.orderId,
          receiptUrl: chargeSucceeded.receipt_url,
        };
        //this.logger.log({ payload });
        this.client.emit(OrderActions.PAYMENT_SUCCEEDED, payload);
        break;
      default:
        console.log(`Event ${event.type} not handled`);
    }
    return res.status(200).json({ sig });
  }
}
