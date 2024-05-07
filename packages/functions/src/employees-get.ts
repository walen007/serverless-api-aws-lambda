import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { HttpStatus } from '../../types';
import { getAuth } from '../../core/src/auth';
import { getEmployees } from '../../core/src/employee';

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

  let page = 1;

  if (event.pathParameters?.page) {
    page = Number(event.pathParameters['page'].replace(/[^0-9]/g, ''));
    page = page > 1 ? page : 1;
  }

  return await getEmployees(auth.customer_id, page);
};
