import { Game } from "@/types";
import React from "react";

import styles from "./AllGames.module.css";
import { formatDate } from "@/utils";
import { PlayerCard } from "../PlayerCard";

export const AllGames = ({ data }: { data: Game[] }) => {

  let mostActions = 0;
  let shortestTimeSeconds = Number.MAX_SAFE_INTEGER;
  let fastestWin = Number.MAX_SAFE_INTEGER;
  let lowestVpWin = Number.MAX_SAFE_INTEGER;
  let highestVp = 0;
  let highestTr = 0;
  let mostGreeneryPoints = 0;
  let winByBiggestVp = 0;
  let winBySmallestMc = Number.MAX_SAFE_INTEGER;
  let mostConsecutiveWins = 0;



  data?.forEach((game: Game) => {
    const winner = Object.entries(game.players)[0][1];

    const timeInSeconds = (winner.timer.hours) * 60 * 60 + (winner.timer.minutes) * 60 + (winner.timer.seconds);
    if (timeInSeconds < fastestWin) {
      fastestWin = timeInSeconds;
    }

    Object.entries(game.players ?? {}).forEach(([rank, playerData]) => {
      const playerTimeInSeconds = (playerData.timer.hours) * 60 * 60 + (playerData.timer.minutes) * 60 + (playerData.timer.seconds);
      if (playerTimeInSeconds < shortestTimeSeconds) {
        shortestTimeSeconds = playerTimeInSeconds;
      }
      if (playerData.victoryPoints && (playerData.victoryPoints ?? 0) > highestVp) {
        highestVp = playerData.victoryPoints;
      }
      if (playerData.terraformingRating && (playerData.terraformingRating ?? 0) > highestTr) {
        highestTr = playerData.terraformingRating;
      }
      if (playerData.actionsTaken && (playerData.actionsTaken ?? 0) > mostActions) {
        mostActions = playerData.actionsTaken;
      }
      if (playerData.victoryPoints && (playerData.victoryPoints ?? Number.MAX_SAFE_INTEGER) < lowestVpWin) {
        lowestVpWin = playerData.victoryPoints;
      }
      if (playerData.greeneryPoints && (playerData.greeneryPoints ?? 0) > mostGreeneryPoints) {
        mostGreeneryPoints = playerData.greeneryPoints;
      }
      // check if the winner is ahead of the second place player by megacredits. if less than the current lowest, set it as the new lowest
      if (winner.finalScore === playerData.finalScore
        && playerData.gamePlace === 2
        && (winner.megaCredits - playerData.megaCredits < winBySmallestMc)) {
        winBySmallestMc = winner.megaCredits - playerData.megaCredits;
      }

      // check if the winner is ahead of the second place player by victory points. if more than the current highest, set it as the new highest
      if (playerData.gamePlace === 2
        && (winner.finalScore - playerData.finalScore > winByBiggestVp)) {
        winByBiggestVp = winner.finalScore - playerData.finalScore;
      }

      if (game.streakCount > mostConsecutiveWins) {
        mostConsecutiveWins = game.streakCount;
      }
    });
  });

  return <div className={styles.allDataContainer}>
    <div className={styles.allDataContainer}>
      {data.map((game: Game, id: number) => {

        const date = new Date(game.dateOfGame);
        const dateOfGame = formatDate(date);

        // showGameResultsLink is only True if date is within the last 15 days 
        const showGameResultsLink = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24) < 15;

        return <React.Fragment key={id}>
          <div className={styles.dateOfGame}>
            <span>{dateOfGame}</span>
            <span className={styles.generations}>{game.generations} generations</span>{" "}
            {showGameResultsLink &&
              <span>
                <a className={styles.gameLink} href={`https://terraforming-mars.herokuapp.com/the-end?id=${game.id}`} target="_blank">View Game Results</a>
              </span>}
          </div>
          <div className={styles.playerRow}>{
            Object.entries(game.players ?? {}).map(([player, playerData], nthPlayer) => (
              <PlayerCard
                key={player}
                player={player}
                playerData={playerData}
                nthPlayer={nthPlayer}
                streakAmount={game.streakCount ?? 0}
                topPerformers={{
                  mostActions,
                  shortestTimeSeconds,
                  fastestWin,
                  lowestVpWin,
                  highestVp,
                  highestTr,
                  mostGreeneryPoints,
                  mostConsecutiveWins: 0, // fix
                  winByBiggestVp,
                  winBySmallestMc
                }} />
            ))
          }
          </div>
        </React.Fragment>
      })}
    </div>
  </div>
};