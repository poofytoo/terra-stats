import styles from "@/components/NotableCollections/NotableCollections.module.css";
import { GameDataContext } from "@/hooks/GameDataProvider";
import { Game } from "@/types";
import { formatDate } from "@/utils";
import cx from "classnames";
import { useContext } from "react";
import { DateChip } from "../DateChip/DateChip";

interface HighestNotableCollections {
  [collection: string]: {
    highest: number;
    dateOfGamePlayed: Date;
    gameId: string;
    player: string;
  }
}

export const NotableCollections = () => {
  const { gameData } = useContext(GameDataContext);

  const highestNotableCollections =
    gameData?.reduce((acc, game) => {
      Object.entries(game.players).forEach(([name, playerData]) => {
        playerData.vpCards?.forEach(card => {
          if (card.isNotable) {
            if (!acc[card.cardName]) {
              acc[card.cardName] = {
                highest: card.vp,
                player: name,
                gameId: game.id ?? "",
                dateOfGamePlayed: game.dateOfGame
              }
            }

            if (card.vp > acc[card.cardName].highest) {
              acc[card.cardName] = {
                highest: card.vp,
                player: name,
                gameId: game.id ?? "",
                dateOfGamePlayed: game.dateOfGame
              }
            }
          }
        })
      })
      return acc;
    }, {} as HighestNotableCollections)

  // sort highestNotable Collections alphabetically by collection name
  const sortedNotableCollections: HighestNotableCollections = {};

  if (highestNotableCollections) {
    Object.keys(highestNotableCollections).sort().forEach(key => {
      sortedNotableCollections[key] = highestNotableCollections[key];
    });
  }

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
          Holder
        </div>
        <div>
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
          <div>
            <div className="date">
              <DateChip gameId={collectionData.gameId} />
            </div>
          </div>
        </div>
      })}
    </div>
  </div>
}