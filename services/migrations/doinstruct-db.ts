import { Kysely } from 'kysely';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  try {
    await db.schema
      .createTable('reports')
      .addColumn('report_id', 'varchar(50)', col => col.primaryKey().notNull())
      .addColumn('company', 'varchar')
      .addColumn('email', 'varchar')
      .addColumn('s3_uri', 'varchar', col => col.notNull())
      .addColumn('report_url', 'varchar', col => col.notNull())
      .addColumn('valid_records', 'integer', col => col.defaultTo(0))
      .addColumn('total_records', 'integer', col => col.defaultTo(0))
      .addColumn('is_pending', 'boolean', col => col.defaultTo(true))
      .addColumn('created_at', 'date', col => col.defaultTo(new Date()))
      .addColumn('updated_at', 'date')
      .execute();

    await db.schema
      .createTable('employees')
      .addColumn('employee_id', 'varchar', col => col.notNull().primaryKey())
      .addColumn('first_name', 'varchar', col => col.notNull())
      .addColumn('last_name', 'varchar', col => col.notNull())
      .addColumn('telephone', 'varchar(20)', col => col.notNull().unique())
      .addColumn('created_at', 'date', col => col.defaultTo(new Date()))
      .addColumn('updated_at', 'date')
      .execute();
  } catch (error) {}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('reports').execute();
  await db.schema.dropTable('employees').execute();
}
