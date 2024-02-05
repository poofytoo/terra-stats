import styles from "@/components/Players/Players.module.css";

import { Game } from "@/types";
import cx from "classnames";

// round to two digits
const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

// round to two digits. if there are no digits after the decimal, include zeros up to two digits (or 0.30 or 0.00)
const percentageWithTwoSigFigs = (num: number): string => {
  const rounded = round(num * 100);
  return rounded.toFixed(2) + '%';
}

export const Players = ({ data }: { data: Game[] }) => {

  const winsByPlayer: {
    [player: string]: {
      plays: number;
      wins?: number;
      winPercentage?: number;
      totalCorporations: number;
      averageCorporations?: number;
    }
  } = {};

  // Instantiate winsByPlayer with all players
  data?.forEach((game: Game) => {
    Object.entries(game.players ?? {}).forEach(([player]) => {
      if (!winsByPlayer[player]) {
        winsByPlayer[player] = {
          totalCorporations: 0,
          plays: 0,
          wins: 0,
        };
      }
    });
  });

  // loop through all games and count the number of corporations played by each player using a reduce function. then divide by the number of games played by that player to get the average corporations played by that player
  data?.forEach((game: Game) => {
    Object.entries(game.players ?? {}).forEach(([player, playerData]) => {
      winsByPlayer[player].totalCorporations = winsByPlayer[player].totalCorporations + ((playerData.corporations ?? []).length ?? 0);
    });
  });

  // Count the number of wins for each player
  data?.forEach((game: Game) => {
    Object.entries(game.players ?? {}).forEach(([player], id: number) => {
      winsByPlayer[player].plays++;
      winsByPlayer[player].wins = (winsByPlayer[player]?.wins ?? 0) + (id === 0 ? 1 : 0);
    });
  });


  Object.entries(winsByPlayer).forEach(([player, playerStats]) => {
    winsByPlayer[player].winPercentage = (playerStats.wins ?? 0) / playerStats.plays;
  });

  // Calculate the average corporations played by each player
  Object.entries(winsByPlayer).forEach(([player, playerStats]) => {
    winsByPlayer[player].averageCorporations = round(playerStats.totalCorporations / playerStats.plays);
    console.log(winsByPlayer[player].totalCorporations)
  });


  return <div className={styles.playersDataContainer}>
    <h2>Wins by Player</h2>
    <div className={styles.playersTable}>
      <div className={cx(styles.row, styles.header)}>
        <span>Player</span>
        <span>Win Rate</span>
        <span>Wins</span>
        <span>Total Plays</span>
        <span>Avg Corps</span>
      </div>
      {
        Object.entries(winsByPlayer).sort((a, b) => {
          return (b[1].winPercentage ?? 0) - (a[1].winPercentage ?? 0);
        }).map(([player, playerStats]) => (
          <div key={player} className={styles.row}>
            <span>{player}</span>
            <strong>{percentageWithTwoSigFigs(playerStats.winPercentage ?? 0)}</strong>
            <span>{playerStats.wins ?? 0}</span>
            <span>{playerStats.plays}</span>
            <span>{playerStats.averageCorporations}</span>
          </div>
        ))
      }
    </div>
  </div>
}