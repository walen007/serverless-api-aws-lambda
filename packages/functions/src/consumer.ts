import { SQSEvent, SQSRecord } from 'aws-lambda';
import { IReport } from '../../types';
import { getReport } from '../../core/src/persistence';
import { uploadEmployees } from '../../core/src/consumer';

export async function main(event: SQSEvent): Promise<void> {
  const records: SQSRecord[] = event.Records;
  const eventBody = JSON.parse(records[0].body) as IReport;

  const report = (await getReport(eventBody.customer_id, eventBody.report_id)) as IReport;
  if (report?.is_processing === true) return;

  await uploadEmployees(eventBody, report);
}
