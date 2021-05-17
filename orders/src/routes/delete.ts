import express, { Request, Response } from 'express'
import { NotAuthorizedError, NotFoundError, OrderStatus, requireAuth } from '@ars-tickets/common'
import { Order } from '../models/order'

const router = express.Router()

router.patch('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
  const { orderId } = req.params

  const order = await Order.findById(orderId)
  if (!order) {
    throw new NotFoundError()
  }

  if(order.userId !== req.currentUser!.id){
    throw new NotAuthorizedError()
  }

  order.status = OrderStatus.Cancelled
  order.save()

  res.status(200).send(order)
})

export { router as deleteOrderRouter }
