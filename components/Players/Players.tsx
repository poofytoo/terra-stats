import React, { useContext } from 'react';
import styles from '@/components/Players/Players.module.css'; // Ensure this path is correct
import { Game } from '@/types'; // Ensure this path is correct
import { percentageWithTwoSigFigs, roundWithTwoSigFigs } from '@/utils'; // Ensure these utility functions are correct
import { DateChip } from '../DateChip/DateChip'; // Ensure this path is correct
import { GameDataContext } from '@/hooks/GameDataProvider'; // Ensure this path is correct
import TableGrid, { TableData, TableColumn } from '../TableGrid/TableGrid'; // Ensure this path is correct

const convertStatsToTableData = (stats: {
  [player: string]: {
    aheadBys: { score: number; megaCredits: number }[];
    plays: number;
    wins: number;
    winPercentage?: number;
    totalCorporations: number;
    averageCorporations?: string;
    lastWin?: Date;
    maxStreak?: number;
    lastWinId?: string;
  }
}): TableData => {
  const columns: TableColumn[] = [
    { header: 'Player', key: 'player' },
    { header: 'Win Rate', key: 'winRate' },
    { header: 'Wins', key: 'wins' },
    { header: 'Plays', key: 'plays' },
    { header: 'Avg Corps', key: 'avgCorps' },
    { header: 'Last Win', key: 'lastWin' },
    { header: 'Avg Lead', key: 'avgLead' },
    { header: 'Max Streak', key: 'maxStreak' },
  ];

  const rows = Object.entries(stats).sort((a, b) => {
    return (b[1].winPercentage ?? 0) - (a[1].winPercentage ?? 0);
  }).map(([player, playerStats]) => {
    const avgLead = roundWithTwoSigFigs(playerStats.aheadBys.reduce((val, acc) => val + acc.score, 0) / playerStats.aheadBys.length || 0);

    return {
      player: player,
      winRate: <strong>{percentageWithTwoSigFigs(playerStats.winPercentage ?? 0)}</strong>,
      wins: playerStats.wins ?? 0,
      plays: playerStats.plays,
      avgCorps: playerStats.averageCorporations,
      lastWin: <DateChip gameId={playerStats.lastWinId} />,
      avgLead: `+${avgLead}`,
      maxStreak: playerStats.maxStreak ?? 0,
    };
  });

  return { columns, rows };
};

export const Players: React.FC = () => {
  const { gameData: data } = useContext(GameDataContext);

  const stats: {
    [player: string]: {
      aheadBys: { score: number; megaCredits: number }[];
      plays: number;
      wins: number;
      winPercentage?: number;
      totalCorporations: number;
      averageCorporations?: string;
      lastWin?: Date;
      maxStreak?: number;
      lastWinId?: string;
    }
  } = {};

  data?.forEach((game: Game) => {
    Object.entries(game.players ?? {}).forEach(([player, playerData], id: number) => {
      if (!stats[player]) {
        stats[player] = {
          aheadBys: [],
          totalCorporations: 0,
          plays: 0,
          wins: 0,
        };
      }

      const playerStats = stats[player];

      if (id === 0) {
        if (playerStats.lastWin) {
          if (game.dateOfGame > playerStats.lastWin) {
            playerStats.lastWin = game.dateOfGame;
            playerStats.lastWinId = game.id;
          }
        } else {
          playerStats.lastWin = game.dateOfGame;
          playerStats.lastWinId = game.id;
        }

        if (playerData?.aheadBy) {
          playerStats.aheadBys.push(playerData.aheadBy);
        }

        const playerStreak = game.streakCount ?? 0;
        if (playerStreak > (playerStats.maxStreak ?? 0)) {
          playerStats.maxStreak = playerStreak;
        }
        playerStats.wins++;
      }

      playerStats.plays++;
      playerStats.totalCorporations += (playerData.corporations ?? []).length;
    });
  });

  // After gathering all data, calculate win percentage and average corporations
  Object.entries(stats).forEach(([_, playerStats]) => {
    playerStats.winPercentage = playerStats.wins / playerStats.plays;
    playerStats.averageCorporations = roundWithTwoSigFigs(playerStats.totalCorporations / playerStats.plays);
  });

  const tableData = convertStatsToTableData(stats);

  return (
    <div className={styles.playersDataContainer}>
      <h2>Wins by Player</h2>
      <TableGrid data={tableData} />
    </div>
  );
};

