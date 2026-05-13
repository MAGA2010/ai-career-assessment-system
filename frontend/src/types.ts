export interface Question {
  id: number;
  text: string;
  options: string[];
}

export interface AssessmentRequest {
  answers: Record<number, string>;
}

export interface AssessmentResponse {
  report: string;
  career_suggestions: string[];
  follow_up_questions?: Question[];
}

export interface UserReport {
  id: number;
  answers: Record<number, string>;
  report: string;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_reports: number;
}