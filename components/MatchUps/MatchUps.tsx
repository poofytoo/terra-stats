import { GameDataContext } from "@/hooks/GameDataProvider";
import { Game } from "@/types";
import { useContext } from "react";

import cx from 'classnames';
import styles from './MatchUps.module.css';

interface MatchUps {
  [winner: string]: {
    [loser: string]: {
      count: number;
      games: string[];
    }
  }
}

export const MatchUps = () => {
  const { gameData } = useContext(GameDataContext);

  if (!gameData) {
    return <div>Loading...</div>
  }

  const allPlayers: string[] = [];
  const matchUps: MatchUps = gameData.reduce((acc: MatchUps, game: Game) => {

    const players = Object.keys(game.players);
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const higherScoredPlayer = players[i];
        const lowerScoredPlayer = players[j];
        if (!allPlayers.includes(higherScoredPlayer)) {
          allPlayers.push(higherScoredPlayer);
        }
        if (!allPlayers.includes(lowerScoredPlayer)) {
          allPlayers.push(lowerScoredPlayer);
        }

        if (!acc[higherScoredPlayer]) {
          acc[higherScoredPlayer] = {};
        }

        if (!acc[higherScoredPlayer][lowerScoredPlayer]) {
          acc[higherScoredPlayer][lowerScoredPlayer] = {
            count: 0,
            games: []
          }
        }

        acc[higherScoredPlayer][lowerScoredPlayer].games.push(game.id);
        acc[higherScoredPlayer][lowerScoredPlayer].count += 1;
      }
    }
    return acc;
  }, {});

  return (
    <div>
      <h2>Match Ups</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th></th>
            {allPlayers.map((player) => (
              <th key={player}>{player}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allPlayers.map((winner) => (
            <tr key={winner}>
              <td width="120" className="left">Winner: <strong>{winner}</strong></td>
              {allPlayers.map((loser) => {
                const hasNeverPlayer = winner === loser || (!matchUps[winner]?.[loser]?.count && !matchUps[loser]?.[winner]?.count);
                return <td width="70" key={loser} className={cx({
                  [styles.self]: hasNeverPlayer
                })}>
                  {!hasNeverPlayer ? (<>{
                    matchUps[winner]?.[loser]?.count
                    ?? 0} / {
                      matchUps[loser]?.[winner]?.count
                      ?? 0}</>) : ""}
                </td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}