"use client";

import useSWR from 'swr';
import { Game } from '@/types';

import styles from './page.module.css';
import cx from 'classnames';

import { Corporations } from '@/components/Corporations';
import { Players } from '@/components/Players';
import { NotableCollections } from '@/components/NotableCollections';
import { PlayerCard } from '@/components/PlayerCard';
import React from 'react';
import { formatDate } from '@/utils';
import { AllGames } from '@/components/AllGames';

const Home = () => {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, error } = useSWR('/api/stats', fetcher);

  if (error) {
    return <div>Error loading data</div>;
  }

  if (!data) {
    return <div className={styles.mainPageGrid}>
      <div className={cx(styles.fullWidth, styles.title)}>
        <h1>Terra-Stats!</h1>
      </div>
      <div className={styles.fullWidth}>
        <h2>Loading...</h2>
      </div>
    </div>;
  } 

  data?.forEach((game: Game) => {
    game.dateOfGame = new Date(game.dateOfGame);
  });

  return (
    <div>
      <div className={styles.mainPageGrid}>
        <div className={cx(styles.fullWidth, styles.title)}>
          <h1>Terra-Stats!</h1>
        </div>
        <div><Players data={data} /></div>
        <div><Corporations data={data} /></div>
        <div><NotableCollections data={data} /></div>
        <div className={styles.fullWidth}>
          <h2>All Games</h2>
          <AllGames data={data} />
        </div>
      </div>
    </div>
  );
}

export default Home;