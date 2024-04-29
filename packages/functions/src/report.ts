import { Kysely } from 'kysely';
import { DataApiDialect } from 'kysely-data-api';
import { RDSData } from '@aws-sdk/client-rds-data';
import { RDS } from 'sst/node/rds';
import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda';
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
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2<never>> => {
  const token = 'a58ac3ab02d2368001c2496d88467af974c39434';
  const requestToken = event.headers['authorization']?.split(' ')[1];

  if (requestToken !== token) {
    return {
      statusCode: HttpStatus.UNAUTHORIZED,
      body: '',
    };
  }

  const reportId = event.pathParameters ? event.pathParameters['upload-id']?.replace(/[^0-9a-z-]/g, '') : '';

  if (reportId && reportId.length > 0) {
    const report = await db
      .selectFrom('reports')
      .select('report_id')
      .select('company')
      .select('email')
      .select('valid_records')
      .select('total_records')
      .select('is_pending')
      .select('created_at')
      .select('updated_at')
      .where('report_id', '=', reportId)
      .executeTakeFirst();

    if (!report) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        body: '',
      };
    }

    return {
      statusCode: HttpStatus.OK,
      body: JSON.stringify({ report }),
    };
  }

  return {
    statusCode: HttpStatus.NOT_FOUND,
    body: '',
  };
};
