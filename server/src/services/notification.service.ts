// server\src\services\notification.service.ts
import { prisma } from '../lib/prisma';

export enum NotificationType {
  NEW_POST = 'NEW_POST',
  NEW_COMMENT = 'NEW_COMMENT',
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  JOIN_REQUEST_APPROVED = 'JOIN_REQUEST_APPROVED',
  JOIN_REQUEST_REJECTED = 'JOIN_REQUEST_REJECTED',
  ASSIGNMENT_DUE = 'ASSIGNMENT_DUE',
  MENTION = 'MENTION',
  CLASSROOM_INVITE = 'CLASSROOM_INVITE',
  MEMBER_JOINED = 'MEMBER_JOINED',
  CONSULTATION_CONFIRMED = 'CONSULTATION_CONFIRMED',
  CONSULTATION_REJECTED = 'CONSULTATION_REJECTED',
  CONSULTATION_CANCELLED = 'CONSULTATION_CANCELLED',
  CONSULTATION_REMINDER = 'CONSULTATION_REMINDER',
  CONSULTATION_REQUEST = 'CONSULTATION_REQUEST'
}

interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  static async createNotification(data: NotificationData) {
    try {
      return await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          link: data.link,
          metadata: data.metadata || {}
        }
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  static async createBulkNotifications(notifications: NotificationData[]) {
    try {
      return await prisma.notification.createMany({
        data: notifications.map(n => ({
          userId: n.userId,
          title: n.title,
          message: n.message,
          type: n.type,
          link: n.link,
          metadata: n.metadata || {}
        }))
      });
    } catch (error) {
      console.error('Failed to create bulk notifications:', error);
      throw error;
    }
  }

  static async notifyClassroomMembers(params: {
    classroomId: string;
    excludeUserId?: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const members = await prisma.classroomMember.findMany({
        where: {
          classroomId: params.classroomId,
          ...(params.excludeUserId && { userId: { not: params.excludeUserId } })
        },
        select: { userId: true }
      });

      if (members.length === 0) return;

      const notifications = members.map(member => ({
        userId: member.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        link: params.link,
        metadata: { ...params.metadata, classroomId: params.classroomId }
      }));

      return await this.createBulkNotifications(notifications);
    } catch (error) {
      console.error('Failed to notify classroom members:', error);
      throw error;
    }
  }

  static async notifyNewPost(params: {
    classroomId: string;
    postId: string;
    authorId: string;
    postTitle: string;
    postType: string;
    classroomName: string;
  }) {
    const title = params.postType === 'ANNOUNCEMENT' 
      ? `📢 New Announcement in ${params.classroomName}`
      : params.postType === 'ASSIGNMENT'
      ? `📝 New Assignment in ${params.classroomName}`
      : `📄 New ${params.postType.toLowerCase()} in ${params.classroomName}`;

    const message = params.postTitle || 'Check out the new post';

    await this.notifyClassroomMembers({
      classroomId: params.classroomId,
      excludeUserId: params.authorId,
      title,
      message,
      type: NotificationType.NEW_POST,
      link: `/classrooms/${params.classroomId}`,
      metadata: {
        postId: params.postId,
        postType: params.postType,
        authorId: params.authorId
      }
    });
  }

  static async notifyNewComment(params: {
    postId: string;
    postAuthorId: string;
    commentAuthorId: string;
    commentAuthorName: string;
    classroomId: string;
  }) {
    if (params.postAuthorId === params.commentAuthorId) return;

    await this.createNotification({
      userId: params.postAuthorId,
      title: '💬 New comment on your post',
      message: `${params.commentAuthorName} commented on your post`,
      type: NotificationType.NEW_COMMENT,
      link: `/classrooms/${params.classroomId}`,
      metadata: {
        postId: params.postId,
        commentAuthorId: params.commentAuthorId
      }
    });
  }

  static async notifyRoleAssigned(params: {
    userId: string;
    role: string;
    classroomName: string;
    classroomId: string;
    assignedBy: string;
  }) {
    const roleEmoji = {
      TEACHER: '👨‍🏫',
      PRESIDENT: '👑',
      VICE_PRESIDENT: '🎖️',
      MODERATOR: '🛡️',
      TA: '📚',
      STUDENT: '👨‍🎓'
    }[params.role] || '✨';

    await this.createNotification({
      userId: params.userId,
      title: `${roleEmoji} Role Updated`,
      message: `You've been assigned as ${params.role.replace('_', ' ')} in ${params.classroomName}`,
      type: NotificationType.ROLE_ASSIGNED,
      link: `/classrooms/${params.classroomId}`,
      metadata: {
        role: params.role,
        assignedBy: params.assignedBy
      }
    });
  }

  static async notifyJoinRequestApproved(params: {
    userId: string;
    classroomName: string;
    classroomId: string;
    role: string;
  }) {
    await this.createNotification({
      userId: params.userId,
      title: '✅ Join Request Approved',
      message: `Your request to join ${params.classroomName} has been approved!`,
      type: NotificationType.JOIN_REQUEST_APPROVED,
      link: `/classrooms/${params.classroomId}`,
      metadata: {
        role: params.role
      }
    });
  }

  static async notifyJoinRequestRejected(params: {
    userId: string;
    classroomName: string;
    classroomId: string;
  }) {
    await this.createNotification({
      userId: params.userId,
      title: '❌ Join Request Declined',
      message: `Your request to join ${params.classroomName} was not approved`,
      type: NotificationType.JOIN_REQUEST_REJECTED,
      link: `/classrooms`,
      metadata: {}
    });
  }

  static async notifyMemberJoined(params: {
    classroomId: string;
    newMemberName: string;
    newMemberId: string;
    classroomName: string;
  }) {
    await this.notifyClassroomMembers({
      classroomId: params.classroomId,
      excludeUserId: params.newMemberId,
      title: '👋 New Member Joined',
      message: `${params.newMemberName} joined ${params.classroomName}`,
      type: NotificationType.MEMBER_JOINED,
      link: `/classrooms/${params.classroomId}`,
      metadata: {
        newMemberId: params.newMemberId
      }
    });
  }

  static async notifyConsultationConfirmed(params: {
    studentId: string;
    facultyName: string;
    topic: string;
    date: string;
    startTime: string;
    meetingLink?: string;
    location?: string;
  }) {
    const meetingInfo = params.meetingLink 
      ? `Meeting Link: ${params.meetingLink}`
      : params.location 
      ? `Location: ${params.location}`
      : '';

    await this.createNotification({
      userId: params.studentId,
      title: '✅ Consultation Confirmed',
      message: `Your consultation request with ${params.facultyName} for "${params.topic}" has been confirmed for ${params.date} at ${params.startTime}. ${meetingInfo}`,
      type: NotificationType.CONSULTATION_CONFIRMED,
      link: '/consultations',
      metadata: {
        facultyName: params.facultyName,
        topic: params.topic,
        date: params.date,
        startTime: params.startTime,
        meetingLink: params.meetingLink,
        location: params.location
      }
    });
  }

  static async notifyConsultationRejected(params: {
    studentId: string;
    facultyName: string;
    topic: string;
    reason?: string;
  }) {
    const reasonText = params.reason ? ` Reason: ${params.reason}` : '';

    await this.createNotification({
      userId: params.studentId,
      title: '❌ Consultation Rejected',
      message: `Your consultation request with ${params.facultyName} for "${params.topic}" has been rejected.${reasonText}`,
      type: NotificationType.CONSULTATION_REJECTED,
      link: '/consultations',
      metadata: {
        facultyName: params.facultyName,
        topic: params.topic,
        reason: params.reason
      }
    });
  }

  static async notifyConsultationCancelled(params: {
    facultyId: string;
    studentName: string;
    topic: string;
    date: string;
    startTime: string;
  }) {
    await this.createNotification({
      userId: params.facultyId,
      title: '📅 Consultation Cancelled',
      message: `${params.studentName} has cancelled their consultation for "${params.topic}" scheduled for ${params.date} at ${params.startTime}`,
      type: NotificationType.CONSULTATION_CANCELLED,
      link: '/consultations',
      metadata: {
        studentName: params.studentName,
        topic: params.topic,
        date: params.date,
        startTime: params.startTime
      }
    });
  }

  static async notifyNewConsultationRequest(params: {
    facultyId: string;
    studentName: string;
    topic: string;
    date: string;
    startTime: string;
  }) {
    await this.createNotification({
      userId: params.facultyId,
      title: '📩 New Consultation Request',           // Better title + icon
      message: `${params.studentName} has requested a consultation for "${params.topic}" on ${params.date} at ${params.startTime}`,
      type: NotificationType.CONSULTATION_REQUEST,    // ← Use the new type
      link: '/consultations',
      metadata: {
        studentName: params.studentName,
        topic: params.topic,
        date: params.date,
        startTime: params.startTime
      }
    });
  }
}