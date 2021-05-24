import { Subjects } from './subjects'

export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated
  data: {
    id: string
    version: number
    userId: string
    title: string
    price: number
  }
}
