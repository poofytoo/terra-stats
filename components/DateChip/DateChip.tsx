import styles from './DateChip.module.css';
import cx from 'classnames';

import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { GameDataContext } from '@/hooks/GameDataProvider';
import { formatDate } from '@/libs/util';

const daysThresholdForRecent = 3;

export const DateChip = ({ gameId }: { gameId?: string }) => {
  const router = useRouter();
  const { getGameById, setHighlightedGameId, highlightedGameId } = useContext(GameDataContext);

  if (!gameId) {
    return (
      <div className={cx(styles.date, styles.disabled)}>
        n/a
      </div>
    )
  }

  const gameData = getGameById(gameId);
  const recent = (gameData?.dateOfGame ?? new Date()) > new Date(Date.now() - 1000 * 60 * 60 * 24 * daysThresholdForRecent);

  return (
    <div className={cx(styles.date, { [styles.recent]: recent })} onClick={() => {
      if (gameData) {
        setHighlightedGameId(gameData.id);
        router.push(`/#${gameData.id}`)
      }
    }}>
      {formatDate(gameData?.dateOfGame)}
    </div>
  )
}