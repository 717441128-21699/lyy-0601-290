import { OperationLog, OperationLogType, UserRole } from '@shared/types';
import { generateId } from '../data/mockData.js';

let operationLogs: OperationLog[] = [];

export const operationLogService = {
  getLogs(
    operatorRole?: UserRole,
    logType?: OperationLogType,
    startTime?: string,
    endTime?: string,
    page: number = 1,
    pageSize: number = 20
  ): { list: OperationLog[]; total: number } {
    let logs = [...operationLogs];

    if (operatorRole) {
      logs = logs.filter(log => log.operatorRole === operatorRole);
    }

    if (logType) {
      logs = logs.filter(log => log.type === logType);
    }

    if (startTime) {
      logs = logs.filter(log => log.createTime >= startTime);
    }

    if (endTime) {
      logs = logs.filter(log => log.createTime <= endTime);
    }

    logs = logs.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
    
    const total = logs.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const list = logs.slice(start, end);

    return { list, total };
  },

  getLogById(logId: string): OperationLog | undefined {
    return operationLogs.find(log => log.id === logId);
  },

  addLog(
    type: OperationLogType,
    operatorId: string,
    operatorName: string,
    operatorRole: UserRole,
    description: string,
    relatedId?: string,
    relatedType?: string,
    relatedName?: string
  ): OperationLog {
    const log: OperationLog = {
      id: generateId(),
      type,
      operatorId,
      operatorName,
      operatorRole,
      description,
      relatedId,
      relatedType,
      relatedName,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    operationLogs.push(log);
    return log;
  },

  clearLogs(): number {
    const count = operationLogs.length;
    operationLogs = [];
    return count;
  },
};
