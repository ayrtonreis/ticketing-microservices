import { Publisher, Subjects, TicketCreatedEvent } from '@ars-tickets/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
  readonly subject = Subjects.TicketCreated
}