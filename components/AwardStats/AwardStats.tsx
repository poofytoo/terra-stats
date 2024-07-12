import { GameDataContext } from "@/hooks/GameDataProvider";
import { useContext, useEffect, useState } from "react";
import TableGrid from "../TableGrid/TableGrid";
import { Game, PlayerData } from "@/types";
import { gab, percentageWithTwoSigFigs } from "@/libs/util";

import cx from 'classnames';

interface AwardStats { [awardName: string]: number }
interface AggregateAwardStats {
  [awardName: string]: {
    total: number,
    playerCounts: {
      [player: string]: number
    }
  }
}

interface AggregateMilestoneStats {
  [milestoneName: string]: {
    total: number,
    playerCounts: {
      [player: string]: number
    }
  }
}

export const AwardStats = () => {
  const { gameData } = useContext(GameDataContext);
  const [showAwards, setShowAwards] = useState<boolean>();

  useEffect(() => {
    const showAwards = localStorage.getItem('showAwards');
    if (showAwards !== undefined) {
      setShowAwards(showAwards === 'true');
    }
  }, []);

  useEffect(() => {
    if (showAwards !== undefined) {
      localStorage.setItem('showAwards', (showAwards).toString());
    }
  }, [showAwards]);

  const awardStats: AggregateAwardStats = gameData?.reduce((
    acc: AggregateAwardStats,
    game: Game) => {
    Object.keys(game.players).forEach((playerName) => {
      const player = game.players[playerName] as PlayerData;
      player?.awards?.forEach((award) => {
        if (award.place !== 1) return;
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
  });

  interface GameIdToAward {
    [gameId: string]: [{
      milestone: string,
      fundedBy: string
    }]
  }

  const gameIdToAward: GameIdToAward = gameData?.reduce((
    acc: GameIdToAward,
    game: Game) => {
    Object.keys(game.players).forEach((playerName) => {
      const player = game.players[playerName] as PlayerData;
      player?.awards?.forEach((award) => {
        if (acc[game.id]) {
          // check to make sure the milestone isn't already in the array
          const found = acc[game.id].find((awardEntry) => awardEntry.milestone === award.name)
          if (!found) {
            acc[game.id].push({
              milestone: award.name,
              fundedBy: playerName
            })
          }
        } else {
          acc[game.id] = [{
            milestone: award.name,
            fundedBy: playerName
          }]
        }
      });
    })
    return acc
  }, {}) ?? {};

  interface AwardToFundedBy {
    [award: string]: {
      [player: string]: number
    }
  }



  const mostFundedByMap = Object.keys(gameIdToAward).reduce((
    ac: AwardToFundedBy,
    gameId: string
  ) => {
    gameIdToAward[gameId].forEach((award) => {
      if (ac[award.milestone]) {
        if (ac[award.milestone][award.fundedBy]) {
          ac[award.milestone][award.fundedBy] += 1
        } else {
          ac[award.milestone][award.fundedBy] = 1
        }
      } else {
        ac[award.milestone] = {
          [award.fundedBy]: 1
        }
      }
    })
    return ac
  }, {})

  const awardRows = [
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

      const mostFundedBy = Object.keys(mostFundedByMap[award.awardName]).reduce((acc, player) => {
        if (mostFundedByMap[award.awardName][player] > acc.count) {
          acc = {
            player: player,
            count: mostFundedByMap[award.awardName][player]
          }
        }
        return acc
      }, { player: '', count: 0 });

      return {
        award: <a target='_BLANK' href={`https://terraforming-mars.herokuapp.com/cards#${award.awardName}`}>{award.awardName}</a>,
        count: award.count,
        percent: percentageWithTwoSigFigs(award.count / (gameData?.length ?? 1)),
        mostClaimedBy: `${mostClaimedBy.player} (${mostClaimedBy.count})`,
        mostFundedBy: `${mostFundedBy.player} (${mostFundedBy.count})`
      }
    })];

  const awardColumns = [
    { header: 'Award', key: 'award' },
    { header: <>Times<br />Funded</>, key: 'count' },
    { header: '% of Games', key: 'percent' },
    { header: 'Most Firsts in', key: 'mostClaimedBy' },
    { header: 'Most Funded By', key: 'mostFundedBy' },
  ];

  const milestoneStats: AggregateMilestoneStats = gameData?.reduce((
    acc: AggregateMilestoneStats,
    game: Game) => {
    Object.keys(game.players).forEach((playerName) => {
      const player = game.players[playerName] as PlayerData;
      player?.milestones?.forEach((milestone) => {
        if (acc[milestone.name]) {
          acc[milestone.name].total += 1
        } else {
          acc[milestone.name] = {
            total: 1,
            playerCounts: {}
          }
        }
        if (acc[milestone.name]) {
          if (acc[milestone.name].playerCounts[playerName]) {
            acc[milestone.name].playerCounts[playerName] += 1
          } else {
            acc[milestone.name].playerCounts[playerName] = 1
          }
        } else {
          acc[milestone.name].playerCounts = {
            [playerName]: 1
          }
        }
      });
    });
    return acc
  }, {}) ?? {};

  const milestones = Object.keys(milestoneStats).map((milestone) => {
    return {
      milestoneName: milestone,
      count: milestoneStats[milestone].total
    }
  }).sort((milestoneA, milestoneB) => {
    return milestoneB.count - milestoneA.count
  });

  const milestoneRows = [
    ...milestones.map((milestone) => {
      const mostClaimedBy = Object.keys(milestoneStats[milestone.milestoneName].playerCounts).reduce((acc, player) => {
        if (milestoneStats[milestone.milestoneName].playerCounts[player] > acc.count) {
          acc = {
            player: player,
            count: milestoneStats[milestone.milestoneName].playerCounts[player]
          }
        }
        return acc
      }, { player: '', count: 0 })


      return {
        milestone: <a target='_BLANK' href={`https://terraforming-mars.herokuapp.com/cards#${milestone.milestoneName}`}>{milestone.milestoneName}</a>,
        count: milestone.count,
        percent: percentageWithTwoSigFigs(milestone.count / (gameData?.length ?? 1)),
        mostClaimedBy: `${mostClaimedBy.player} (${mostClaimedBy.count})`,
        mostFundedBy: 'N/A'
      }
    })];

  const milestoneColumns = [
    { header: 'Milestone', key: 'milestone' },
    { header: <>Times<br />Claimed</>, key: 'count' },
    { header: '% of Games', key: 'percent' },
    { header: 'Most Claimed By', key: 'mostClaimedBy' },
  ];

  return <div>
    <h2>Award & Milestone Stats</h2>
    <p>
      <button className={cx(gab.className, {
        "active": showAwards
      })}
        onClick={() => {
          setShowAwards(true)
        }}
      >Awards</button>{" "}
      <button className={cx(gab.className, {
        "active": showAwards === false
      })}
        onClick={() => {
          setShowAwards(false)
        }}
      >Milestones</button>
    </p>
    <TableGrid data={
      {
        columns: showAwards ? awardColumns : milestoneColumns,
        rows: showAwards ? awardRows : milestoneRows,
      }}
    />
  </div>
}