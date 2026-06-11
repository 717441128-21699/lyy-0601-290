import { Complaint, ComplaintType, ComplaintStatus } from '@shared/types';
import { mockComplaints, generateId } from '../data/mockData.js';
import { userService } from './userService.js';
import { notificationService } from './notificationService.js';

let complaints: Complaint[] = [...mockComplaints];

export const complaintService = {
  createComplaint(
    userId: string,
    userName: string,
    type: ComplaintType,
    title: string,
    description: string,
    images: string[],
    orderId?: string
  ): Complaint {
    const complaint: Complaint = {
      id: generateId(),
      userId,
      userName,
      orderId,
      type,
      title,
      description,
      images,
      status: 'pending',
      userConfirmed: false,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    complaints.push(complaint);
    return complaint;
  },

  getComplaintById(complaintId: string): Complaint | undefined {
    return complaints.find(c => c.id === complaintId);
  },

  getComplaintsByUser(userId: string, status?: ComplaintStatus): Complaint[] {
    let userComplaints = complaints.filter(c => c.userId === userId);
    if (status) {
      userComplaints = userComplaints.filter(c => c.status === status);
    }
    return userComplaints.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  },

  getAllComplaints(status?: ComplaintStatus, type?: ComplaintType): Complaint[] {
    let result = complaints;
    if (status) {
      result = result.filter(c => c.status === status);
    }
    if (type) {
      result = result.filter(c => c.type === type);
    }
    return result.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  },

  handleComplaint(complaintId: string, handlerId: string, handlerName: string): Complaint | undefined {
    const index = complaints.findIndex(c => c.id === complaintId && c.status === 'pending');
    if (index === -1) return undefined;

    complaints[index] = {
      ...complaints[index],
      status: 'processing',
      handlerId,
      handlerName,
      handleTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    return complaints[index];
  },

  resolveComplaint(complaintId: string, handleResult: string): Complaint | undefined {
    const index = complaints.findIndex(c => c.id === complaintId && c.status === 'processing');
    if (index === -1) return undefined;

    complaints[index] = {
      ...complaints[index],
      status: 'resolved',
      handleResult,
    };

    notificationService.pushNotification(
      complaints[index].userId,
      'user',
      'complaint',
      '投诉处理完成',
      '您的投诉已处理，请查看详情并确认',
      complaintId,
      'complaint'
    );

    return complaints[index];
  },

  userConfirmComplaint(complaintId: string): Complaint | undefined {
    const index = complaints.findIndex(c => c.id === complaintId && c.status === 'resolved');
    if (index === -1) return undefined;

    complaints[index] = {
      ...complaints[index],
      userConfirmed: true,
      status: 'closed',
      closeTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    return complaints[index];
  },

  closeComplaint(complaintId: string): Complaint | undefined {
    const index = complaints.findIndex(c => c.id === complaintId && (c.status === 'resolved'));
    if (index === -1) return undefined;

    complaints[index] = {
      ...complaints[index],
      status: 'closed',
      closeTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    return complaints[index];
  },

  getPendingCount(): number {
    return complaints.filter(c => c.status === 'pending').length;
  },

  getProcessingCount(): number {
    return complaints.filter(c => c.status === 'processing').length;
  },

  getResolvedCount(): number {
    return complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
  },

  updateComplaint(complaintId: string, updates: Partial<Complaint>): Complaint | undefined {
    const index = complaints.findIndex(c => c.id === complaintId);
    if (index === -1) return undefined;
    complaints[index] = { ...complaints[index], ...updates };
    return complaints[index];
  },
};
