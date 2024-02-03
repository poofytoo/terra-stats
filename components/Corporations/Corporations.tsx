import { Game } from '@/app/api/stats/route';

import styles from './Corporations.module.css';
import { useState } from 'react';

export const Corporations = ({ data }: { data: Game[] }) => {
  const [showAll, setShowAll] = useState(false);

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

  const topCorporationCount = 6
  const bottomCorporationCount = 6

  return <div className={styles.corporationDataContainer}>
    <h2>Wins by Corporation (all wins/plays) <span className={styles.highlight}>(main wins/plays)</span></h2>
    <p>
      All win/plays include corps which were mergered in. Main is only the initial corp.
    </p>
    {sortedCorporations.filter((_, id) => showAll ? true : (id < topCorporationCount) || (id > sortedCorporations.length - bottomCorporationCount - 1)).map(([corporation, corporationStats], id) => (<>
      {(id === topCorporationCount && !showAll) && <div key={'...'}>
        <div>
          ...
        </div>
      </div>}
      <div key={corporation}>
        <div>
          {corporation} ({corporationStats.wins ?? 0}/{corporationStats.plays}){" "}
          <span className={styles.highlight}>({corporationStats.mainWins ?? 0}/{corporationStats.mainPlays ?? 0})</span>
        </div>
      </div></>
    ))}
    <p>
      <button onClick={() => {
        setShowAll(!showAll);
      }}>{showAll ? "Hide" : "Show all"}</button>
    </p>
  </div>
}