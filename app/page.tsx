"use client";

import useSWR from 'swr';
import { Game } from './api/stats/route';

import styles from './page.module.css';
import cx from 'classnames';

import { Corporations } from '@/components/Corporations';
import { Players } from '@/components/Players';

const Home = () => {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, error } = useSWR('/api/stats', fetcher);

  if (error) {
    return <div>Error loading data</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  let mostActions = 0;
  let shortestTimeSeconds = Number.MAX_SAFE_INTEGER;
  let fastestWin = Number.MAX_SAFE_INTEGER;
  let highestVp = 0;
  let highestTr = 0;

  data?.forEach((game: Game) => {
    const winner = Object.entries(game.players)[0][1];
    const timeInSeconds = (winner.timer.hours) * 60 * 60 + (winner.timer.minutes) * 60 + (winner.timer.seconds);
    if (timeInSeconds < fastestWin) {
      fastestWin = timeInSeconds;
    }
    Object.entries(game.players ?? {}).forEach(([_, playerData]) => {
      const playerTimeInSeconds = (playerData.timer.hours) * 60 * 60 + (playerData.timer.minutes) * 60 + (playerData.timer.seconds);
      if (playerTimeInSeconds < shortestTimeSeconds) {
        shortestTimeSeconds = playerTimeInSeconds;
      }
      if (playerData.victoryPoints && (playerData.victoryPoints ?? 0) > highestVp) {
        highestVp = playerData.victoryPoints;
      }
      if (playerData.terraformingRating && (playerData.terraformingRating ?? 0) > highestTr) {
        highestTr = playerData.terraformingRating;
      }
      if (playerData.actionsTaken && (playerData.actionsTaken ?? 0) > mostActions) {
        mostActions = playerData.actionsTaken;
      }
    });
  });

  return (
    <div>
      <h1>Terra-Stats!</h1>
      <div className={styles.columns}>
        <Players data={data} />
        <Corporations data={data} />
      </div>
      <h2>All Games ({data.length})</h2>
      <div className={styles.allDataContainer}>
        <div className={styles.allDataContainer}>
          {data?.sort((a: Game, b: Game) => {
            // if dates are the same, sort by filename
            if (new Date(b.dateOfGame).getTime() === new Date(a.dateOfGame).getTime()) {
              return (b.fileName.split("-")[3] ?? "0").localeCompare(a.fileName.split("-")[3] ?? "0");
            }

            // sort by date
            return new Date(b.dateOfGame).getTime() - new Date(a.dateOfGame).getTime();
          }).
            map((game: Game, id: number) => {
              const date = new Date(game.dateOfGame);
              const dateOfGame = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

              return <>
                <div className={styles.dateOfGame}>
                  <span>{dateOfGame}</span>
                  <span className={styles.generations}>{game.generations} generations</span>
                </div>
                <div key={id} className={styles.playerRow}>{
                  Object.entries(game.players ?? {}).map(([player, playerData], playerId) => (
                    <div key={playerId} className={cx(styles.player,
                      {
                        [styles.mostActions]: playerData.actionsTaken === mostActions,
                        [styles.shortestTime]: ((playerData.timer.hours) * 60 * 60 + (playerData.timer.minutes) * 60 + (playerData.timer.seconds) === shortestTimeSeconds) && playerId !== 0,
                        [styles.fastestWin]: ((playerData.timer.hours) * 60 * 60 + (playerData.timer.minutes) * 60 + (playerData.timer.seconds) === fastestWin) && playerId === 0,
                        [styles.highestVp]: playerData.victoryPoints === highestVp,
                        [styles.highestTr]: playerData.terraformingRating === highestTr,
                      })}>
                      <div className={styles.playerName}>
                        {player}
                        {playerId === 0 && <span className={styles.winner}> 🏆</span>}
                      </div>
                      <div className={styles.playerScore}>{playerData.finalScore}</div>
                      <div className={styles.pointsBreakdown}>
                        <span className={styles.victoryPoints}>
                          {playerData.victoryPoints}
                        </span>{" "}
                        <span className={styles.terraformingRating}>
                          {playerData.terraformingRating}
                        </span>{" "}
                        <span className={styles.megaCredits}>
                          {playerData.megaCredits}
                        </span>
                      </div>
                      <div className={styles.details}>
                        <span title="actions">
                          <span className={styles.subtle}>➡️&nbsp;</span>
                          {playerData.actionsTaken}
                        </span>{" "}
                        <span title="time taken">
                          <span className={styles.subtle}>⏱️&nbsp;</span>
                          {playerData.timer.hours ? `${playerData.timer.hours}:` : ""}
                          {playerData.timer?.minutes.toString().padStart(2, "0")}:{(playerData.timer?.seconds).toString().padStart(2, "0")}
                        </span>
                      </div>
                      <div className={styles.playerCorporation}>
                        {playerData.corporations?.map((corporation) => {
                          return <div key={corporation} className={
                            cx({
                              [styles.subtle]: playerData.corporations?.[0] !== corporation,
                            })
                          }>{corporation}</div>
                        })}
                      </div>
                      <div className={styles.notableCollections}>
                        {playerData.vpCards?.filter(vpCard => vpCard.isNotable).map((vpCard, key) => {
                          return <div key={key} className={styles.vpCard}>
                            <span className={styles.victoryPoints}>
                              {vpCard.vp}
                            </span>
                            <span className={styles.vpCardName}>
                              {vpCard.cardName}!
                            </span>
                          </div>
                        })}
                      </div>
                    </div>
                  ))
                }
                </div>
              </>
            })}
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: `` }}>

      </div>
    </div>
  );
}

export default Home;