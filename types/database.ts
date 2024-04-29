import { Generated } from 'kysely';

interface IDates {
  createdAt: string;
  updatedAt?: string;
}

interface IEmployeeTable extends IDates {
  employeeId: Generated<number>;
  firstName: string;
  lastName: string;
  telephone: string;
}

interface IUploadTable extends IDates {
  uploadId: Generated<number>;
  company: string;
  fileUri: string;
}

interface IReportTable extends IDates {
  reportId: Generated<number>;
  uploadId: number;
  validRecords: number;
  totalRecords: number;
}

export interface IDatabase {
  employees: IEmployeeTable;
  uploads: IUploadTable;
  reports: IReportTable;
}
