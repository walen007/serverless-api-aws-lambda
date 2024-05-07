import { RDS, StackContext } from 'sst/constructs';

export function DBStack({ app, stack }: StackContext): { postgres: RDS } {
  const isProduction = app.stage === 'prod';

  const postgres = new RDS(stack, 'Cluster', {
    engine: 'postgresql13.9',
    defaultDatabaseName: 'doinstruct',
    migrations: 'packages/core/src/persistence/migrations',
    scaling: {
      autoPause: !isProduction,
      // maxCapacity: isProduction ? 'ACU_4' : 'ACU_2',
      maxCapacity: 'ACU_2',
    },
  });

  return { postgres };
}
