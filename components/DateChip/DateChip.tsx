import styles from './DateChip.module.css';
import cx from 'classnames';

import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { GameDataContext } from '@/hooks/GameDataProvider';
import { formatDate } from '@/libs/util';

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

  return (
    <div className={styles.date} onClick={() => {
      if (gameData) {
        setHighlightedGameId(gameData.id);
        router.push(`/#${gameData.id}`)
      }
    }}>
      {formatDate(gameData?.dateOfGame)}
    </div>
  )
}