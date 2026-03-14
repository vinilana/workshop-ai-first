import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // get all products
  @Get('products')
  getProducts(@Query('active') active?: string) {
    try {
      if (active !== undefined) {
        if (active === 'true') {
          return this.appService.getProducts(true);
        } else if (active === 'false') {
          return this.appService.getProducts(false);
        } else {
          return this.appService.getProducts();
        }
      }
      return this.appService.getProducts();
    } catch (e) {
      // return error
      throw new HttpException('Erro ao buscar produtos', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // get product by id
  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    if (!id) {
      throw new HttpException('ID do produto é obrigatório', HttpStatus.BAD_REQUEST);
    }
    if (!id.startsWith('prod_')) {
      throw new HttpException('ID do produto inválido', HttpStatus.BAD_REQUEST);
    }

    const product = this.appService.getProductById(id);
    if (!product) {
      throw new HttpException('Produto não encontrado', HttpStatus.NOT_FOUND);
    }
    return product;
  }

  // create checkout session
  @Post('checkout/sessions')
  createCheckoutSession(@Body() body: any) {
    // validate body
    if (!body) {
      throw new HttpException('Body é obrigatório', HttpStatus.BAD_REQUEST);
    }

    if (!body.line_items || !Array.isArray(body.line_items)) {
      throw new HttpException('line_items é obrigatório e deve ser um array', HttpStatus.BAD_REQUEST);
    }

    if (body.line_items.length === 0) {
      throw new HttpException('line_items não pode ser vazio', HttpStatus.BAD_REQUEST);
    }

    // validate each line item
    for (let i = 0; i < body.line_items.length; i++) {
      const item = body.line_items[i];
      if (!item.price_id) {
        throw new HttpException(
          `line_items[${i}].price_id é obrigatório`,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!item.quantity || item.quantity < 1) {
        throw new HttpException(
          `line_items[${i}].quantity deve ser maior que 0`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (!body.success_url) {
      throw new HttpException('success_url é obrigatório', HttpStatus.BAD_REQUEST);
    }
    if (!body.cancel_url) {
      throw new HttpException('cancel_url é obrigatório', HttpStatus.BAD_REQUEST);
    }

    try {
      const session = this.appService.createCheckoutSession(
        body.line_items,
        body.success_url,
        body.cancel_url,
        body.customer_id || null,
        body.metadata || {},
      );
      return session;
    } catch (e: any) {
      if (e.message && e.message.includes('não encontrado')) {
        throw new HttpException(e.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Erro ao criar sessão de checkout',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // get checkout session
  @Get('checkout/sessions/:id')
  getCheckoutSession(@Param('id') id: string) {
    if (!id) {
      throw new HttpException('ID da sessão é obrigatório', HttpStatus.BAD_REQUEST);
    }

    const session = this.appService.getCheckoutSession(id);
    if (!session) {
      throw new HttpException('Sessão não encontrada', HttpStatus.NOT_FOUND);
    }

    return session;
  }

  // process payment
  @Post('payments')
  processPayment(@Body() body: any) {
    if (!body) {
      throw new HttpException('Body é obrigatório', HttpStatus.BAD_REQUEST);
    }

    // inline validation - should be in a DTO or pipe
    if (!body.checkout_session_id) {
      throw new HttpException(
        'checkout_session_id é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!body.payment_method) {
      throw new HttpException('payment_method é obrigatório', HttpStatus.BAD_REQUEST);
    }

    // validate payment method type
    const validTypes = ['credit_card', 'debit_card', 'pix', 'boleto'];
    if (!validTypes.includes(body.payment_method.type)) {
      throw new HttpException(
        `Tipo de pagamento inválido. Use: ${validTypes.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // validate card details if credit or debit
    if (
      body.payment_method.type === 'credit_card' ||
      body.payment_method.type === 'debit_card'
    ) {
      if (!body.payment_method.card) {
        throw new HttpException(
          'Dados do cartão são obrigatórios para pagamento com cartão',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!body.payment_method.card.number) {
        throw new HttpException('Número do cartão é obrigatório', HttpStatus.BAD_REQUEST);
      }
      if (!body.payment_method.card.exp_month) {
        throw new HttpException(
          'Mês de expiração é obrigatório',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!body.payment_method.card.exp_year) {
        throw new HttpException(
          'Ano de expiração é obrigatório',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!body.payment_method.card.cvc) {
        throw new HttpException('CVC é obrigatório', HttpStatus.BAD_REQUEST);
      }
    }

    try {
      const result = this.appService.processPayment(
        body.checkout_session_id,
        body.payment_method,
      );
      return result;
    } catch (e: any) {
      if (e.message && e.message.includes('não encontrad')) {
        throw new HttpException(e.message, HttpStatus.NOT_FOUND);
      }
      if (e.message && e.message.includes('já foi')) {
        throw new HttpException(e.message, HttpStatus.CONFLICT);
      }
      throw new HttpException(
        e.message || 'Erro ao processar pagamento',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // get payment by id
  @Get('payments/:id')
  getPayment(@Param('id') id: string) {
    if (!id) {
      throw new HttpException('ID do pagamento é obrigatório', HttpStatus.BAD_REQUEST);
    }

    const payment = this.appService.getPaymentById(id);

    if (!payment) {
      throw new HttpException('Pagamento não encontrado', HttpStatus.NOT_FOUND);
    }

    return payment;
  }

  // create customer
  @Post('customers')
  createCustomer(@Body() body: any) {
    if (!body) {
      throw new HttpException('Body é obrigatório', HttpStatus.BAD_REQUEST);
    }

    if (!body.email) {
      throw new HttpException('Email é obrigatório', HttpStatus.BAD_REQUEST);
    }

    // very basic email validation
    if (!body.email.includes('@')) {
      throw new HttpException('Email inválido', HttpStatus.BAD_REQUEST);
    }

    if (!body.name) {
      throw new HttpException('Nome é obrigatório', HttpStatus.BAD_REQUEST);
    }

    try {
      const customer = this.appService.createCustomer(
        body.email,
        body.name,
        body.metadata || {},
      );
      return customer;
    } catch (e: any) {
      if (e.message && e.message.includes('já existe')) {
        throw new HttpException(e.message, HttpStatus.CONFLICT);
      }
      throw new HttpException(
        'Erro ao criar cliente',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // get customer
  @Get('customers/:id')
  getCustomer(@Param('id') id: string) {
    if (!id) {
      throw new HttpException('ID do cliente é obrigatório', HttpStatus.BAD_REQUEST);
    }

    const customer = this.appService.getCustomerById(id);

    if (!customer) {
      throw new HttpException('Cliente não encontrado', HttpStatus.NOT_FOUND);
    }

    return customer;
  }
}
