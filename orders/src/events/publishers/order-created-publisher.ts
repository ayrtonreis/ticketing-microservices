import { OrderCreatedEvent, Publisher, Subjects } from '@ars-tickets/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
}
