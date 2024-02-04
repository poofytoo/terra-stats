import styles from "@/components/Players/Players.module.css";

import { Game } from "@/app/api/stats/route";

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
    }
  } = {};

  // Instantiate winsByPlayer with all players
  data?.forEach((game: Game) => {
    Object.entries(game.players ?? {}).forEach(([player]) => {
      if (!winsByPlayer[player]) {
        winsByPlayer[player] = {
          plays: 0,
          wins: 0,
        };
      }
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

  return <div className={styles.playersDataContainer}>
    <h2>Wins by Player</h2>
    {
      Object.entries(winsByPlayer).sort((a, b) => {
        return (b[1].winPercentage ?? 0) - (a[1].winPercentage ?? 0);
      }).map(([player, playerStats]) => (
        <div key={player}>
          <span className={styles.winPercentage}>{percentageWithTwoSigFigs(playerStats.winPercentage ?? 0)}</span>{player} ({playerStats.wins ?? 0}/{playerStats.plays})
        </div>
      ))
    }
  </div>
}