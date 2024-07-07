import { GameDataContext } from "@/hooks/GameDataProvider";
import { useContext } from "react";
import { DateChip } from "../DateChip/DateChip";
import TableGrid from "../TableGrid/TableGrid";

const GameRecords = () => {
  const { gamesMetaData } = useContext(GameDataContext);

  console.log(gamesMetaData);

  return <div>
    <h2>Game Records</h2>
    <p>Coming soon...</p>
    <TableGrid data={
      {
        columns: [
          { header: 'Metric', key: 'metric' },
          { header: 'Value', key: 'value' },
          { header: 'Player', key: 'player' },
          { header: 'Date', key: 'date' },
        ],
        rows:
          [
            {
              metric: 'Lowest VP Win',
              value: gamesMetaData.lowestVp.vp,
              player: gamesMetaData.lowestVp.player,
              date:
                <DateChip gameId={gamesMetaData.lowestVp.game.id} />
            }
          ]
      }
    } />
  </div>
}

export default GameRecords;