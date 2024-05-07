import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { HttpStatus, ICredential, ICustomer } from '../../types';
import { generateJwtToken } from './auth/jwt';
import { isValidCustomer } from './lib/validator';
import { insertCustomer, selectCustomer } from './persistence';
import { logger } from './lib/logger';

const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

export const login = async (credential: ICredential): Promise<APIGatewayProxyResultV2<never>> => {
  try {
    if (credential?.email?.length) {
      const customer = await selectCustomer(credential.email);

      if (!customer) return { statusCode: HttpStatus.UNAUTHORIZED, body: JSON.stringify({ message: 'Invalid login' }) };

      if (bcrypt.compareSync(credential.password, customer.password)) {
        return {
          statusCode: HttpStatus.OK,
          body: JSON.stringify({ accessToken: generateJwtToken(customer) }),
        };
      }
    }

    return { statusCode: HttpStatus.UNAUTHORIZED, body: JSON.stringify({ message: 'Invalid login' }) };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    logger(error.message);
  }

  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    body: '',
  };
};

export const register = async (customer: ICustomer): Promise<APIGatewayProxyResultV2<never>> => {
  try {
    customer.customer_id = uuid().replace(/-/g, '');

    const salt = bcrypt.genSaltSync(BCRYPT_SALT_ROUNDS);
    customer.password = bcrypt.hashSync(customer.password, salt);

    if (isValidCustomer(customer)) {
      await insertCustomer(customer);

      return {
        statusCode: HttpStatus.CREATED,
        body: '',
      };
    }

    return {
      statusCode: HttpStatus.BAD_REQUEST,
      body: JSON.stringify({ message: 'Invalid registration data' }),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const message = error.message as string;

    logger(message);

    if (message.includes(`Key (email)=`) && message.includes(`already exists.`)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify({ message: 'Email already exists' }),
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      body: '',
    };
  }
};
