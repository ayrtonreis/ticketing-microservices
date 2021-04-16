import { CustomError } from './custom-error'

export class NotAuthorizedError extends CustomError {
  statusCode = 401

  constructor() {
    super('Not authorized')

    // only because we are extending a built-in class
    Object.setPrototypeOf(this, NotAuthorizedError.prototype)
  }

  serializeErrors(): { message: string; field?: string }[] {
    return [{message: 'Not authorized'}]
  }
}