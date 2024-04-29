import { Kysely } from 'kysely';
import { DataApiDialect } from 'kysely-data-api';
import { RDSData } from '@aws-sdk/client-rds-data';
import { RDS } from 'sst/node/rds';
import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { HttpStatus } from '../../../types';
import { up, down } from '../../../services/migrations/doinstruct-db';

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

// Intended to run once for the initial DB migrations.
export const handler: APIGatewayProxyHandlerV2 = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2<never>> => {
  const command = event.pathParameters?.command || '';

  // TODO: (INSECURE) load from env or from secure app config
  const token =
    'c5f210c80711308b154064a2efa43b563a41feef4bbb34ecb4b91a709d9c93ff8b092c62b9a22d2993e10ec7511266701197f919fd5e6d77dea4bdb058175c6fc4d39fa8ca1d28309bbdf9667c4328fc9a333b9c8947fd38c6';

  const requestToken = event.headers['authorization']?.split(' ')[1];

  if (requestToken !== token) {
    return {
      statusCode: HttpStatus.UNAUTHORIZED,
      body: '',
    };
  }

  if (!['up', 'down'].includes(command)) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      body: JSON.stringify({ message: 'Invalid command, unable to setup the database' }),
    };
  }

  if (command === 'up') {
    try {
      await up(db);

      return {
        statusCode: HttpStatus.CREATED,
        body: JSON.stringify({ message: `Database setup completed successfully` }),
      };
    } catch (error: any) {
      if (error.message.includes('already exists; SQLState: 42P07')) {
        return {
          statusCode: HttpStatus.CONFLICT,
          body: JSON.stringify({ message: `Database resource already exists` }),
        };
      }

      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        body: JSON.stringify({ message: `An error has occurred` }),
      };
    }
  }

  if (command === 'down') {
    try {
      await down(db);

      return {
        statusCode: HttpStatus.CREATED,
        body: JSON.stringify({ message: `Database tear down completed successfully` }),
      };
    } catch (error: any) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        body: JSON.stringify({ message: `An error has occurred` }),
      };
    }
  }

  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    body: JSON.stringify({ message: `Database operation not completed` }),
  };
};
