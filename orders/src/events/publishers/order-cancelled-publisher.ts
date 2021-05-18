import { OrderCancelledEvent, Publisher, Subjects } from '@ars-tickets/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
}
