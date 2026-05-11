import { ActivityType, PostType } from "@/utils/enum";
export type {
  IAgreement,
  IAgreementDetail,
  IAgreementsResponse,
  IAgreementContactInfo,
  IAgreementMeta,
} from "@/types/agreement.type";
export type {
  ISurvey,
  ISurveyDetail,
  ISurveyQuestion,
  ISurveyOption,
  ISurveyResponse,
  ISurveyAnswer,
  ISubmitSurveyResponseInput,
  ISubmitSurveyAnswerInput,
} from "@/types/survey.type";

export interface ISportActivity {
  id: number;
  title: string;
  date: string;
  description?: string;
  finishDate?: string;
  href?: string;
  media: IMedia;
  createdAt: string;
  updatedAt: string;
  activityDiscipline: ITournament[];
}

export interface Discipline {
  id: number;
  name: string;
  mainImage: IMedia;
  createdAt: string;
  updatedAt: string;
}

export interface ITournament {
  id: number;
  discipline: Discipline;
  media: IMedia[];
}

export interface SocialActivity {
  title: string;
  description: string;
  date: string;
  finishDate: string;
  price: number;
  stock: number;
  hasPrice: boolean;
  href: string;
  images: IMedia[];
}

export interface IAcademicActivity {
  id: number;
  title: string;
  date: string;
  finishDate: string;
  description?: string;
  hasPrice: boolean;
  status: string;
  price: number;
  stock: number;
  href?: string;
  media: IMedia[];
}

export interface IEvent {
  id: number;
  type: ActivityType;
  concurrence: "none" | "custom";
  days: number[];
  finishConcurrence?: Date | "Nunca" | null;
  sportActivity?: ISportActivity;
  socialActivity?: SocialActivity;
  academicActivity?: IAcademicActivity;
}

export interface Recurrence {
  type: "none" | "custom";
  days: number[];
  endsType: "never" | "on";
  endsOn?: Date;
}

export interface IEventSchedule {
  id: number;
  color: string;
  title: string;
  description?: string;
  isPaid: boolean;
  href?: string;
  date: string;
  startTime: string;
  endTime: string;
  recurrence: Recurrence;
}

// IAgreement is now re-exported from @/types/agreement.type

export interface ICommunication {
  id: string;
  title: string;
  description?: string;
  content?: string;
  href?: string;
  type: string;
  media: IMedia[];
}

// ISurvey is now re-exported from @/types/survey.type

export interface IOpinionResponse {
  id: string;
  place: string;
  topic: string;
  details: string;
  createdAt: string;
  comment?: string;
  worker?: string;
  workerName?: string;
}

export interface IReservation {
  id: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
  media: IMedia[];
  idProduct: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

export type Discount = {
  id: number;
  percentage: number;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
};

export interface IMedia {
  id: number;
  url: string;
  title: string;
  publicId: string;
  resourceType?: string | undefined;
  type?: string | null | undefined;
  bytes: number;
  width: number;
  height: number;
  format?: string | undefined;
  alt?: string | null | undefined;
  caption?: string | null | undefined;
  createdAt: string;
}

export interface IDaySchedule {
  day: string;
  startTime: string;
  endTime: string;
}

export type ActivityMedia = {
  activityId: number;
  mediaId: number;
  order: number;
  media: IMedia;
};

export interface IActivity {
  id: number;
  title: string;
  description?: string;
  type: ActivityType;
  date: string;
  finishDate?: string;
  stock: number;
  stockUsed: number;
  audience?: string;
  guestStock?: number;
  href?: string;
  price?: number;
  priceInvitee?: number;
  priceExternal?: number;
  hasPrice: boolean;
  venue?: string;
  address?: string;
  concurrence?: string;
  days?: IDaySchedule[];
  finishConcurrence?: string;
  status: string;
  discounts: Discount[];
  images: ActivityMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface IPost {
  id: number;
  title: string;
  slug?: string;
  description?: string;
  content?: unknown;
  contentHtml?: string;
  coverImage?: string;
  href?: string;
  author?: string;
  tags?: string[];
  type: PostType;
  isPinned: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Reservations (Espacios) ──────────────────────────────────────────────────

export interface ISpaceImage {
  order: number;
  media: {
    id: number;
    url: string;
    title?: string;
  };
}

export interface ISpaceReservation {
  id: number;
  title: string;
  description?: string;
  location?: string;
  address?: string;
  spaceType: string;
  pricePerHour?: number;
  price?: number;
  amenities?: string[];
  rules?: string;
  capacity: number;
  status: string;
  images: ISpaceImage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IReservationRequest {
  id: string;
  reservationId: number;
  eventName: string;
  purpose?: string;
  guestCount: number;
  startDate: string;
  endDate: string;
  status: string;
  adminComment?: string;
  estimatedPrice?: number;
  reviewedAt?: string;
  reservation?: Pick<
    ISpaceReservation,
    "id" | "title" | "spaceType" | "images"
  >;
  createdAt: string;
  updatedAt: string;
}

export interface IReservationRequestsResponse {
  requests: IReservationRequest[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
  };
}
