// Quiz type definitions
export interface QuizQuestion {
  id: string
  section: 'production' | 'distribution' | 'analytics'
  text: string
  type: 'single_choice'
  options: QuizOption[]
}

export interface QuizOption {
  text: string
  points: number
}

export interface QuizAnswers {
  [questionId: string]: number
}

export interface QuizScores {
  production: number
  distribution: number
  analytics: number
  total: number
  tier: 'Free' | 'Starter' | 'Pro'
}

export interface QuizResponse {
  id: string
  email: string
  fullName?: string
  scores: QuizScores
  answers: QuizAnswers
  createdAt: string
}

export type QuizTier = 'Free' | 'Starter' | 'Pro'
