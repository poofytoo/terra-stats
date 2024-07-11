import { GameDataContext } from "@/hooks/GameDataProvider";
import { useContext } from "react";
import TableGrid from "../TableGrid/TableGrid";
import { Game, PlayerData } from "@/types";
import { percentageWithTwoSigFigs } from "@/libs/util";

interface AwardStats { [awardName: string]: number }
interface AggregateAwardStats {
  [awardName: string]: {
    total: number,
    playerCounts: {
      [player: string]: number
    }
  }
}
export const AwardStats = () => {
  const { gameData } = useContext(GameDataContext);
  const awardStats: AggregateAwardStats = gameData?.reduce((
    acc: AggregateAwardStats,
    game: Game) => {
    Object.keys(game.players).forEach((playerName) => {
      const player = game.players[playerName] as PlayerData;
      player?.awards?.forEach((award) => {
        if (acc[award.name]) {
          acc[award.name].total += 1
        } else {
          acc[award.name] = {
            total: 1,
            playerCounts: {}
          }
        }
        if (acc[award.name]) {
          if (acc[award.name].playerCounts[playerName]) {
            acc[award.name].playerCounts[playerName] += 1
          } else {
            acc[award.name].playerCounts[playerName] = 1
          }
        } else {
          acc[award.name].playerCounts = {
            [playerName]: 1
          }
        }
      });
    });
    return acc
  }, {}) ?? {};

  const awards = Object.keys(awardStats).map((award) => {
    return {
      awardName: award,
      count: awardStats[award].total
    }
  }).sort((awardA, awardB) => {
    return awardB.count - awardA.count
  })

  const rows = [
    ...awards.map((award) => {
      const mostClaimedBy = Object.keys(awardStats[award.awardName].playerCounts).reduce((acc, player) => {
        if (awardStats[award.awardName].playerCounts[player] > acc.count) {
          acc = {
            player: player,
            count: awardStats[award.awardName].playerCounts[player]
          }
        }
        return acc
      }, { player: '', count: 0 })

      return {
        award: <a target='_BLANK' href={`https://terraforming-mars.herokuapp.com/cards#${award.awardName}`}>{award.awardName}</a>,
        count: award.count,
        percent: percentageWithTwoSigFigs(award.count / (gameData?.length ?? 1)),
        mostClaimedBy: `${mostClaimedBy.player} (${mostClaimedBy.count})`
      }
    })];

  return <div>
    <h2>Award Stats</h2>
    <TableGrid data={
      {
        columns: [
          { header: 'Award Name', key: 'award' },
          { header: 'Times Claimed', key: 'count' },
          { header: '% of Games', key: 'percent' },
          { header: 'Most Claimed By', key: 'mostClaimedBy' },
        ],
        rows,
      }}
    />
  </div>
}