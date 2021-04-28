import { Subjects } from './subjects'

export interface TicketUpdatedEvent {
  subject: Subjects.TickeUpdated
  data: {
    id: string
    userId: string
    title: string
    price: number
  }
}