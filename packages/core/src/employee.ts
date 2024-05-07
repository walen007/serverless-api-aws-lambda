import path from 'path';
import { Queue } from 'sst/node/queue';
import { Bucket } from 'sst/node/bucket';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multipart from 'lambda-multipart-parser';
import { APIGatewayProxyEvent, APIGatewayProxyResultV2, APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { HttpStatus, IEmployee, IReport } from '../../types';
import { filterProps } from './lib/filter-props';
import {
  insertReport,
  selectEmployee,
  updateEmployeeRecord,
  deleteEmployeeRecord,
  getEmployeeRecordsPage,
} from '../src/persistence';
import { logger } from './lib/logger';
import { saveQueueMessage } from './queue';

const QUERY_RESULT_SIZE = Number(process.env.QUERY_RESULT_SIZE) || 20;

export const getEmployee = async (customerId: string, employeeId: string): Promise<APIGatewayProxyResultV2<never>> => {
  if (employeeId && employeeId.length > 0) {
    const employee = await selectEmployee(customerId, employeeId);

    if (employee) {
      return {
        statusCode: HttpStatus.OK,
        body: JSON.stringify(employee),
      };
    }
  }

  return {
    statusCode: HttpStatus.NOT_FOUND,
    body: '',
  };
};

export const updateEmployee = async (
  customerId: string,
  employeeId: string,
  validData: Partial<IEmployee>
): Promise<APIGatewayProxyResultV2<never>> => {
  if (employeeId && employeeId.length > 0) {
    const employee = await updateEmployeeRecord(customerId, employeeId, validData);

    if (employee) {
      return {
        statusCode: HttpStatus.OK,
        body: JSON.stringify(employee),
      };
    }
  }

  return {
    statusCode: HttpStatus.NOT_FOUND,
    body: '',
  };
};

export const deleteEmployee = async (
  customerId: string,
  employeeId: string
): Promise<APIGatewayProxyResultV2<never>> => {
  if (employeeId && employeeId.length > 0) {
    const result = await deleteEmployeeRecord(customerId, employeeId);

    logger('result: ', result);

    return {
      statusCode: HttpStatus.NO_CONTENT,
      body: '',
    };
  }

  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    body: '',
  };
};

export const getEmployees = async (customerId: string, page: number): Promise<APIGatewayProxyResultV2<never>> => {
  const offset = page <= 1 ? 0 : QUERY_RESULT_SIZE * (page - 1);

  const [
    employees,
    {
      rows: [{ count }],
    },
  ] = await getEmployeeRecordsPage(customerId, QUERY_RESULT_SIZE, offset);

  let totalPages = 1;

  if (count > QUERY_RESULT_SIZE) {
    totalPages = Math.ceil(count / QUERY_RESULT_SIZE);
  }

  if (employees) {
    return {
      statusCode: HttpStatus.OK,
      body: JSON.stringify({
        page,
        total_pages: totalPages,
        total_employees: count,
        employees,
      }),
    };
  }

  return {
    statusCode: HttpStatus.NOT_FOUND,
    body: '',
  };
};

export const uploadEmployees = async (
  customerId: string,
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2<never>> => {
  try {
    const result = await multipart.parse(event as unknown as APIGatewayProxyEvent);
    const filename = `${context.awsRequestId}${path.extname(result.files[0].filename)}`;

    const values = {
      report_id: context.awsRequestId,
      customer_id: customerId,
      s3_file_name: filename,
    };

    const report = await insertReport(values);

    const client = new S3Client({});
    const command = new PutObjectCommand({
      Key: filename,
      Body: result.files[0].content,
      Bucket: Bucket.uploads.bucketName,
    });

    await client.send(command);

    logger('Upload Function: ', 'File uploaded successfully');

    await saveQueueMessage(
      Queue.Queue.queueUrl,
      JSON.stringify({
        ...report,
      })
    );

    return {
      statusCode: HttpStatus.OK,
      body: JSON.stringify({
        ...filterProps<IReport>(report, [
          's3_file_name',
          'is_processing',
          'valid_records',
          'total_records',
          'remark',
          'updated_at',
        ]),
        report_url: `${event.headers['x-forwarded-proto']}://${event.headers['host']}/report/${context.awsRequestId}`,
      }),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const message = (error.message as string) || '';

    if (message.includes('relation') && message.includes('does not exist')) {
      return {
        statusCode: HttpStatus.FAILED_DEPENDENCY,
        body: JSON.stringify({
          message: 'Please run the database migration to initialize the tables. Instructions available in README.md',
        }),
      };
    }

    logger('Upload Function Exception: ', message);

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({
        message: 'An error has occurred',
      }),
    };
  }
};
