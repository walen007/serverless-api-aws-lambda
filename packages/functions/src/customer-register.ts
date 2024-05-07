import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ICustomer } from '../../types';
import { register } from '../../core/src/customer';

export const handler: APIGatewayProxyHandlerV2 = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2<never>> => {
  const customer = JSON.parse(event.body || '{}') as ICustomer;

  return await register(customer);
};
