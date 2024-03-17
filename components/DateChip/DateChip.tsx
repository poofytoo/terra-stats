import styles from './DateChip.module.css';

export const DateChip = ({ gameId }: { gameId?: string }) => {
  if (!gameId) {
    return (
      <div className={styles.date}>
        n/a
      </div>
    )
  }

  return (
    <div className={styles.date}>
      {gameId}
    </div>
  )
}