import path from 'path';
import converter from 'json-2-csv';
import { Queue } from 'sst/node/queue';
import { Bucket } from 'sst/node/bucket';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { findPhoneNumbersInText } from 'libphonenumber-js';
import { insertEmployeesTransaction, updateReport } from './persistence';
import { validateEmployee } from './lib/validator';
import { IEmployee, IReport } from '../../types';
import { deleteQueueMessage } from './queue';
import { logger } from './lib/logger';

const MAX_LIST_SIZE = Number(process.env.MAX_LIST_SIZE || 10000);

export const uploadEmployees = async (eventBody: IReport, report: IReport): Promise<void> => {
  if (report?.is_pending === false) {
    await deleteQueueMessage(Queue.Queue.queueUrl);
    return;
  }

  const client = new S3Client({});
  const extension = path.extname(eventBody.s3_file_name);

  const params = {
    Key: eventBody.s3_file_name,
    Bucket: Bucket.uploads.bucketName,
  };

  let employeeList: IEmployee[] = [];
  const fileObject = await client.send(new GetObjectCommand(params));

  try {
    if (fileObject.Body) {
      const bodyText = await fileObject.Body.transformToString();

      if (extension === '.csv') {
        employeeList = converter.csv2json(bodyText) as IEmployee[];

        if (!validateEmployee(employeeList[0])) {
          await updateReport(eventBody.report_id, 'Invalid file format');
          logger('Invalid file format');
          return;
        }
      }

      if (extension === '.json') {
        // Raises error if not a valid json file content
        employeeList = JSON.parse(bodyText) as IEmployee[];
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    logger('S3 File Parse Error: ', error.message);
    await updateReport(eventBody.report_id, `Error occurred while parsing uploaded file`);
    return;
  }

  if (employeeList.length > MAX_LIST_SIZE) {
    await updateReport(
      eventBody.report_id,
      `Upload size of ${employeeList.length} exmployees is more than the maximum ${MAX_LIST_SIZE} allowed for a single upload. You may divide your upload into batches.`
    );

    return;
  }

  // prettier-ignore
  const employeesWithCompanyId = employeeList
                                .map(employee => ({ ...employee, customer_id: eventBody.customer_id }))
                                .filter(employee => validateEmployee(employee));

  try {
    const result = await insertEmployeesTransaction(employeesWithCompanyId);

    // TODO: check log value later
    logger(result);

    await updateReport(
      eventBody.report_id,
      'Employee list upload completed successfully',
      employeesWithCompanyId.length,
      employeeList.length
    );

    logger('Employee processing completed!');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const message = error.message as string;

    let remark = 'ERROR: Employee list upload aborted due to error';

    if (message.includes('SQLStatement is longer than 65536')) {
      remark = `ERROR: Uploaded file size is too large, consider dividing your upload file into batches and re-upload`;
    }

    if (message.includes('duplicate key value violates unique constraint "customer_id_employe_id_index"')) {
      // eslint-disable-next-line no-useless-escape
      const regex = /Key \(customer_id, employee_id\)=\([^\)]*,\s*([^\)]*)\)/;
      const match = regex.exec(message);
      const id = match ? match[1] : null;

      remark = `ERROR: Duplicate employee_id (${id}) is forbidden. There may be multiple duplicate ids, we are aborting uploads on the first occurrence`;
    }

    if (message.includes('duplicate key value violates unique constraint "customer_id_telephone_index"')) {
      const tel = findPhoneNumbersInText(message)[0].number.number;
      remark = `ERROR: Duplicate telephone number (${tel}) is forbidden. There may be multiple duplicate telephone numbers, we are aborting upload on the first occurrence`;
    }

    await updateReport(eventBody.report_id, remark);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    logger('Employee Insert Exception: ', error.message);
  }
};
