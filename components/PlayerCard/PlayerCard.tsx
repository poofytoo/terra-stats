import { PlayerData, TopPerformers } from '@/types';
import styles from './PlayerCard.module.css';

import cx from 'classnames';
import { Icon } from '../Icon';

const streakMessage = (streakAmount: number, mostConsecutiveWins: number) => {
  if (streakAmount === 1) {
    return "1 win";
  }
  return <>
    <strong>{streakAmount} </strong> consecutive wins!
    {streakAmount === mostConsecutiveWins && <span> 🥇</span>}
  </>
}

export const PlayerCard = ({
  player,
  playerData,
  nthPlayer,
  topPerformers,
  streakAmount,
}: {
  player: string,
  playerData: PlayerData,
  nthPlayer: number
  topPerformers: TopPerformers,
  streakAmount: number
}) => {
  const {
    mostActions,
    shortestTimeSeconds,
    fastestWin,
    lowestVpWin,
    highestVp,
    highestTr,
    mostGreeneryPoints,
    mostConsecutiveWins
  } = topPerformers;
  return (
    <div className={styles.playerCard}>
      <div className={cx(styles.player,
        {
          [styles.mostActions]: playerData.actionsTaken === mostActions,
          [styles.shortestTime]: ((playerData.timer.hours) * 60 * 60 + (playerData.timer.minutes) * 60 + (playerData.timer.seconds) === shortestTimeSeconds) && nthPlayer !== 0,
          [styles.fastestWin]: ((playerData.timer.hours) * 60 * 60 + (playerData.timer.minutes) * 60 + (playerData.timer.seconds) === fastestWin) && nthPlayer === 0,
          [styles.highestVp]: playerData.victoryPoints === highestVp,
          [styles.lowestVpWin]: playerData.victoryPoints === lowestVpWin && nthPlayer === 0,
          [styles.highestTr]: playerData.terraformingRating === highestTr,
          [styles.mostGreeneryPoints]: playerData.greeneryPoints === mostGreeneryPoints,
        })}>
        <div className={styles.playerName}>
          {player}
          {nthPlayer === 0 && <span className={styles.winner}> 🏆</span>}
          {player !== playerData.displayName && <span className={styles.displayName}>({playerData.displayName})</span>}
        </div>
        <div className={styles.playerScore}>
          {playerData.finalScore}
          {nthPlayer === 0 && (playerData.aheadBy?.score ?? 0) > 0 && <span className={styles.aheadBy}>
            {playerData.aheadBy?.score}
            {topPerformers.winByBiggestVp === playerData.aheadBy?.score &&
              <span className={styles.marginRecord}>largest margin!</span>}
          </span>}
          {nthPlayer === 0 && (playerData.aheadBy?.score ?? 0) === 0 && <span className={cx(styles.aheadBy, styles.aheadByMegaCredits)}>
            {playerData.aheadBy?.megaCredits}
            {topPerformers.winBySmallestMc === playerData.aheadBy?.megaCredits && <span className={styles.marginRecord}>smallest margin!</span>}
          </span>}
        </div>
        <div className={styles.pointsBreakdown}>
          <span className={styles.victoryPoints}>
            <Icon type="VP" />
            {playerData.victoryPoints}
          </span>{" "}
          <span className={styles.terraformingRating}>
            <Icon type="TR" />
            {playerData.terraformingRating}
          </span>{" "}
          <span className={styles.megaCredits}>
            {playerData.megaCredits}
          </span>
          <span className={styles.greeneryPoints}>
            {playerData.greeneryPoints}
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
          {playerData.vpCards?.filter(vpCard => vpCard.isNotable)
            .sort((a, b) => {
              if (a.isTop && !b.isTop) {
                return -1
              } else if (!a.isTop && b.isTop) {
                return 1
              }
              return b.vp - a.vp
            })
            .map((vpCard, key) => {
              return <div key={key} className={styles.vpCard}>
                <span className={styles.victoryPoints}>
                  {vpCard.vp}
                </span>
                <span className={cx(styles.vpCardName, {
                  [styles.isTop]: vpCard.isTop
                })}>
                  {vpCard.cardName}!
                </span>
                {vpCard.isTop && <span>🥇</span>}
              </div>
            })}
        </div>
      </div>
      {nthPlayer === 0 && streakAmount > 1 && <div className={styles.streakAmount}>{streakMessage(streakAmount, mostConsecutiveWins)}</div>}
    </div>
  )
}