import { Kysely, sql } from 'kysely';
import { logger } from '../../lib/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  try {
    await db.schema
      .createTable('customers')
      .addColumn('customer_id', 'varchar(50)', col => col.primaryKey().notNull())
      .addColumn('customer_name', 'varchar', col => col.notNull())
      .addColumn('email', 'varchar', col => col.notNull().unique())
      .addColumn('password', 'varchar', col => col.notNull())
      .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .addColumn('updated_at', 'timestamp')
      .execute();

    await db.schema
      .createTable('employees')
      .addColumn('employee_id', 'varchar', col => col.notNull())
      .addColumn('customer_id', 'varchar', col => col.notNull().references('customers.customer_id').onDelete('cascade'))
      .addColumn('first_name', 'varchar', col => col.notNull())
      .addColumn('last_name', 'varchar', col => col.notNull())
      .addColumn('telephone', 'varchar(20)', col => col.notNull())
      .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .addColumn('updated_at', 'timestamp')
      .execute();

    await db.schema
      .createIndex('customer_id_employe_id_index')
      .on('employees')
      .columns(['customer_id', 'employee_id'])
      .unique()
      .execute();

    await db.schema
      .createIndex('customer_id_telephone_index')
      .on('employees')
      .columns(['customer_id', 'telephone'])
      .unique()
      .execute();

    await db.schema
      .createTable('reports')
      .addColumn('report_id', 'varchar(50)', col => col.primaryKey().notNull())
      .addColumn('customer_id', 'varchar', col => col.notNull().references('customers.customer_id').onDelete('cascade'))
      .addColumn('s3_file_name', 'varchar', col => col.notNull())
      .addColumn('valid_records', 'integer', col => col.defaultTo(0))
      .addColumn('total_records', 'integer', col => col.defaultTo(0))
      .addColumn('is_pending', 'boolean', col => col.defaultTo(true))
      .addColumn('is_processing', 'boolean', col => col.defaultTo(false))
      .addColumn('remark', 'text')
      .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .addColumn('updated_at', 'timestamp')
      .execute();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    logger('DB(up) Migrations Exception: ', error.message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('employees').execute();
  await db.schema.dropTable('reports').execute();
  await db.schema.dropTable('customers').execute();
}
