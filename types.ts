export enum vpCardType {
  milestone = 'milestone',
  award = 'award',
}

export interface vpCard {
  vp: number;
  cardName: string;
  vpType?: vpCardType;
  isNotable?: boolean;
  isTop?: boolean;
}

export interface PlayerData {
  displayName?: string;
  finalScore: number;
  terraformingRating?: number;
  milestonePoints?: number;
  awardPoints?: number;
  greeneryPoints?: number;
  cityPoints?: number;
  victoryPoints?: number;
  megaCredits: number;
  gamePlace: number; // 1, 2, 3, 4
  aheadBy?: {
    score: number;
    megaCredits: number;
  }
  timer: {
    minutes: number;
    seconds: number;
    hours: number;
  };
  actionsTaken?: number;
  corporations?: string[];
  vpCards?: vpCard[];
  milestones?: number;
  awards?: number
}

export interface Game {
  id?: string;
  dateOfGame: Date;
  playerCount?: number;
  generations?: number;
  url?: string;
  fileName: string;
  streakCount: number;
  players: {
    [name: string]: PlayerData
  }
}

export interface TopPerformers {
  mostActions: number;
  shortestTimeSeconds: number;
  fastestWin: number;
  lowestVpWin: number;
  highestVp: number;
  highestTr: number;
  mostGreeneryPoints: number;
  mostConsecutiveWins: number;
  winBySmallestMc: number;
  winByBiggestVp: number;
}

export type processedData = Game[];