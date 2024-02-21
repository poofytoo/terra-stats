"use client";

import useSWR from 'swr';
import { Game } from '@/types';

import styles from './page.module.css';
import cx from 'classnames';

import { Corporations } from '@/components/Corporations';
import { Players } from '@/components/Players';
import { NotableCollections } from '@/components/NotableCollections';
import { PlayerCard } from '@/components/PlayerCard';
import React from 'react';

const Home = () => {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, error } = useSWR('/api/stats', fetcher);

  if (error) {
    return <div>Error loading data</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  let mostActions = 0;
  let shortestTimeSeconds = Number.MAX_SAFE_INTEGER;
  let fastestWin = Number.MAX_SAFE_INTEGER;
  let lowestVpWin = Number.MAX_SAFE_INTEGER;
  let highestVp = 0;
  let highestTr = 0;
  let mostGreeneryPoints = 0;

  let streakCount = 0;
  let previousWinner = "";

  data?.sort((a: Game, b: Game) => {
    // if dates are the same, sort by filename
    if (new Date(b.dateOfGame).getTime() === new Date(a.dateOfGame).getTime()) {
      return (b.fileName.split("-")[3] ?? "0").localeCompare(a.fileName.split("-")[3] ?? "0");
    }

    // sort by date
    return new Date(b.dateOfGame).getTime() - new Date(a.dateOfGame).getTime();
  })

  // iterate through data but reversed
  data?.slice().reverse().forEach((game: Game) => {
    const winnerName = Object.keys(game.players)[0];
    if (winnerName === previousWinner) {
      streakCount++;
    } else {
      streakCount = 1;
    }
    previousWinner = winnerName;
    game.streakCount = streakCount;
    console.log(game.streakCount, winnerName, streakCount);
  });

  data?.forEach((game: Game) => {
    console.log(game.streakCount);
    const winner = Object.entries(game.players)[0][1];

    const timeInSeconds = (winner.timer.hours) * 60 * 60 + (winner.timer.minutes) * 60 + (winner.timer.seconds);
    if (timeInSeconds < fastestWin) {
      fastestWin = timeInSeconds;
    }

    Object.entries(game.players ?? {}).forEach(([_, playerData]) => {
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
    });
  });

  return (
    <div>
      <h1>Terra-Stats!</h1>
      <div className={styles.columns}>
        <Players data={data} />
        <Corporations data={data} />
        <NotableCollections data={data} />
      </div>
      <h2>All Games ({data.length})</h2>
      <div className={styles.allDataContainer}>
        <div className={styles.allDataContainer}>
          {data.map((game: Game, id: number) => {

              const date = new Date(game.dateOfGame);
              const dateOfGame = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;


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
                        mostGreeneryPoints
                      }} />
                  ))
                }
                </div>
              </React.Fragment>
            })}
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: `` }}>

      </div>
    </div>
  );
}

export default Home;