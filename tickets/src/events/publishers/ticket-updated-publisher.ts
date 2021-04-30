import { Publisher, Subjects, TicketUpdatedEvent } from '@ars-tickets/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
  readonly subject = Subjects.TicketUpdated
}