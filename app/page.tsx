"use client";

import useSWR from 'swr';
import { Game } from './api/stats/route';

import styles from './page.module.css';
import cx from 'classnames';

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

  data?.forEach((game: Game) => {
    Object.entries(game.players ?? {}).forEach(([_, playerData], key) => {
      playerData.corporations?.forEach((corporation: string, corporationId) => {
        if (corporationWins[corporation]?.plays) {
          corporationWins[corporation].plays++;
          if (corporationId === 0) {
            // @ts-ignore - weird bug
            corporationWins[corporation].mainPlays++;
          }
        } else {
          corporationWins[corporation] = {
            plays: 1,
            ...(corporationId === 0 ? { mainPlays: 1 } : { mainPlays: 0 })
          };
        }
      });
      if (key === 0) {
        playerData.corporations?.forEach((corporation: string, corporationId) => {
          if (corporationWins[corporation]?.wins) {
            // @ts-ignore - weird bug
            corporationWins[corporation].wins++;
            if (corporationId === 0) {
              // @ts-ignore - weird bug
              corporationWins[corporation].mainWins++;
            }
          } else {
            corporationWins[corporation].wins = 1;
            corporationWins[corporation].mainWins = corporationId === 0 ? 1 : 0;
          }
        });
      }
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
    }
  } = {};

  data?.forEach((game: Game) => {
    Object.entries(game.players ?? {}).forEach(([player, playerData], id: number) => {
      if (winsByPlayer[player]?.plays) {
        winsByPlayer[player].plays++;
      } else {
        winsByPlayer[player] = {
          plays: 1,
          wins: 0,
        };
      }
      if (id === 0) {
        // @ts-ignore - weird bug
        winsByPlayer[player].wins++;
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
          return (b[1].wins ?? 0) * 10000 - (a[1].wins ?? 0) * 10000 + (a[1].plays ?? 0) - (b[1].plays ?? 0);
        }).map(([player, playerStats]) => (
          <div key={player}>
            <div>{player} ({playerStats.wins ?? 0}/{playerStats.plays})</div>
          </div>
        ))
      }
      <h2>All Games</h2>
      <div className={styles.allDataContainer}>
        <div className={styles.allDataContainer}>
          {data?.sort((a: Game, b: Game) => {
            // sort by date
            return new Date(b.dateOfGame).getTime() - new Date(a.dateOfGame).getTime();
          }).
            map((game: Game, id: number) => {
              const date = new Date(game.dateOfGame);
              const dateOfGame = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
              return <>
                <div className={styles.dateOfGame}>{dateOfGame}</div>
                <div key={id} className={styles.playerRow}>{
                  Object.entries(game.players ?? {}).map(([player, playerData]) => (
                    <div key={player} className={styles.player}>
                      <div className={styles.playerName}>{player}</div>
                      <div className={styles.playerScore}>{playerData.finalScore}</div>
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