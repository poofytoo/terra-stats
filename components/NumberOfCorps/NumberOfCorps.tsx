import { GameDataContext } from "@/hooks/GameDataProvider";
import { useContext } from "react";
import TableGrid from "../TableGrid/TableGrid";
import { percentageWithTwoSigFigs } from "@/libs/util";

interface Game {
  players: {
    [key: string]: Player;
  };
}

interface Player {
  corporations?: string[];
}

interface WinsByNumberOfCorps {
  winners: { [key: number]: number };
  plays: { [key: number]: number };
}

export const NumberOfCorps = () => {
  const { gameData } = useContext(GameDataContext);

  const initialWinsByNumberOfCorps: WinsByNumberOfCorps = { winners: {}, plays: {} };

  const winsByNumberOfCorps: WinsByNumberOfCorps = gameData?.reduce((acc, game: Game) => {
    const players = Object.keys(game.players);
    const winner = game.players[players[0]];

    const numberOfCorps = winner?.corporations?.length ?? 1;
    if (acc.winners[numberOfCorps]) {
      acc.winners[numberOfCorps]++;
    } else {
      acc.winners[numberOfCorps] = 1;
    }

    players.forEach(player => {
      if (acc.plays[numberOfCorps]) {
        acc.plays[numberOfCorps]++;
      } else {
        acc.plays[numberOfCorps] = 1;
      }
    });
    return acc;
  }, initialWinsByNumberOfCorps) || initialWinsByNumberOfCorps;

  const rows = Object.keys(winsByNumberOfCorps.winners).map((numberOfCorps) => {
    const numOfCorps = Number(numberOfCorps);
    const wins = winsByNumberOfCorps.winners[numOfCorps] ?? 0;
    const plays = winsByNumberOfCorps.plays[numOfCorps] ?? 0;
    const percentage = percentageWithTwoSigFigs(wins / plays);

    return {
      numberOfCorps: numOfCorps,
      wins: wins,
      plays: plays,
      percentage: percentage,
    };
  });

  console.log(winsByNumberOfCorps);
  return (
    <div>
      <h2>Wins by Number of Corporations</h2>
      <TableGrid data={
        {
          columns: [
            { header: '# of Corps', key: 'numberOfCorps' },
            { header: 'Wins', key: 'wins' },
            { header: 'Total Plays', key: 'plays' },
            { header: 'Percentage', key: 'percentage' },
          ],
          rows: rows
        }
      } />
    </div>
  );
};
