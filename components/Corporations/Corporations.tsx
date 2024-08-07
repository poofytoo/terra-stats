import React, { useContext } from 'react';
import styles from './Corporations.module.css'; // Ensure this path is correct
import { GameDataContext } from '@/hooks/GameDataProvider'; // Ensure this path is correct
import { Game } from '@/types'; // Ensure this path is correct
import TableGrid, { TableData, TableColumn } from '../TableGrid/TableGrid'; // Ensure this path is correct
import { percentageWithTwoSigFigs } from '@/libs/util';

const convertCorporationsToTableData = (corporationWins: {
  [corporation: string]: {
    plays: number;
    wins?: number;
    mainPlays?: number;
    mainWins?: number;
    winPercentage?: number;
  }
}): TableData => {
  const columns: TableColumn[] = [
    { header: 'Corporation', key: 'corporation', className: styles.corporationName, shrinkable: true },
    { header: 'Wins', key: 'wins', className: styles.wins },
    { header: 'Plays', key: 'plays', className: styles.plays },
    { header: 'Win %', key: 'winPercentage', className: styles.winPercentage },
    { header: <>Main<br />Wins</>, key: 'mainWins', className: styles.mainWins },
    { header: <>Main<br />Plays</>, key: 'mainPlays', className: styles.mainPlays },
    { header: <>Main<br />Win %</>, key: 'mainWinPercentage', className: styles.mainWinPercentage }
  ];

  const rows = Object.entries(corporationWins).map(([corporation, stats]) => ({
    corporation: <a target='_BLANK' href={`https://terraforming-mars.herokuapp.com/cards#${corporation}`}>{corporation}</a>,
    wins: stats.wins ?? 0,
    plays: stats.plays,
    mainWins: stats.mainWins ?? 0,
    mainPlays: stats.mainPlays ?? 0,
    winPercentage: percentageWithTwoSigFigs(stats.winPercentage ?? 0),
    winPercentage_raw: stats.winPercentage,
    mainWinPercentage: percentageWithTwoSigFigs((stats.mainWins ?? 0) / (stats.mainPlays ?? 1)),
    mainWinPercentage_raw: (stats.mainWins ?? 0) / (stats.mainPlays ?? 1)
  }));

  return { columns, rows };
};

export const Corporations: React.FC = () => {
  const { gameData: data } = useContext(GameDataContext);

  const corporationWins: {
    [corporation: string]: {
      plays: number;
      wins?: number;
      mainPlays?: number;
      mainWins?: number;
      winPercentage?: number;
    }
  } = {};

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

  data?.forEach((game: Game) => {
    Object.entries(game.players ?? {}).forEach(([_, playerData], playerId) => {
      playerData.corporations?.forEach((corporation: string, corporationId) => {
        corporationWins[corporation].plays++;
        corporationWins[corporation].mainPlays = (corporationWins[corporation]?.mainPlays ?? 0) + (corporationId === 0 ? 1 : 0);
        corporationWins[corporation].wins = (corporationWins[corporation]?.wins ?? 0) + (playerId === 0 ? 1 : 0);
        corporationWins[corporation].mainWins = (corporationWins[corporation]?.mainWins ?? 0) + ((playerId === 0 && corporationId === 0) ? 1 : 0);
      });
    });
  });

  Object.entries(corporationWins).forEach(([corporation, stats]) => {
    stats.winPercentage = ((stats.wins ?? 0) / stats.plays) ?? 0;
  });

  const sortedCorporations = Object.entries(corporationWins).sort((a, b) => {
    return (b[1].wins ?? 0) * 10000 - (a[1].wins ?? 0) * 10000 + (a[1].plays ?? 0) - (b[1].plays ?? 0);
  });

  const tableData = convertCorporationsToTableData(Object.fromEntries(sortedCorporations));

  return (
    <div className={styles.corporationDataContainer}>
      <h2>Wins by Corporation</h2>
      <TableGrid data={tableData} condensable={true} tableId='corporations' />
    </div>
  );
};

export default Corporations;
