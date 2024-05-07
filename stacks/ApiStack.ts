import { Api, StackContext, use } from 'sst/constructs';
import { QueueStack } from '../stacks';

export function ApiStack({ app, stack }: StackContext): void {
  const { postgres, bucket, queue } = use(QueueStack);
  const isProduction = app.stage === 'prod';

  const api = new Api(stack, 'Api', {
    defaults: {
      function: {
        timeout: 30,
        memorySize: 1024,
        bind: [postgres, bucket, queue],
        environment: {
          APP_STAGE: app.stage,
          MAX_LIST_SIZE: process.env.MAX_LIST_SIZE!,
          JWT_SECRET_KEY: process.env.JWT_SECRET_KEY!,
          JWT_TOKEN_EXPIRY: process.env.JWT_TOKEN_EXPIRY!,
          BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS!,
          QUERY_RESULT_SIZE: process.env.QUERY_RESULT_SIZE!,
        },
      },
    },
    routes: {
      'POST /customer/register': 'packages/functions/src/customer-register.handler',
      'POST /customer/login': 'packages/functions/src/customer-login.handler',
      'GET /report/{report_id}': 'packages/functions/src/report-get.handler',
      'GET /reports': 'packages/functions/src/reports-get.handler',
      'GET /employee/{employee_id}': 'packages/functions/src/employee-get.handler',
      'PUT /employee/{employee_id}': 'packages/functions/src/employee-update.handler',
      'DELETE /employee/{employee_id}': 'packages/functions/src/employee-delete.handler',
      'POST /employees/upload': 'packages/functions/src/employees-upload.handler',
      'GET /employees/{page}': 'packages/functions/src/employees-get.handler',
      // Command=(up|down) - conditional dev migrations route - production database migrations should be done in the sst console
      ...(!isProduction ? { 'PUT /db/migrations/{command}': 'packages/functions/src/migrations.handler' } : {}),
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    QueueUrl: queue.queueUrl,
    SecretArn: postgres.secretArn,
    clusterArn: postgres.clusterArn,
    ClusterIdentifier: postgres.clusterIdentifier,
  });
}
