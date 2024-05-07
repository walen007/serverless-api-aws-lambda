import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ICredential } from '../../types';
import { login } from '../../core/src/customer';

export const handler: APIGatewayProxyHandlerV2 = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2<never>> => {
  const credential = JSON.parse(event.body || '{}') as ICredential;

  return await login(credential);
};
