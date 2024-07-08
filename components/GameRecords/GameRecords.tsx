import { GameDataContext } from "@/hooks/GameDataProvider";
import { useContext } from "react";
import { DateChip } from "../DateChip/DateChip";
import TableGrid from "../TableGrid/TableGrid";

const GameRecords = () => {
  const { gamesMetaData } = useContext(GameDataContext);

  return <div>
    <h2>Game Records</h2>
    <p>Coming soon...</p>
    <TableGrid data={
      {
        columns: [
          { header: 'Metric', key: 'metricName' },
          { header: 'Value', key: 'value' },
          { header: 'Player', key: 'player' },
          { header: 'Date', key: 'date' },
        ],
        rows:
          [
            ...Object.entries(gamesMetaData.gameRecords).map((
              [_, record]
            ) => ({
              metricName: record.metricName,
              value: <strong>{record.value}</strong>,
              player: record.player,
              date: <DateChip gameId={record.game?.id} />
            }))
          ]
      }
    } />
  </div>
}

export default GameRecords;