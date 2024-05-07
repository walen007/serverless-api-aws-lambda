import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2, Context, APIGatewayProxyResultV2 } from 'aws-lambda';
import { HttpStatus } from '../../types';
import { getAuth } from '../../core/src/auth';
import { uploadEmployees } from '../../core/src/employee';

export const handler: APIGatewayProxyHandlerV2 = async (
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2<never>> => {
  const auth = getAuth(event.headers);

  if (!auth) {
    return {
      statusCode: HttpStatus.UNAUTHORIZED,
      body: '',
    };
  }

  if (!event?.headers['content-type']?.startsWith('multipart/form-data')) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      body: 'Content type must be multipart/form-data',
    };
  }

  if (!auth.customer_id) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      body: 'customer_id and company_name are required fields',
    };
  }

  return await uploadEmployees(auth.customer_id, event, context);
};
