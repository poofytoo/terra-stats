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
import { GameRecords } from '@/components/GameRecords';
import { NumberOfCorps } from '@/components/NumberOfCorps';
import { AwardStats } from '@/components/AwardStats';
import { MatchUps } from '@/components/MatchUps';
import Head from 'next/head';

const Home = () => {
  const { gameData } = useContext(GameDataContext);

  if (!gameData) {
    return <div className={cx(styles.loading, gab.className)}>
      <h1><a href="/">Terra Stats!</a></h1>
      <p>Loading...</p>
    </div>
  }

  gameData?.forEach((game: Game) => {
    game.dateOfGame = new Date(game.dateOfGame);
  });

  return (
    <div>
      <Head>
        <link rel="shortcut icon" href="/images/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon.svg" />
        <link rel="icon" type="image/svg" sizes="32x32" href="/images/favicon.svg" />
        <link rel="icon" type="image/svg" sizes="16x16" href="/images/favicon.svg" />
      </Head>
      <div className={cx(styles.mainPageGrid, gab.className)}>
        <div className={cx(styles.title)}>
          <h1><a href="/">Terra Stats!</a></h1>
        </div>
        <div className={cx(styles.cell, styles.players)}><Players /></div>
        <div className={cx(styles.cell, styles.gameRecords)}><GameRecords /></div>
        <div className={cx(styles.cell, styles.numberOfCorporations)}><NumberOfCorps /></div>
        <div className={cx(styles.cell, styles.awardStats)}><AwardStats /></div>
        <div className={cx(styles.cell, styles.corporations)}><Corporations /></div>
        <div className={cx(styles.cell, styles.notableCollections)}><NotableCollections />
        </div>
        <div className={styles.matchUps}>
          <MatchUps />
        </div>
        <div className={styles.allLoggedGames}>
          <h2 className={styles.h2WithPadding}>All Logged Games <span className="dem">({gameData.length})</span></h2>
          <AllGames />
        </div>
      </div>
    </div >
  );
}

export default Home;