import styles from "@/components/NotableCollections/NotableCollections.module.css";
import { Game } from "@/types";
import { formatDate } from "@/utils";
import cx from "classnames";

interface HighestNotableCollections {
  [collection: string]: {
    highest: number;
    dateOfGamePlayed: Date;
    player: string;
  }
}

export const NotableCollections = ({ data }: { data: Game[] }) => {

  const highestNotableCollections: HighestNotableCollections =
    data.reduce((acc, game) => {
      Object.entries(game.players).forEach(([name, player]) => {
        player.vpCards?.forEach(card => {
          if (card.isNotable) {
            if (!acc[card.cardName]) {
              acc[card.cardName] = {
                highest: card.vp,
                player: name,
                dateOfGamePlayed: game.dateOfGame
              }
            } else {
              if (card.vp >= acc[card.cardName].highest && game.dateOfGame < acc[card.cardName].dateOfGamePlayed) {
                acc[card.cardName] = {
                  highest: card.vp,
                  player: name,
                  dateOfGamePlayed: game.dateOfGame
                }
              } 
            }
          }
        })
      })
      return acc;
    }, {} as HighestNotableCollections)

  // sort highestNotable Collections alphabetically by collection name
  const sortedNotableCollections: HighestNotableCollections = {};
  Object.keys(highestNotableCollections).sort().forEach(key => {
    sortedNotableCollections[key] = highestNotableCollections[key];
  });


  return <div className={styles.notableCollectionsContainer}>
    <h2>Notable Collections</h2>
    <div className={styles.notableCollectionsTable}>
      <div className={cx(styles.row, styles.header)}>
        <div className={styles.collectionName}>
          Collection
        </div>
        <div className={styles.record}>
          Record
        </div>
        <div className={styles.holders}>
          Holders
        </div>
        <div className={styles.date}>
          Date
        </div>
      </div>
      {Object.entries(sortedNotableCollections).map(([collectionName, collectionData], i) => {
        return <div className={styles.row} key={i}>
          <div className={styles.collectionName}>
            {collectionName}
          </div>
          <div className={styles.record}>
            {collectionData.highest}
          </div>
          <div className={styles.holders}>
            {collectionData.player}
          </div>
          <div className={styles.date}>
            {formatDate(collectionData.dateOfGamePlayed)}
          </div>
        </div>
      })}
    </div>
  </div>
}