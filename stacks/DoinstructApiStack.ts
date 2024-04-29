import { Api, RDS, StackContext } from 'sst/constructs';

export function DoinstructApiStack({ stack }: StackContext): void {
  const cluster = new RDS(stack, 'Cluster', {
    engine: 'postgresql13.9',
    defaultDatabaseName: 'doinstruct',
    migrations: 'services/migrations',
  });

  const api = new Api(stack, 'Api', {
    defaults: {
      function: {
        timeout: 30,
        bind: [cluster],
      },
    },
    routes: {
      'GET /report/{upload-id}': 'packages/functions/src/report.handler',
      'POST /upload-employees': 'packages/functions/src/upload-employees.handler',
      // 'PUT /migrations/{command}': 'packages/functions/src/migrations.handler',
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    SecretArn: cluster.secretArn,
    ClusterIdentifier: cluster.clusterIdentifier,
  });
}
