import styles from "@/components/Players/Players.module.css";

import { Game } from "@/types";
import { formatDate, percentageWithTwoSigFigs, roundWithTwoSigFigs } from "@/utils";
import cx from "classnames";
import { DateChip } from "../DateChip/DateChip";

export const Players = ({ data }: { data: Game[] }) => {

  const stats: {
    [player: string]: {
      aheadBys: {
        score: number;
        megaCredits: number;
      }[];
      plays: number;
      wins: number;
      winPercentage?: number;
      totalCorporations: number;
      averageCorporations?: string;
      lastWin?: Date;
      maxStreak?: number;
      lastWinId?: string;
    }
  } = {};

  data?.forEach((game: Game) => {
    Object.entries(game.players ?? {}).forEach(([player, playerData], id: number) => {
      if (!stats[player]) {
        stats[player] = {
          aheadBys: [],
          totalCorporations: 0,
          plays: 0,
          wins: 0,
        };
      }

      const playerStats = stats[player];

      if (id === 0) {
        if (playerStats.lastWin) {
          if (game.dateOfGame > playerStats.lastWin) {
            playerStats.lastWin = game.dateOfGame;
            playerStats.lastWinId = game.id;
          }
        } else {
          playerStats.lastWin = game.dateOfGame;
          playerStats.lastWinId = game.id;
        }

        if (playerData?.aheadBy) {
          playerStats.aheadBys.push(playerData.aheadBy);
        }

        const playerStreak = game.streakCount ?? 0;
        if (playerStreak > (playerStats.maxStreak ?? 0)) {
          playerStats.maxStreak = playerStreak;
        }
        playerStats.wins++;
      }

      playerStats.plays++;
      playerStats.totalCorporations += (playerData.corporations ?? []).length;
    });
  });

  // After gathering all data, calculate win percentage and average corporations
  Object.entries(stats).forEach(([player, playerStats]) => {
    playerStats.winPercentage = playerStats.wins / playerStats.plays;
    playerStats.averageCorporations = roundWithTwoSigFigs(playerStats.totalCorporations / playerStats.plays);
  });

  return <div className={styles.playersDataContainer}>
    <h2>Wins by Player</h2>
    <div className={styles.playersTable}>
      <div className={cx(styles.row, styles.header)}>
        <span>Player</span>
        <span>Win Rate</span>
        <span>Wins</span>
        <span>Plays</span>
        <span>Avg Corps</span>
        <span>Last Win</span>
        <span>Avg&nbsp;Lead</span>
        <span>Max&nbsp;Streak</span>
      </div>
      {
        Object.entries(stats).sort((a, b) => {
          return (b[1].winPercentage ?? 0) - (a[1].winPercentage ?? 0);
        }).map(([player, playerStats]) => {
          const avgLead = roundWithTwoSigFigs(playerStats.aheadBys.reduce((val, acc) => {
            return val + acc.score;
          }, 0) /
            playerStats.aheadBys.length || 0)

          return (
            <div key={player} className={styles.row}>
              <span>{player}</span>
              <span><strong>{percentageWithTwoSigFigs(playerStats.winPercentage ?? 0)}</strong></span>
              <span>{playerStats.wins ?? 0}</span>
              <span>{playerStats.plays}</span>
              <span>{playerStats.averageCorporations}</span>
              <span><DateChip gameId={playerStats.lastWinId} /></span>
              {/* <span>{playerStats.lastWin ? formatDate(playerStats.lastWin) : 'n/a'}</span> */}
              <span>+{avgLead}</span>
              <span>{playerStats.maxStreak ?? 0}</span>
            </div>
          );
        })}
    </div>
  </div>
}