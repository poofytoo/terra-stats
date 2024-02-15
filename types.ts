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
export interface Game {
  id: string;
  dateOfGame: Date;
  playerCount?: number;
  generations?: number;
  url?: string;
  fileName: string;
  players: {
    [name: string]: {
      displayName?: string;
      finalScore?: number;
      terraformingRating?: number;
      milestonePoints?: number;
      awardPoints?: number;
      greeneryPoints?: number;
      cityPoints?: number;
      victoryPoints?: number;
      megaCredits?: number;
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
  }
}

export type processedData = Game[];