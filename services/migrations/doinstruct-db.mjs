export async function up(db) {
  await db.schema
    .createTable('employees')
    .addColumn('employeeId', 'serial', col => col.primaryKey())
    .addColumn('firstName', 'varchar', col => col.notNull())
    .addColumn('lastName', 'varchar', col => col.notNull())
    .addColumn('telephone', 'varchar(20)', col => col.notNull().unique())
    .addColumn('createdAt', 'date', col => col.defaultTo(new Date()))
    .addColumn('updatedAt', 'date')
    .execute();

  await db.schema
    .createTable('reports')
    .addColumn('reportId', 'serial', col => col.primaryKey())
    .addColumn('validRecords', 'integer')
    .addColumn('totalRecords', 'integer')
    .addColumn('isCompleted', 'boolean', col => col.defaultTo(false))
    .addColumn('createdAt', 'date', col => col.defaultTo(new Date()))
    .addColumn('updatedAt', 'date')
    .execute();
}

export async function down(db) {
  await db.schema.dropTable('employees').execute();
  await db.schema.dropTable('reports').execute();
}
