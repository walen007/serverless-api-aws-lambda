import { db } from '../../packages/core/src/persistence/connection';
import emailMissing from '../events/customer-register.event-missing-email.json';
import request from '../events/customer-register.event.json';
import { handler } from '../../packages/functions/src/customer-register';

vi.mock('../../packages/core/src/persistence/connection.ts');

describe('Customer Registaration: ', () => {
  it('--should register a customer successfully', async () => {
    // @ts-ignore
    const response = (await handler(request.event, request.context, vi.fn)) as APIGatewayProxyResultV2<{
      statusCode: number;
      body: string;
    }>;

    expect(response.statusCode).toBe(201);
  });

  it('--should throw missing email', async () => {
    // @ts-ignore
    const response = (await handler(emailMissing.event, emailMissing.context, vi.fn)) as APIGatewayProxyResultV2<{
      statusCode: number;
      body: string;
    }>;

    expect(response.statusCode).toBe(400);
  });

  it('--should handle duplicate email exception', async () => {
    vi.spyOn<any, any>(db, 'executeTakeFirstOrThrow').mockImplementation(() => {
      throw new Error('Key (email)= already exists.');
    });

    // @ts-ignore
    const response = (await handler(request.event, request.context, vi.fn)) as APIGatewayProxyResultV2<{
      statusCode: number;
      body: string;
    }>;

    expect(response.statusCode).toBe(400);
    expect(response.body).toContain('Email already exists');
  });
});
