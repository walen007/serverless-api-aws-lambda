import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { HttpStatus } from '../../types';
import { doMigrations } from '../../core/src/persistence';
import { getAuth } from '../../core/src/auth';

// Intended to run once for the initial DB migrations.
export const handler: APIGatewayProxyHandlerV2 = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2<never>> => {
  const auth = getAuth(event.headers);

  if (!auth) {
    return {
      statusCode: HttpStatus.UNAUTHORIZED,
      body: '',
    };
  }

  const command = event.pathParameters?.command as string;

  if (!['up', 'down'].includes(command)) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      body: JSON.stringify({ message: 'Invalid command, unable to setup the database' }),
    };
  }

  return doMigrations(command);
};
