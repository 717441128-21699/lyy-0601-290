import { HeatmapData, DispatchSuggestion, DispatchTask, SuggestionStatus, DispatchTaskStatus, DispatchPriority } from '@shared/types';
import { mockHeatmapData, mockDispatchSuggestions, mockDispatchTasks, generateId, areas, operators } from '../data/mockData.js';
import { bikeService } from './bikeService.js';
import { notificationService } from './notificationService.js';
import { operationLogService } from './operationLogService.js';

let heatmapData: HeatmapData[] = [...mockHeatmapData];
let dispatchSuggestions: DispatchSuggestion[] = [...mockDispatchSuggestions];
let dispatchTasks: DispatchTask[] = [...mockDispatchTasks];

export const dispatchService = {
  getHeatmapData(): HeatmapData[] {
    return heatmapData.map(data => {
      const bikeCount = bikeService.getAllBikes(undefined, data.areaId).length;
      const demandLevel = bikeCount > 40 ? 'very-high' : bikeCount > 25 ? 'high' : bikeCount > 15 ? 'medium' : 'low';
      return {
        ...data,
        bikeCount,
        demandLevel,
        demandCount: Math.floor(bikeCount * 3.5 + Math.random() * 50),
      };
    });
  },

  getDispatchSuggestions(status?: SuggestionStatus, priority?: DispatchPriority): DispatchSuggestion[] {
    let suggestions = dispatchSuggestions;
    if (status) {
      suggestions = suggestions.filter(s => s.status === status);
    }
    if (priority) {
      suggestions = suggestions.filter(s => s.priority === priority);
    }
    return suggestions.sort((a, b) => {
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
    });
  },

  getDispatchSuggestionById(suggestionId: string): DispatchSuggestion | undefined {
    return dispatchSuggestions.find(s => s.id === suggestionId);
  },

  confirmSuggestion(suggestionId: string): { success: boolean; suggestion?: DispatchSuggestion; task?: DispatchTask } {
    const index = dispatchSuggestions.findIndex(s => s.id === suggestionId && s.status === 'pending');
    if (index === -1) return { success: false };

    dispatchSuggestions[index] = {
      ...dispatchSuggestions[index],
      status: 'confirmed',
    };

    const suggestion = dispatchSuggestions[index];
    const operatorList = operators.slice(0, Math.ceil(suggestion.bikeCount / 3));
    const task: DispatchTask = {
      id: generateId(),
      suggestionId: suggestion.id,
      fromAreaId: suggestion.fromAreaId,
      fromAreaName: suggestion.fromAreaName,
      toAreaId: suggestion.toAreaId,
      toAreaName: suggestion.toAreaName,
      bikeCount: suggestion.bikeCount,
      status: 'pending',
      assignedStaff: operatorList.map(o => o.id),
      assignedStaffNames: operatorList.map(o => o.name),
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    dispatchTasks.push(task);

    const dispatchContent = `新调度任务：从${task.fromAreaName}调${task.bikeCount}辆车到${task.toAreaName}，当前状态：待执行`;
    
    if (task.assignedStaff && task.assignedStaff.length > 0) {
      task.assignedStaff.forEach(operatorId => {
        notificationService.pushNotification(
          operatorId,
          'operator',
          'dispatch',
          '新调度任务已分配',
          dispatchContent,
          task.id,
          'dispatch'
        );
      });
    }

    notificationService.pushNotificationToRole(
      'dispatcher',
      'dispatch',
      '调度任务已创建',
      dispatchContent,
      task.id,
      'dispatch'
    );

    operationLogService.addLog(
      'dispatch-confirm',
      'system',
      '系统',
      'dispatcher',
      `确认调度建议：从${task.fromAreaName}调${task.bikeCount}辆车到${task.toAreaName}`,
      task.id,
      'dispatch',
      `${task.fromAreaName}→${task.toAreaName}`
    );

    return { success: true, suggestion, task };
  },

  rejectSuggestion(suggestionId: string, reason?: string): DispatchSuggestion | undefined {
    const index = dispatchSuggestions.findIndex(s => s.id === suggestionId && s.status === 'pending');
    if (index === -1) return undefined;

    dispatchSuggestions[index] = {
      ...dispatchSuggestions[index],
      status: 'rejected',
      reason: reason || dispatchSuggestions[index].reason,
    };

    return dispatchSuggestions[index];
  },

  createDispatchSuggestion(
    fromAreaId: string,
    toAreaId: string,
    bikeCount: number,
    reason: string,
    priority: DispatchPriority
  ): DispatchSuggestion {
    const fromArea = areas.find(a => a.id === fromAreaId);
    const toArea = areas.find(a => a.id === toAreaId);

    const suggestion: DispatchSuggestion = {
      id: generateId(),
      fromAreaId,
      fromAreaName: fromArea?.name ?? '',
      toAreaId,
      toAreaName: toArea?.name ?? '',
      bikeCount,
      reason,
      priority,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'pending',
    };

    dispatchSuggestions.push(suggestion);
    return suggestion;
  },

  getDispatchTasks(status?: DispatchTaskStatus): DispatchTask[] {
    let tasks = dispatchTasks;
    if (status) {
      tasks = tasks.filter(t => t.status === status);
    }
    return tasks.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  },

  getDispatchTasksByOperator(operatorId: string, status?: DispatchTaskStatus): DispatchTask[] {
    let tasks = dispatchTasks.filter(t => t.assignedStaff?.includes(operatorId));
    if (status) {
      tasks = tasks.filter(t => t.status === status);
    }
    return tasks.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  },

  getDispatchTaskById(taskId: string): DispatchTask | undefined {
    return dispatchTasks.find(t => t.id === taskId);
  },

  startDispatchTask(taskId: string): DispatchTask | undefined {
    const index = dispatchTasks.findIndex(t => t.id === taskId && t.status === 'pending');
    if (index === -1) return undefined;

    dispatchTasks[index] = {
      ...dispatchTasks[index],
      status: 'in-progress',
    };

    return dispatchTasks[index];
  },

  completeDispatchTask(taskId: string): DispatchTask | undefined {
    const index = dispatchTasks.findIndex(t => t.id === taskId && t.status === 'in-progress');
    if (index === -1) return undefined;

    const task = dispatchTasks[index];

    const bikes = bikeService.getAllBikes(undefined, task.fromAreaId).slice(0, task.bikeCount);
    const toArea = areas.find(a => a.id === task.toAreaId);

    bikes.forEach(bike => {
      if (toArea) {
        bikeService.updateBikeLocation(bike.id, toArea.lng + (Math.random() - 0.5) * 0.01, toArea.lat + (Math.random() - 0.5) * 0.01);
      }
    });

    dispatchTasks[index] = {
      ...task,
      status: 'completed',
      completeTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    const suggestionIndex = dispatchSuggestions.findIndex(s => s.id === task.suggestionId);
    if (suggestionIndex !== -1) {
      dispatchSuggestions[suggestionIndex] = {
        ...dispatchSuggestions[suggestionIndex],
        status: 'completed',
      };
    }

    return dispatchTasks[index];
  },

  createDispatchTask(
    fromAreaId: string,
    toAreaId: string,
    bikeCount: number,
    assignedStaff: string[],
    assignedStaffNames: string[]
  ): DispatchTask {
    const fromArea = areas.find(a => a.id === fromAreaId);
    const toArea = areas.find(a => a.id === toAreaId);

    const task: DispatchTask = {
      id: generateId(),
      fromAreaId,
      fromAreaName: fromArea?.name ?? '',
      toAreaId,
      toAreaName: toArea?.name ?? '',
      bikeCount,
      status: 'pending',
      assignedStaff,
      assignedStaffNames,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    dispatchTasks.push(task);
    return task;
  },

  refreshHeatmapData(): HeatmapData[] {
    heatmapData = areas.map(area => {
      const bikeCount = bikeService.getAllBikes(undefined, area.id).length;
      const demandLevel = bikeCount > 40 ? 'very-high' : bikeCount > 25 ? 'high' : bikeCount > 15 ? 'medium' : 'low';
      return {
        areaId: area.id,
        areaName: area.name,
        bikeCount,
        demandLevel,
        demandCount: Math.floor(bikeCount * 3.5 + Math.random() * 50),
        centerLng: area.lng,
        centerLat: area.lat,
      };
    });
    return heatmapData;
  },
};
