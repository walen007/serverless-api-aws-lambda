import jwt from 'jsonwebtoken';
import { ICustomer, IPayload } from '../../../types';
import { logger } from '../lib/logger';

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY!;
const JWT_TOKEN_EXPIRY = Number(process.env.JWT_TOKEN_EXPIRY) || 300;

export function generateJwtToken(customer: ICustomer): string {
  return jwt.sign({ customer_id: customer.customer_id, email: customer.email }, JWT_SECRET_KEY, {
    expiresIn: JWT_TOKEN_EXPIRY,
  });
}

export function verifyJwtToken(token: string): IPayload | void {
  try {
    return jwt.verify(token, JWT_SECRET_KEY) as IPayload;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    logger('JWT ERROR: ', error.message);
    return;
  }
}
