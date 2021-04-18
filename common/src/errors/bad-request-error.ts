import { CustomError } from './custom-error'

export class BadRequestError extends CustomError{
  statusCode = 400

  constructor(public message: string) {
    super(message);

    // only because we are extending a built-in class
    Object.setPrototypeOf(this, BadRequestError.prototype)

  }

  serializeErrors(): { message: string; field?: string }[] {
    return [{message: this.message}]
  }
}