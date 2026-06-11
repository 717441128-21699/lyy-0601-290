import { BatteryTask, FaultReport, MaintenanceRecord, BatteryTaskStatus, FaultStatus } from '@shared/types';
import { mockBatteryTasks, mockFaultReports, mockMaintenanceRecords, generateId, operators } from '../data/mockData.js';
import { bikeService } from './bikeService.js';
import { userService } from './userService.js';
import { notificationService } from './notificationService.js';
import { operationLogService } from './operationLogService.js';

let batteryTasks: BatteryTask[] = [...mockBatteryTasks];
let faultReports: FaultReport[] = [...mockFaultReports];
let maintenanceRecords: MaintenanceRecord[] = [...mockMaintenanceRecords];

export const operatorService = {
  getBatteryTasks(operatorId?: string, status?: BatteryTaskStatus): BatteryTask[] {
    let tasks = batteryTasks;
    if (operatorId) {
      tasks = tasks.filter(t => t.operatorId === operatorId);
    }
    if (status) {
      tasks = tasks.filter(t => t.status === status);
    }
    return tasks.sort((a, b) => {
      const statusOrder: Record<string, number> = { pending: 0, assigned: 1, 'in-progress': 2, completed: 3 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return a.currentBattery - b.currentBattery;
    });
  },

  getBatteryTaskById(taskId: string): BatteryTask | undefined {
    return batteryTasks.find(t => t.id === taskId);
  },

  acceptBatteryTask(taskId: string, operatorId: string): BatteryTask | undefined {
    const index = batteryTasks.findIndex(t => t.id === taskId && t.status === 'pending');
    if (index === -1) return undefined;

    const operator = operators.find(o => o.id === operatorId);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    batteryTasks[index] = {
      ...batteryTasks[index],
      status: 'assigned',
      operatorId,
      operatorName: operator?.name,
      assignedTime: now,
    };

    notificationService.pushNotification(
      operatorId,
      'operator',
      'battery-task',
      '换电任务已接受',
      `您已接受车辆 ${batteryTasks[index].bikeNo} 的换电任务`,
      taskId,
      'battery-task'
    );

    return batteryTasks[index];
  },

  startBatteryTask(taskId: string): BatteryTask | undefined {
    const index = batteryTasks.findIndex(t => t.id === taskId && t.status === 'assigned');
    if (index === -1) return undefined;

    batteryTasks[index] = {
      ...batteryTasks[index],
      status: 'in-progress',
      startTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    return batteryTasks[index];
  },

  completeBatteryTask(taskId: string, targetBattery: number): BatteryTask | undefined {
    const index = batteryTasks.findIndex(t => t.id === taskId && t.status === 'in-progress');
    if (index === -1) return undefined;

    const task = batteryTasks[index];
    bikeService.updateBattery(task.bikeId, targetBattery);
    bikeService.updateMaintenanceTime(task.bikeId);

    batteryTasks[index] = {
      ...task,
      status: 'completed',
      targetBattery,
      completeTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    if (task.operatorId) {
      notificationService.pushNotification(
        task.operatorId,
        'operator',
        'battery-task',
        '换电任务完成',
        `车辆 ${task.bikeNo} 换电完成，电量 ${targetBattery}%`,
        taskId,
        'battery-task'
      );

      const operator = operators.find(o => o.id === task.operatorId);
      operationLogService.addLog(
        'battery-complete',
        task.operatorId,
        operator?.name || task.operatorName || '运维人员',
        'operator',
        `完成车辆 ${task.bikeNo} 换电，电量从 ${task.currentBattery}% 到 ${targetBattery}%`,
        taskId,
        'battery-task',
        task.bikeNo
      );
    }

    return batteryTasks[index];
  },

  getFaultReports(status?: FaultStatus, reporterType?: string): FaultReport[] {
    let reports = faultReports;
    if (status) {
      reports = reports.filter(r => r.status === status);
    }
    if (reporterType) {
      reports = reports.filter(r => r.reporterType === reporterType);
    }
    return reports.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  },

  getFaultReportById(reportId: string): FaultReport | undefined {
    return faultReports.find(r => r.id === reportId);
  },

  createFaultReport(
    bikeId: string,
    reporterId: string,
    reporterName: string,
    reporterType: 'user' | 'operator' | 'system',
    faultType: string,
    description: string,
    images: string[]
  ): FaultReport {
    const bike = bikeService.getBikeById(bikeId);
    const report: FaultReport = {
      id: generateId(),
      bikeId,
      bikeNo: bike?.bikeNo ?? '',
      reporterId,
      reporterName,
      reporterType,
      faultType,
      description,
      images,
      status: 'pending',
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      areaName: bike?.areaName ?? '',
    };

    faultReports.push(report);
    bikeService.incrementFaultCount(bikeId);

    if (reporterType === 'user') {
      userService.calculateCreditScore(reporterId, 'report_fault');
    }

    return report;
  },

  handleFaultReport(reportId: string, handlerId: string, handlerName: string): FaultReport | undefined {
    const index = faultReports.findIndex(r => r.id === reportId && r.status === 'pending');
    if (index === -1) return undefined;

    faultReports[index] = {
      ...faultReports[index],
      status: 'processing',
      handlerId,
      handlerName,
      handleTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    const bike = bikeService.getBikeById(faultReports[index].bikeId);
    if (bike && bike.status !== 'in-use') {
      bikeService.updateBikeStatus(faultReports[index].bikeId, 'maintenance');
    }

    operationLogService.addLog(
      'complaint-process',
      handlerId,
      handlerName,
      'operator',
      `开始处理车辆 ${faultReports[index].bikeNo} 的故障`,
      reportId,
      'fault',
      faultReports[index].bikeNo
    );

    return faultReports[index];
  },

  resolveFaultReport(reportId: string, handleResult: string): FaultReport | undefined {
    const index = faultReports.findIndex(r => r.id === reportId && r.status === 'processing');
    if (index === -1) return undefined;

    faultReports[index] = {
      ...faultReports[index],
      status: 'resolved',
      handleResult,
    };

    const bike = bikeService.getBikeById(faultReports[index].bikeId);
    if (bike && bike.status === 'maintenance') {
      bikeService.updateBikeStatus(faultReports[index].bikeId, 'available');
    }

    return faultReports[index];
  },

  closeFaultReport(reportId: string): FaultReport | undefined {
    const index = faultReports.findIndex(r => r.id === reportId && r.status === 'resolved');
    if (index === -1) return undefined;

    faultReports[index] = {
      ...faultReports[index],
      status: 'closed',
    };

    return faultReports[index];
  },

  getMaintenanceRecords(bikeId?: string, operatorId?: string): MaintenanceRecord[] {
    let records = maintenanceRecords;
    if (bikeId) {
      records = records.filter(r => r.bikeId === bikeId);
    }
    if (operatorId) {
      records = records.filter(r => r.operatorId === operatorId);
    }
    return records.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  },

  createMaintenanceRecord(
    bikeId: string,
    operatorId: string,
    operatorName: string,
    maintenanceType: string,
    description: string,
    partsReplaced: string[],
    cost: number,
    faultReportId?: string
  ): MaintenanceRecord {
    const bike = bikeService.getBikeById(bikeId);
    const record: MaintenanceRecord = {
      id: generateId(),
      bikeId,
      bikeNo: bike?.bikeNo ?? '',
      faultReportId,
      operatorId,
      operatorName,
      maintenanceType,
      description,
      partsReplaced,
      cost,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    maintenanceRecords.push(record);
    bikeService.updateMaintenanceTime(bikeId);

    return record;
  },

  getMaintenanceRecordById(recordId: string): MaintenanceRecord | undefined {
    return maintenanceRecords.find(r => r.id === recordId);
  },
};
