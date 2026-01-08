
export interface ProblemReport {
  date: string;
  odl: string;
  description: string;
  problemType: string;
  operator: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
