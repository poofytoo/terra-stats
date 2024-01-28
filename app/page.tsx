"use client";

import useSWR from 'swr';
import { Game } from './api/stats/route';

import styles from './page.module.css';
import cx from 'classnames';

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

  // add winPercentage to winsbyplayer and store in winsByPlayer
  Object.entries(winsByPlayer).forEach(([player, playerStats]) => {
    winsByPlayer[player].winPercentage = round((playerStats.wins ?? 0) / playerStats.plays);
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
            <span className={styles.winPercentage}>{Math.round((playerStats.winPercentage ?? 0) * 100)}%</span>{player} ({playerStats.wins ?? 0}/{playerStats.plays})
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
                    <div key={playerId} className={styles.player}>
                      <div className={styles.playerName}>
                        {player}
                        {playerId === 0 && <span className={styles.winner}> 🏆</span>}
                      </div>
                      <div className={styles.playerScore}>{playerData.finalScore}</div>
                      <div className={styles.details}>
                        <span title="actions">
                          <span className={styles.subtle}>🚀&nbsp;</span>
                          {playerData.actionsTaken}
                        </span>{" "}
                        <span title="time taken">
                          <span className={styles.subtle}>⏱️&nbsp;</span>
                          {playerData.timer?.minutes}:{(playerData.timer?.seconds ?? "0").toString().padStart(2, "0")}
                        </span>
                      </div>
                      <div className={styles.playerCorporation}>{playerData.corporations?.map((corporation) => {
                        return <div key={corporation} className={
                          cx({
                            [styles.subtle]: playerData.corporations?.[0] !== corporation,
                          })
                        }>{corporation}</div>
                      })}</div>
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