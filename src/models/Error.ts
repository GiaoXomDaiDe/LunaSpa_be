/* eslint-disable @typescript-eslint/no-explicit-any */
import HTTP_STATUS from '~/constants/httpStatus'
import { CONFIG_MESSAGES } from '~/constants/messages'

type ErrorsType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>

export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

//Lỗi dành cho việc lỗi form 422
export class EntityError extends ErrorWithStatus {
  errors: ErrorsType
  constructor({ message = CONFIG_MESSAGES.VALIDATION_ERROR, errors }: { message?: string; errors: ErrorsType }) {
    super({ message, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}
