import styles from './DateChip.module.css';

import { formatDate } from '@/utils';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { GameDataContext } from '@/hooks/GameDataProvider';

export const DateChip = ({ gameId }: { gameId?: string }) => {
  const router = useRouter();
  const { getGameById, setHighlightedGameId, highlightedGameId } = useContext(GameDataContext);

  if (!gameId) {
    return (
      <div className={styles.date}>
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