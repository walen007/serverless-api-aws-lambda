import { Kysely, sql, InsertResult, DeleteResult, QueryResult } from 'kysely';
import { DataApiDialect } from 'kysely-data-api';
import { RDSData } from '@aws-sdk/client-rds-data';
import { RDS } from 'sst/node/rds';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { HttpStatus, ICustomer, IEmployee, IReport, IReportValues } from '../../../types';
import { up, down } from '../persistence/migrations/ddl';
import { logger } from '../lib/logger';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const insertCustomer = async (customer: ICustomer): Promise<{ [x: string]: any } | void> => {
  // prettier-ignore
  return await db.insertInto('customers')
          .values(customer)
          .returningAll()
          .executeTakeFirstOrThrow();
};

export const insertReport = async (values: IReportValues): Promise<IReport> => {
  return (await db.insertInto('reports').values(values).returningAll().executeTakeFirst()) as IReport;
};

export const selectReport = async (customerId: string, reportId: string, fields: string[]): Promise<IReport> => {
  return (await db
    .selectFrom('reports')
    .innerJoin('customers', 'customers.customer_id', 'reports.customer_id')
    .select(fields)
    .where('reports.customer_id', '=', customerId)
    .where('reports.report_id', '=', reportId)
    .executeTakeFirst()) as IReport;
};

export const selectReports = async (customerId: string, fields: string[]): Promise<IReport[]> => {
  return (await db
    .selectFrom('reports')
    .innerJoin('customers', 'customers.customer_id', 'reports.customer_id')
    .select(fields)
    .where('reports.customer_id', '=', customerId)
    .execute()) as IReport[];
};

export const selectCustomer = async (email: string): Promise<ICustomer> => {
  // prettier-ignore
  return (await db
    .selectFrom('customers')
    .selectAll()
    .where('email', '=', email)
    .executeTakeFirst()) as ICustomer;
};

export const selectEmployee = async (customerId: string, employeeId: string): Promise<IEmployee> => {
  return (await db
    .selectFrom('employees')
    .selectAll()
    .where('customer_id', '=', customerId)
    .where('employee_id', '=', employeeId)
    .executeTakeFirst()) as IEmployee;
};

export const updateEmployeeRecord = async (
  customerId: string,
  employeeId: string,
  validData: Partial<IEmployee>
): Promise<IEmployee> => {
  return (await db
    .updateTable('employees')
    .set({
      ...validData,
      updated_at: sql`CURRENT_TIMESTAMP`,
    })
    .where('customer_id', '=', customerId)
    .where('employee_id', '=', employeeId)
    .returningAll()
    .executeTakeFirst()) as IEmployee;
};

export const deleteEmployeeRecord = async (customerId: string, employeeId: string): Promise<DeleteResult> => {
  return await db
    .deleteFrom('employees')
    .where('customer_id', '=', customerId)
    .where('employee_id', '=', employeeId)
    .executeTakeFirst();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TEmpoyees = [Record<string, any>[], QueryResult<{ count: number }>];

export const getEmployeeRecordsPage = async (
  customerId: string,
  resultSize: number,
  offset: number
): Promise<TEmpoyees> => {
  return await Promise.all([
    db
      .selectFrom('employees')
      .selectAll()
      .where('customer_id', '=', customerId)
      .offset(offset)
      .limit(resultSize)
      .execute(),
    sql<{
      count: number;
    }>`SELECT COUNT(*) FROM employees WHERE customer_id=${customerId}`.execute(db),
  ]);
};

export const getReport = async (customerId: string, reportId: string): Promise<IReport | void> => {
  return (await db
    .selectFrom('reports')
    .selectAll()
    .where('customer_id', '=', customerId)
    .where('report_id', '=', reportId)
    .executeTakeFirst()) as IReport;
};

// Perform transactional bulk insert
export const insertEmployeesTransaction = async (employeesWithCompanyId: IEmployee[]): Promise<InsertResult[]> => {
  return await db.transaction().execute(async transaction => {
    return await transaction.insertInto('employees').values(employeesWithCompanyId).execute();
  });
};

export const updateReport = async (
  reportId: string,
  remark: string,
  validRecords?: number,
  totalRecords?: number
): Promise<IReport> => {
  return (await db
    .updateTable('reports')
    .set({
      valid_records: validRecords,
      total_records: totalRecords,
      is_processing: false,
      is_pending: false,
      remark,
      updated_at: sql`CURRENT_TIMESTAMP`,
    })
    .where('report_id', '=', reportId)
    .executeTakeFirst()) as unknown as IReport;
};

export const doMigrations = async (command: string): Promise<APIGatewayProxyResultV2<never>> => {
  if (command === 'up') {
    try {
      await up(db);

      return {
        statusCode: HttpStatus.CREATED,
        body: JSON.stringify({ message: `Database migrations completed successfully` }),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      logger('DB(up) Migrations Exception: ', error.message);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      if (error?.message?.includes('already exists; SQLState: 42P07')) {
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
      await up(db); // Re-initialize the db immediate (dev only)

      return {
        statusCode: HttpStatus.CREATED,
        body: JSON.stringify({ message: `Database re-initialized successfully` }),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      logger('DB(down) Migrations Exception: ', error.message);

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
