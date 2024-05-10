/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, InsertResult, DeleteResult, QueryResult, Sql } from 'kysely';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { HttpStatus, ICustomer, IEmployee, IReport, IReportValues } from '../../../types';
import { up, down } from './migrations/ddl';
import { logger } from '../lib/logger';

type TEmpoyees = [Record<string, any>[], QueryResult<{ count: number }>];

export default class Persistence {
  constructor(
    private db: Kysely<any>,
    private sql: Sql
  ) {}

  async insertCustomer(customer: ICustomer): Promise<{ [x: string]: any } | void> {
    // prettier-ignore
    return await this.db.insertInto('customers')
            .values(customer)
            .returningAll()
            .executeTakeFirstOrThrow();
  }

  async insertReport(values: IReportValues): Promise<IReport> {
    return (await this.db.insertInto('reports').values(values).returningAll().executeTakeFirst()) as IReport;
  }

  async selectReport(customerId: string, reportId: string, fields: string[]): Promise<IReport> {
    return (await this.db
      .selectFrom('reports')
      .innerJoin('customers', 'customers.customer_id', 'reports.customer_id')
      .select(fields)
      .where('reports.customer_id', '=', customerId)
      .where('reports.report_id', '=', reportId)
      .executeTakeFirst()) as IReport;
  }

  async selectReports(customerId: string, fields: string[]): Promise<IReport[]> {
    return (await this.db
      .selectFrom('reports')
      .innerJoin('customers', 'customers.customer_id', 'reports.customer_id')
      .select(fields)
      .where('reports.customer_id', '=', customerId)
      .execute()) as IReport[];
  }

  async selectCustomer(email: string): Promise<ICustomer> {
    // prettier-ignore
    return (await this.db
    .selectFrom('customers')
    .selectAll()
    .where('email', '=', email)
    .executeTakeFirst()) as ICustomer;
  }

  async selectEmployee(customerId: string, employeeId: string): Promise<IEmployee> {
    return (await this.db
      .selectFrom('employees')
      .selectAll()
      .where('customer_id', '=', customerId)
      .where('employee_id', '=', employeeId)
      .executeTakeFirst()) as IEmployee;
  }

  async updateEmployeeRecord(
    customerId: string,
    employeeId: string,
    validData: Partial<IEmployee>
  ): Promise<IEmployee> {
    return (await this.db
      .updateTable('employees')
      .set({
        ...validData,
        updated_at: this.sql`CURRENT_TIMESTAMP`,
      })
      .where('customer_id', '=', customerId)
      .where('employee_id', '=', employeeId)
      .returningAll()
      .executeTakeFirst()) as IEmployee;
  }

  async deleteEmployeeRecord(customerId: string, employeeId: string): Promise<DeleteResult> {
    return await this.db
      .deleteFrom('employees')
      .where('customer_id', '=', customerId)
      .where('employee_id', '=', employeeId)
      .executeTakeFirst();
  }

  async getEmployeeRecordsPage(customerId: string, resultSize: number, offset: number): Promise<TEmpoyees> {
    return await Promise.all([
      this.db
        .selectFrom('employees')
        .selectAll()
        .where('customer_id', '=', customerId)
        .offset(offset)
        .limit(resultSize)
        .execute(),
      this.sql<{
        count: number;
      }>`SELECT COUNT(*) FROM employees WHERE customer_id=${customerId}`.execute(this.db),
    ]);
  }

  async getReport(customerId: string, reportId: string): Promise<IReport | void> {
    return (await this.db
      .selectFrom('reports')
      .selectAll()
      .where('customer_id', '=', customerId)
      .where('report_id', '=', reportId)
      .executeTakeFirst()) as IReport;
  }

  // Perform transactional bulk insert
  async insertEmployeesTransaction(employeesWithCompanyId: IEmployee[]): Promise<InsertResult[]> {
    return await this.db.transaction().execute(async transaction => {
      return await transaction.insertInto('employees').values(employeesWithCompanyId).execute();
    });
  }

  async updateReport(reportId: string, remark: string, validRecords?: number, totalRecords?: number): Promise<IReport> {
    return (await this.db
      .updateTable('reports')
      .set({
        valid_records: validRecords,
        total_records: totalRecords,
        is_processing: false,
        is_pending: false,
        remark,
        updated_at: this.sql`CURRENT_TIMESTAMP`,
      })
      .where('report_id', '=', reportId)
      .executeTakeFirst()) as unknown as IReport;
  }

  async doMigrations(command: string): Promise<APIGatewayProxyResultV2<never>> {
    if (command === 'up') {
      try {
        await up(this.db);

        return {
          statusCode: HttpStatus.CREATED,
          body: JSON.stringify({ message: `Database migrations completed successfully` }),
        };
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
        await down(this.db);
        await up(this.db); // Re-initialize the db immediate (dev only)

        return {
          statusCode: HttpStatus.CREATED,
          body: JSON.stringify({ message: `Database re-initialized successfully` }),
        };
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
  }
}
