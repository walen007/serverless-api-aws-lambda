import { APIGatewayProxyResultV2, APIGatewayProxyEventHeaders } from 'aws-lambda';
import { HttpStatus, IReport } from '../../types';
import { selectReport, selectReports } from './persistence';
import { filterProps } from './lib/filter-props';

const fields = [
  'report_id',
  'reports.customer_id',
  'customers.customer_name',
  'customers.email',
  'valid_records',
  'total_records',
  'is_pending',
  'remark',
  'reports.created_at',
  'reports.updated_at',
];
const props = ['valid_records', 'total_records', 'remark', 'updated_at'];

export const getReport = async (
  customerId: string,
  reportId: string,
  headers: APIGatewayProxyEventHeaders
): Promise<APIGatewayProxyResultV2<never>> => {
  if (reportId && reportId.length > 0) {
    const report = await selectReport(customerId, reportId, fields);

    if (!report) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        body: '',
      };
    }

    const parseReport = report['is_pending'] === false ? report : filterProps<IReport>(report, props);

    return {
      statusCode: HttpStatus.OK,
      body: JSON.stringify({
        ...parseReport,
        report_url: `${headers['x-forwarded-proto']}://${headers['host']}/report/${report.report_id}`,
      }),
    };
  }

  return {
    statusCode: HttpStatus.NOT_FOUND,
    body: '',
  };
};

export const getReports = async (
  customerId: string,
  headers: APIGatewayProxyEventHeaders
): Promise<APIGatewayProxyResultV2<never>> => {
  if (customerId) {
    const reports = await selectReports(customerId, fields);

    if (!reports.length) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        body: '',
      };
    }

    const parsedReports = reports.map(report => {
      const reportWithUrl = {
        ...report,
        report_url: `${headers['x-forwarded-proto']}://${headers['host']}/report/${report.report_id}`,
      };

      if (report['is_pending'] === false) return reportWithUrl;
      return filterProps<IReport>(reportWithUrl, props);
    });

    return {
      statusCode: HttpStatus.OK,
      body: JSON.stringify(parsedReports),
    };
  }

  return {
    statusCode: HttpStatus.NOT_FOUND,
    body: '',
  };
};
