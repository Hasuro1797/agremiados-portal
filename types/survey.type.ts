import { QuestionType, SurveyStatus } from "@/utils/enum";

export interface ISurveyOption {
  id: number;
  questionId: number;
  text: string;
  order: number;
}

export interface ISurveyQuestion {
  id: number;
  surveyId: number;
  text: string;
  type: QuestionType;
  isRequired: boolean;
  order: number;
  scaleMin: number | null;
  scaleMax: number | null;
  scaleMinLabel: string | null;
  scaleMaxLabel: string | null;
  options: ISurveyOption[];
}

/** Campos devueltos por getActiveSurveys (listado) */
export interface ISurvey {
  id: number;
  title: string;
  description: string | null;
  status: SurveyStatus;
  isAnonymous: boolean;
  startDate: string | null;
  endDate: string | null;
  allowMultiple: boolean;
  _count: number;
  createdAt: string;
}

/** Campos devueltos por findOnePublicSurvey (detalle con preguntas) */
export interface ISurveyDetail extends Omit<ISurvey, "_count"> {
  questions: ISurveyQuestion[];
}

/** Input para un único answer dentro de submitSurveyResponse */
export interface ISubmitSurveyAnswerInput {
  questionId: number;
  optionId?: number; // SINGLE_CHOICE, MULTIPLE_CHOICE
  textValue?: string; // TEXT
  scaleValue?: number; // SCALE
}

/** Input principal para submitSurveyResponse */
export interface ISubmitSurveyResponseInput {
  surveyId: number;
  answers: ISubmitSurveyAnswerInput[];
}

export interface ISurveyAnswer {
  id: number;
  responseId: number;
  questionId: number;
  optionId: number | null;
  textValue: string | null;
  scaleValue: number | null;
}

/** Respuesta devuelta por submitSurveyResponse */
export interface ISurveyResponse {
  id: number;
  surveyId: number;
  userId: string | null;
  isPartial: boolean;
  completedAt: string;
  answers: ISurveyAnswer[];
}
