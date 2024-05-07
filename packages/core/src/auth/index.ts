import { APIGatewayProxyEventHeaders } from 'aws-lambda';
import { IPayload } from '../../../types';
import { verifyJwtToken } from './jwt';

export const getAuth = (headers: APIGatewayProxyEventHeaders): IPayload | void => {
  const accessToken = headers['authorization']?.split(' ')[1] || '';
  return verifyJwtToken(accessToken);
};
