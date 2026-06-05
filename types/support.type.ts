export type SupportStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "REJECTED"
  | "REOPENED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface SupportCategory {
  id: number;
  name: string;
  description?: string | null;
  icon?: string | null;
  defaultPriority: Priority;
  slaDays: number;
  isActive?: boolean | null;
}

export interface SupportListItem {
  id: number;
  topic: string;
  place: string;
  status: SupportStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string | null;
  resolvedAt?: string | null;
  satisfactionRating?: number | null;
  category?: { id: number; name: string } | null;
}

export interface SupportMessageAuthor {
  name: string;
  paternalSurname?: string | null;
  role?: string | null;
}

export interface SupportMediaRef {
  id: number;
  url: string;
  title?: string | null;
  format?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface SupportAttachment {
  mediaId: number;
  order?: number | null;
  media: SupportMediaRef;
}

export interface SupportMessage {
  id: number;
  body: string;
  isInternal: boolean;
  createdAt: string;
  author: SupportMessageAuthor;
  attachments?: SupportAttachment[] | null;
}

export interface SupportUser {
  name: string;
  paternalSurname?: string | null;
}

export interface SupportDetail {
  id: number;
  topic: string;
  details: string;
  place: string;
  status: SupportStatus;
  priority: Priority;
  category?: { name: string } | null;
  assignedName?: string | null;
  resolvedAt?: string | null;
  rejectReason?: string | null;
  reopenReason?: string | null;
  satisfactionRating?: number | null;
  satisfactionComment?: string | null;
  user?: SupportUser | null;
  messages: SupportMessage[];
  createdAt: string;
}

export interface CreateSupportInput {
  topic: string;
  details: string;
  place: string;
  categoryId?: number;
  subjectDescription?: string;
  subjectUserId?: number;
}

export interface CreateSupportMessageInput {
  supportId: number;
  body: string;
}

export interface ReopenSupportInput {
  supportId: number;
  reopenReason: string;
}

export interface RateSupportInput {
  supportId: number;
  rating: number;
  comment?: string;
}
