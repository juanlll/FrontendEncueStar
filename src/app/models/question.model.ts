export type QuestionType = "checkbox" | "text" | "comment";

export interface Question {
  type: QuestionType;
  title: string;
  name: string;
  choices?: string[]; // solo para checkbox
}
