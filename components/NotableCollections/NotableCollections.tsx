import React, { useContext } from 'react';
import styles from '@/components/NotableCollections/NotableCollections.module.css'; // Ensure this path is correct
import { GameDataContext } from '@/hooks/GameDataProvider'; // Ensure this path is correct
import { DateChip } from '../DateChip/DateChip'; // Ensure this path is correct
import TableGrid, { TableData, TableColumn } from '../TableGrid/TableGrid'; // Ensure this path is correct

interface HighestNotableCollections {
  [collection: string]: {
    highest: number;
    dateOfGamePlayed: Date;
    gameId: string;
    player: string;
  }
}

const convertCollectionsToTableData = (collections: HighestNotableCollections): TableData => {
  const columns: TableColumn[] = [
    {
      header: 'Collection',
      key: 'collection',
      className: styles.collectionName,
      shrinkable: true
    },
    { header: 'Record', key: 'record' },
    { header: 'Holder', key: 'holder' },
    { header: 'Date', key: 'date' },
  ];

  const rows = Object.entries(collections).sort(([a], [b]) => a.localeCompare(b)).map(([collectionName, collectionData]) => ({
    collection: collectionName,
    record: collectionData.highest,
    holder: collectionData.player,
    date: <DateChip gameId={collectionData.gameId} />,
  }));

  return { columns, rows };
};

export const NotableCollections: React.FC = () => {
  const { gameData } = useContext(GameDataContext);

  const highestNotableCollections = gameData?.reduce((acc, game) => {
    Object.entries(game.players).forEach(([name, playerData]) => {
      playerData.vpCards?.forEach(card => {
        if (card.isNotable) {
          if (!acc[card.cardName]) {
            acc[card.cardName] = {
              highest: card.vp,
              player: name,
              gameId: game.id ?? "",
              dateOfGamePlayed: game.dateOfGame
            };
          }

          if (card.vp > acc[card.cardName].highest) {
            acc[card.cardName] = {
              highest: card.vp,
              player: name,
              gameId: game.id ?? "",
              dateOfGamePlayed: game.dateOfGame
            };
          }
        }
      });
    });
    return acc;
  }, {} as HighestNotableCollections);

  // sort highestNotable Collections alphabetically by collection name
  const sortedNotableCollections: HighestNotableCollections = {};

  if (highestNotableCollections) {
    Object.keys(highestNotableCollections).sort().forEach(key => {
      sortedNotableCollections[key] = highestNotableCollections[key];
    });
  }

  const tableData = convertCollectionsToTableData(sortedNotableCollections);

  return (
    <div className={styles.notableCollectionsContainer}>
      <h2>Notable Collections</h2>
      <TableGrid data={tableData} tableId='notableCollections' />
    </div>
  );
};

export default NotableCollections;
