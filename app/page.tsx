"use client";

import React, { useContext } from 'react';

import { Game } from '@/types';

import styles from './page.module.css';
import cx from 'classnames';

import { gab } from '@/libs/util';

import { Corporations } from '@/components/Corporations';
import { Players } from '@/components/Players';
import { NotableCollections } from '@/components/NotableCollections';
import { AllGames } from '@/components/AllGames';
import { GameDataContext } from '@/hooks/GameDataProvider';
import GameRecords from '@/components/GameRecords/GameRecords';

const Home = () => {
  const { gameData } = useContext(GameDataContext);


  if (!gameData) {
    return <div className={cx(gab.className)}>
      <div className={cx(styles.fullWidth, styles.title)}>
        <h1>Terra-Stats!</h1>
      </div>
      <div className={styles.fullWidth}>
        <h2>Loading...</h2>
      </div>
    </div>;
  }

  gameData?.forEach((game: Game) => {
    game.dateOfGame = new Date(game.dateOfGame);
  });

  return (
    <div>
      <div className={cx(styles.mainPageGrid, gab.className)}>
        <div className={cx(styles.fullWidth, styles.title)}>
          <h1>Terra-Stats!</h1>
        </div>
        <div className={cx(styles.cell, styles.players)}><Players /></div>
        <div className={cx(styles.cell, styles.gameRecords)}><GameRecords /></div>
        <div className={cx(styles.cell, styles.corporations)}><Corporations /></div>
        <div className={cx(styles.cell, styles.notableCollections)}><NotableCollections />
        </div>
        <div className={styles.allLoggedGames}>
          <h2>All Logged Games <span className="dem">({gameData.length})</span></h2>
          <AllGames />
        </div>
      </div>
    </div >
  );
}

export default Home;