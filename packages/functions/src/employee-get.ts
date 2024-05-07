import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { HttpStatus } from '../../types';
import { getAuth } from '../../core/src/auth';
import { getEmployee } from '../../core/src/employee';

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

  const employeeId = (
    event.pathParameters ? event.pathParameters['employee_id']?.replace(/[^0-9a-z]/g, '') : ''
  ) as string;

  return await getEmployee(auth.customer_id, employeeId);
};
