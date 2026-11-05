export type DestinationVisa = 'france' | 'usa' | 'canada' | 'turquie' | 'schengen'

export type VisaLevel = 'low' | 'medium' | 'good' | 'great'

export interface DocumentVisa {
  id: string
  label: string
  points: number
  obligatoire: boolean
  description?: string
}

export interface DestinationConfig {
  label: string
  flag: string
  platform: string
  platformUrl: string
  formLabel: string
  formUrl: string
  documents: DocumentVisa[]
}

export interface VisaScoreResult {
  score: number
  level: VisaLevel
  levelLabel: string
  levelColor: string
  message: string
  missing: string[]
  checkedCount: number
  totalCount: number
}

export interface ScoreLevelConfig {
  label: string
  color: string
  bgColor: string
  message: string
  emoji: string
}
