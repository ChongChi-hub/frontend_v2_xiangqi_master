export type AIDifficultyLevel =
  | 'beginner'
  | 'apprentice'
  | 'intermediate'
  | 'master'
  | 'grandmaster';

export type GameMode = 'practice' | 'ranked';

export type BoardType = 'wood' | 'leather' | 'paper';

export type PieceStyle = 'classic' | 'modern' | 'symbol';

export interface AIDifficultyOption {
  id: AIDifficultyLevel;
  title: string;
  description: string;
  iconName: string;
  isSpecial?: boolean;
}

export interface AIMoveRequest {
  fen: string;
}

export interface AIMoveResponse {
  bestMove: string;
  evaluationScore: number;
  newFen: string;
  nodesVisited?: number;
}

export interface AIHintRequest {
  fen: string;
}

export interface AIHintResponse {
  suggestedMove: string;
  score: number;
  explanation: string;
}

export interface AIValidateRequest {
  fen: string;
  move: string;
}

export interface AIValidateResponse {
  isValid: boolean;
  reason: string;
}

export interface PVESettings {
  difficulty: AIDifficultyLevel;
  mode: GameMode;
  boardType: BoardType;
  pieceStyle: PieceStyle;
}
