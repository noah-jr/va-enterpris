import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse, ContactRequestDTO, NewsletterSubscriberDTO } from '@accountable/types';
import { submitContactSchema, subscribeNewsletterSchema, paginationSchema } from '@accountable/schemas';
import type {
  SubmitContactRequestUseCase,
  SubscribeNewsletterUseCase,
  ListContactRequestsUseCase,
} from '../../application/use-cases/contact/index.js';

export interface ContactControllerDependencies {
  submitContactRequestUseCase: SubmitContactRequestUseCase;
  subscribeNewsletterUseCase: SubscribeNewsletterUseCase;
  listContactRequestsUseCase: ListContactRequestsUseCase;
}

export class ContactController {
  constructor(private readonly deps: ContactControllerDependencies) {}

  async submit(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = submitContactSchema.parse(request.body);

    const contactRequest = await this.deps.submitContactRequestUseCase.execute(body, {
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    const response: ApiResponse<ContactRequestDTO> = {
      data: contactRequest,
      message: 'Pedido de contacto submetido com sucesso.',
    };
    reply.status(201).send(response);
  }

  async subscribe(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = subscribeNewsletterSchema.parse(request.body);

    const subscriber = await this.deps.subscribeNewsletterUseCase.execute(body);

    const response: ApiResponse<NewsletterSubscriberDTO> = {
      data: subscriber,
      message: 'Subscrição efetuada com sucesso.',
    };
    reply.status(200).send(response);
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = paginationSchema.parse(request.query);
    const result = await this.deps.listContactRequestsUseCase.execute(query);
    reply.status(200).send(result);
  }
}
