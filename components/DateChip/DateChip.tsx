import { useGameData } from '@/hooks/useGameData';
import styles from './DateChip.module.css';
import { formatDate } from '@/utils';
import { useRouter } from 'next/navigation';

export const DateChip = ({ gameId }: { gameId?: string }) => {
  const { getGameById, setHighlightedGameId } = useGameData();
  const router = useRouter();

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
      {formatDate(gameData.dateOfGame)}
    </div>
  )
}