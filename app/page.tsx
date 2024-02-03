"use client";

import useSWR from 'swr';
import { Game } from './api/stats/route';

import styles from './page.module.css';
import cx from 'classnames';

// round to two digits. if there are no digits after the decimal, include zeros up to two digits (or 0.30 or 0.00)
const percentageWithTwoSigFigs = (num: number): string => {
  const rounded = round(num * 100);
  return (rounded % 1 === 0 ? `${rounded}.00` : rounded % 0.1 === 0 ? `${rounded}0` : `${rounded}`) + '%';
}

// round to two digits
const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

const Home = () => {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, error } = useSWR('/api/stats', fetcher);

  if (error) {
    return <div>Error loading data</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  // Count the number of wins for each corporation
  const corporationWins: {
    [corporation: string]: {
      plays: number;
      wins?: number;
      mainPlays?: number;
      mainWins?: number;
    }
  } = {};

  // Instantiate corporationWins with all corporations
  data?.forEach((game: Game) => {
    Object.entries(game.players ?? {}).forEach(([_, playerData]) => {
      playerData.corporations?.forEach((corporation: string) => {
        if (!corporationWins[corporation]) {
          corporationWins[corporation] = {
            wins: 0,
            plays: 0,
            mainPlays: 0,
            mainWins: 0,
          };
        }
      });
    });
  });

  // Count the number of wins for each corporation
  data?.forEach((game: Game) => {
    Object.entries(game.players ?? {}).forEach(([_, playerData], playerId) => {
      playerData.corporations?.forEach((corporation: string, corporationId) => {
        corporationWins[corporation].plays++;
        corporationWins[corporation].mainPlays = (corporationWins[corporation]?.mainPlays ?? 0) + (corporationId === 0 ? 1 : 0);
        // playerId === 0 is the winner
        corporationWins[corporation].wins = (corporationWins[corporation]?.wins ?? 0) + (playerId === 0 ? 1 : 0);
        corporationWins[corporation].mainWins = (corporationWins[corporation]?.mainWins ?? 0) + ((playerId === 0 && corporationId === 0) ? 1 : 0);
      });
    });
  });

  // Sort corporations by highest winning to lowest
  const sortedCorporations = Object.entries(corporationWins).sort((a, b) => {
    return (b[1].wins ?? 0) * 10000 - (a[1].wins ?? 0) * 10000 + (a[1].plays ?? 0) - (b[1].plays ?? 0);
  });

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

  // // Get average time taken for each player
  // const timeTakenByPlayer: {
  //   [player: string]: {
  //     plays: number;
  //     timeTaken: number;
  //   }
  // } = {};

  // // Instantiate timeTakenByPlayer with all players
  // data?.forEach((game: Game) => {
  //   Object.entries(game.players ?? {}).forEach(([player]) => {
  //     if (!timeTakenByPlayer[player]) {
  //       timeTakenByPlayer[player] = {
  //         plays: 0,
  //         timeTaken: 0,
  //       };
  //     }
  //   });
  // });

  let mostActions = 0;
  let shortestTimeSeconds = Number.MAX_SAFE_INTEGER;
  let fastestWin = Number.MAX_SAFE_INTEGER;
  let highestVp = 0;
  let highestTr = 0;

  data?.forEach((game: Game) => {
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
    });
  });

  return (
    <div>
      <h1>Terra-Stats!</h1>
      <h2>Wins by Corporation (all wins/plays) <span className={styles.highlight}>(main wins/plays)</span></h2>
      <p>
        All win/plays include corps which were mergered in. Main is only the initial corp.
      </p>
      <div className={styles.corporationDataContainer}>
        {sortedCorporations.map(([corporation, corporationStats]) => (
          <div key={corporation}>
            <div>
              {corporation} ({corporationStats.wins ?? 0}/{corporationStats.plays}){" "}
              <span className={styles.highlight}>({corporationStats.mainWins ?? 0}/{corporationStats.mainPlays ?? 0})</span>
            </div>
          </div>
        ))}
      </div>
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
      <h2>All Games ({data.length})</h2>
      <div className={styles.allDataContainer}>
        <div className={styles.allDataContainer}>
          {data?.sort((a: Game, b: Game) => {
            // if dates are the same, sort by filename
            if (new Date(b.dateOfGame).getTime() === new Date(a.dateOfGame).getTime()) {
              return (b.fileName.split("-")[3] ?? "0").localeCompare(a.fileName.split("-")[3] ?? "0");
            }

            // sort by date
            return new Date(b.dateOfGame).getTime() - new Date(a.dateOfGame).getTime();
          }).
            map((game: Game, id: number) => {
              const date = new Date(game.dateOfGame);
              const dateOfGame = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

              return <>
                <div className={styles.dateOfGame}>
                  <span>{dateOfGame}</span>
                  <span className={styles.generations}>{game.generations} generations</span>
                </div>
                <div key={id} className={styles.playerRow}>{
                  Object.entries(game.players ?? {}).map(([player, playerData], playerId) => (
                    <div key={playerId} className={cx(styles.player,
                      {
                        [styles.mostActions]: playerData.actionsTaken === mostActions,
                        [styles.shortestTime]: ((playerData.timer.hours) * 60 * 60 + (playerData.timer.minutes) * 60 + (playerData.timer.seconds) === shortestTimeSeconds) && playerId !== 0,
                        [styles.fastestWin]: ((playerData.timer.hours) * 60 * 60 + (playerData.timer.minutes) * 60 + (playerData.timer.seconds) === fastestWin) && playerId === 0,
                        [styles.highestVp]: playerData.victoryPoints === highestVp,
                        [styles.highestTr]: playerData.terraformingRating === highestTr,
                      })}>
                      <div className={styles.playerName}>
                        {player}
                        {playerId === 0 && <span className={styles.winner}> 🏆</span>}
                      </div>
                      <div className={styles.playerScore}>{playerData.finalScore}</div>
                      <div className={styles.pointsBreakdown}>
                        <span className={styles.victoryPoints}>
                          {playerData.victoryPoints}
                        </span>{" "}
                        <span className={styles.terraformingRating}>
                          {playerData.terraformingRating}
                        </span>{" "}
                        <span className={styles.megaCredits}>
                          {playerData.megaCredits}
                        </span>
                      </div>
                      <div className={styles.details}>
                        <span title="actions">
                          <span className={styles.subtle}>➡️&nbsp;</span>
                          {playerData.actionsTaken}
                        </span>{" "}
                        <span title="time taken">
                          <span className={styles.subtle}>⏱️&nbsp;</span>
                          {playerData.timer.hours ? `${playerData.timer.hours}:` : ""}
                          {playerData.timer?.minutes.toString().padStart(2, "0")}:{(playerData.timer?.seconds).toString().padStart(2, "0")}
                        </span>
                      </div>
                      <div className={styles.playerCorporation}>
                        {playerData.corporations?.map((corporation) => {
                          return <div key={corporation} className={
                            cx({
                              [styles.subtle]: playerData.corporations?.[0] !== corporation,
                            })
                          }>{corporation}</div>
                        })}
                      </div>
                      <div className={styles.notableCollections}>
                        {playerData.vpCards?.filter(vpCard => vpCard.isNotable).map((vpCard, key) => {
                          return <div key={key} className={styles.vpCard}>
                            <span className={styles.victoryPoints}>
                              {vpCard.vp}
                            </span>
                            <span className={styles.vpCardName}>
                              {vpCard.cardName}!
                            </span>
                          </div>
                        })}
                      </div>
                    </div>
                  ))
                }
                </div>
              </>
            })}
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: `` }}>

      </div>
    </div>
  );
}

export default Home;