import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { HttpStatus } from '../../types';
import { getAuth } from '../../core/src/auth';
import { getReports } from '../../core/src/report';

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

  return await getReports(auth.customer_id, event.headers);
};
