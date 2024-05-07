export interface IReport {
  report_id: string;
  customer_id: string;
  customer_name?: string;
  email?: string;
  s3_file_name: string;
  valid_records: number;
  total_records: number;
  is_pending: boolean;
  is_processing: boolean;
  remark: string;
  created_at: string;
  updated_at: string;
}

export interface IReportValues {
  report_id: string;
  customer_id: string;
  s3_file_name: string;
}
