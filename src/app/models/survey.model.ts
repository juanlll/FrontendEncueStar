import { BaseEntity } from './base.model';
import { Question } from './question.model';
import { User } from './user.model';

export interface Survey extends BaseEntity {
  title: string;
  description: string;
  uuid: string;
  creatorId: string;
  creator?: User;
  
  // Survey configuration
  isPublic: boolean;
  isActive: boolean;
  allowAnonymous: boolean;
  maxResponses?: number;
  expiresAt?: Date;
  
  // Design settings
  theme: SurveyTheme;
  logo?: string;
  welcomeMessage?: string;
  thankYouMessage?: string;
  
  // Questions and structure
  questions: Question[];
  totalQuestions: number;
  
  // Statistics
  responseCount: number;
  completionRate: number;
  averageTime?: number; // in seconds
  
  // Metadata
  tags: string[];
  category?: string;
  language: string;
}

export interface SurveyTheme {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  fontSize: number;
  customCSS?: string;
}

export enum SurveyStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

// DTOs for Survey operations
export interface CreateSurveyDto {
  title: string;
  description: string;
  isPublic: boolean;
  allowAnonymous: boolean;
  maxResponses?: number;
  expiresAt?: Date;
  theme?: Partial<SurveyTheme>;
  welcomeMessage?: string;
  thankYouMessage?: string;
  tags?: string[];
  category?: string;
  language?: string;
}

export interface UpdateSurveyDto extends Partial<CreateSurveyDto> {
  id: string;
}

export interface SurveyFilters {
  creatorId?: string;
  isPublic?: boolean;
  isActive?: boolean;
  category?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

// Survey Response Models
export interface SurveyResponse extends BaseEntity {
  surveyId: string;
  survey?: Survey;
  respondentId?: string;
  respondent?: User;
  
  answers: SurveyAnswer[];
  isCompleted: boolean;
  completedAt?: Date;
  timeSpent: number; // in seconds
  ipAddress?: string;
  userAgent?: string;
  
  // Metadata
  referrer?: string;
  sessionId: string;
}

export interface SurveyAnswer {
  questionId: string;
  question?: Question;
  value: any;
  answeredAt: Date;
}

export interface CreateSurveyResponseDto {
  surveyId: string;
  answers: {
    questionId: string;
    value: any;
  }[];
  timeSpent: number;
}

// Analytics Models
export interface SurveyAnalytics {
  surveyId: string;
  totalResponses: number;
  completedResponses: number;
  completionRate: number;
  averageTimeSpent: number;
  uniqueRespondents: number;
  
  // Question-level analytics
  questionAnalytics: QuestionAnalytics[];
  
  // Time-based analytics
  responsesByDate: ResponseByDate[];
  
  // Geographic analytics
  responsesByCountry?: ResponseByCountry[];
}

export interface QuestionAnalytics {
  questionId: string;
  questionTitle: string;
  questionType: string;
  totalAnswers: number;
  skipRate: number;
  
  // Type-specific analytics
  choiceDistribution?: ChoiceDistribution[];
  numericStats?: NumericStats;
  textResponses?: string[];
}

export interface ChoiceDistribution {
  choice: string;
  count: number;
  percentage: number;
}

export interface NumericStats {
  min: number;
  max: number;
  average: number;
  median: number;
  standardDeviation: number;
}

export interface ResponseByDate {
  date: string;
  count: number;
}

export interface ResponseByCountry {
  country: string;
  count: number;
  percentage: number;
}
