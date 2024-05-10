import { Kysely } from 'kysely';
import { DataApiDialect } from 'kysely-data-api';
import { RDSData } from '@aws-sdk/client-rds-data';
import { RDS } from 'sst/node/rds';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = new Kysely<any>({
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
