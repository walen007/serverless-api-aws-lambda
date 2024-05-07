import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { HttpStatus } from '../../types';
import { getAuth } from '../../core/src/auth';
import { getReport } from '../../core/src/report';

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

  const reportId = (
    event.pathParameters ? event.pathParameters['report_id']?.replace(/[^0-9a-z-]/g, '') : ''
  ) as string;

  return await getReport(auth.customer_id, reportId, event.headers);
};
