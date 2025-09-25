import { BaseEntity } from './base.model';

export enum QuestionType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  CHECKBOX = 'checkbox',
  RADIOGROUP = 'radiogroup',
  DROPDOWN = 'dropdown',
  RATING = 'rating',
  BOOLEAN = 'boolean',
  DATE = 'date',
  EMAIL = 'email',
  NUMBER = 'number'
}

export interface Question extends BaseEntity {
  type: QuestionType;
  title: string;
  name: string;
  description?: string;
  isRequired: boolean;
  order: number;
  surveyId: string;
  
  // Type-specific properties
  choices?: QuestionChoice[];
  placeholder?: string;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  defaultValue?: any;
  
  // Validation rules
  validationRules?: ValidationRule[];
  
  // Conditional logic
  visibleIf?: string;
  enableIf?: string;
}

export interface QuestionChoice {
  value: string;
  text: string;
  imageUrl?: string;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern';
  value?: any;
  message: string;
}

// DTOs for Question operations
export interface CreateQuestionDto {
  type: QuestionType;
  title: string;
  name: string;
  description?: string;
  isRequired: boolean;
  order: number;
  surveyId: string;
  choices?: QuestionChoice[];
  placeholder?: string;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  defaultValue?: any;
  validationRules?: ValidationRule[];
  visibleIf?: string;
  enableIf?: string;
}

export interface UpdateQuestionDto extends Partial<CreateQuestionDto> {
  id: string;
}
