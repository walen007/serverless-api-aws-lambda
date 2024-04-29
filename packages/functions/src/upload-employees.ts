import { Kysely } from 'kysely';
// import converted from 'json-2-csv';
import multipart from 'lambda-multipart-parser';
import { DataApiDialect } from 'kysely-data-api';
import { RDSData } from '@aws-sdk/client-rds-data';
import { RDS } from 'sst/node/rds';
import {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyEventV2,
  Context,
  APIGatewayProxyEvent,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import { HttpStatus } from '../../../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = new Kysely<any>({
  dialect: new DataApiDialect({
    mode: 'postgres',
    driver: {
      database: RDS.Cluster.defaultDatabaseName,
      secretArn: RDS.Cluster.secretArn,
      resourceArn: RDS.Cluster.clusterArn,
      client: new RDSData({}),
    },
  }),
});

export const handler: APIGatewayProxyHandlerV2 = async (
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2<never>> => {
  const token = 'a58ac3ab02d2368001c2496d88467af974c39434';
  const requestToken = event.headers['authorization']?.split(' ')[1];

  if (requestToken !== token) {
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

  const result = await multipart.parse(event as unknown as APIGatewayProxyEvent);
  const values = {
    report_id: context.awsRequestId,
    company: result.company,
    email: result.email,
    s3_uri: `https://s3.amazon.com/${context.awsRequestId}.json`,
    report_url: `${event.headers['x-forwarded-proto']}://${event.headers['host']}/report/${context.awsRequestId}`,
  };

  try {
    await db.insertInto('reports').values(values).execute();
    const report = await db
      .selectFrom('reports')
      .select('report_id')
      .select('company')
      .select('email')
      .select('report_url')
      .select('valid_records')
      .select('total_records')
      .select('is_pending')
      .select('created_at')
      .select('updated_at')
      .where('report_id', '=', values.report_id)
      .executeTakeFirst();

    return {
      statusCode: HttpStatus.OK,
      body: JSON.stringify({ report }),
    };
  } catch (error: any) {
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      return {
        statusCode: HttpStatus.FAILED_DEPENDENCY,
        body: JSON.stringify({
          message: 'Please run the database migration to initialize the tables. Instructions available in README.md',
        }),
      };
    }
  }

  return {
    statusCode: HttpStatus.NO_CONTENT,
    body: '',
  };
};
