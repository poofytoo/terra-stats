import styles from "@/components/Players/Players.module.css";

import { Game } from "@/types";
import { formatDate, percentageWithTwoSigFigs, roundWithTwoSigFigs } from "@/utils";
import cx from "classnames";

export const Players = ({ data }: { data: Game[] }) => {

  const winsByPlayer: {
    [player: string]: {
      plays: number;
      wins: number;
      winPercentage?: number;
      totalCorporations: number;
      averageCorporations?: string;
      lastWin?: Date;
    }
  } = {};

  data?.forEach((game: Game) => {
    Object.entries(game.players ?? {}).forEach(([player, playerData], id: number) => {
      if (!winsByPlayer[player]) {
        winsByPlayer[player] = {
          totalCorporations: 0,
          plays: 0,
          wins: 0,
        };
      }

      const playerStats = winsByPlayer[player];

      if (id === 0) {
        if (playerStats.lastWin) {
          if (game.dateOfGame > playerStats.lastWin) {
            playerStats.lastWin = game.dateOfGame;
          }
        } else {
          playerStats.lastWin = game.dateOfGame;
        }
      }

      playerStats.plays++;
      playerStats.totalCorporations += (playerData.corporations ?? []).length;

      if (id === 0) {
        playerStats.wins++;
      }
    });
  });

  // After gathering all data, calculate win percentage and average corporations
  Object.entries(winsByPlayer).forEach(([player, playerStats]) => {
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
      </div>
      {
        Object.entries(winsByPlayer).sort((a, b) => {
          return (b[1].winPercentage ?? 0) - (a[1].winPercentage ?? 0);
        }).map(([player, playerStats]) => (
          <div key={player} className={styles.row}>
            <span>{player}</span>
            <span><strong>{percentageWithTwoSigFigs(playerStats.winPercentage ?? 0)}</strong></span>
            <span>{playerStats.wins ?? 0}</span>
            <span>{playerStats.plays}</span>
            <span>{playerStats.averageCorporations}</span>
            <span>{playerStats.lastWin ? formatDate(playerStats.lastWin) : 'n/a'}</span>
          </div>
        ))
      }
    </div>
  </div>
}