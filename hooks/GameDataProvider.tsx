"use client"

import { Icon } from '@/components/Icon';
import { Game } from '@/types';
import { useState, createContext, ReactNode, Dispatch, SetStateAction, useEffect, useCallback } from 'react';
import useSWR from 'swr';

interface GameRecord {
  metricName: string | JSX.Element;
  value: number;
  player?: string;
  game?: Game;
}

interface GamesMetaData {
  totalGames: number;
  gameRecords: {
    [metric: string]: GameRecord
  }
}

interface GameDataContextType {
  gameData: Game[] | undefined;
  setGameData: Dispatch<SetStateAction<Game[] | undefined>>;
  setHighlightedGameId: Dispatch<SetStateAction<string | undefined>>;
  getGameById: (id: string) => Game | undefined;
  gamesMetaData: GamesMetaData
  highlightedGameId?: string;
}

const defaultState: GameDataContextType = {
  gameData: undefined,
  gamesMetaData: {
    totalGames: 0,
    gameRecords: {}
  },
  setGameData: () => { },
  setHighlightedGameId: () => { },
  getGameById: () => undefined,
  highlightedGameId: undefined
};

const GameDataContext = createContext<GameDataContextType>(defaultState);

const GameDataProvider = ({ children }: { children: ReactNode }) => {
  const [gameData, setGameData] = useState<Game[] | undefined>();

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  let { data } = useSWR('/api/stats', fetcher);

  const getGameById = useCallback((id: string) => {
    return data?.find((game: Game) => game.id === id);
  }, [data]);

  const [highlightedGameId, setHighlightedGameId] = useState<string>();

  useEffect(() => {
    if (data) {
      setGameData(data);

      // if there is a hash, try to find the game. then scroll to it.
      if (window.location.hash) {
        const hash = window.location.hash.replace('#', '');
        const game = getGameById(hash);
        if (game) {
          setHighlightedGameId(game.id);
          setTimeout(() => {
            const el = document.getElementById(hash);
            if (el) {
              el.scrollIntoView();
            }
          }, 200);
        }
      }
    }
  }, [data, getGameById]);

  const lowestVp: GameRecord | undefined = gameData?.reduce((acc: GameRecord, game: Game) => {
    const players = Object.keys(game.players);
    const winner = game.players[players[0]];
    const score = winner.victoryPoints ?? Infinity;
    if (score < acc.value) {
      return {
        metricName: <>Lowest <Icon type="VP" /> Win</>,
        player: players[0],
        value: score,
        game
      }
    }
    return acc;
  }, {
    metricName: <>Lowest <Icon type="VP" /> Win</>,
    player: undefined,
    value: Infinity,
    game: undefined
  });

  const highestVp: GameRecord | undefined = gameData?.reduce((acc: GameRecord, game: Game) => {
    const players = Object.keys(game.players);
    const winner = game.players[players[0]];
    const score = winner.victoryPoints ?? 0;
    if (score > acc.value) {
      return {
        metricName: <>Highest <Icon type="VP" /> Win</>,
        player: players[0],
        value: score,
        game
      }
    }
    return acc;
  }, {
    metricName: <>Highest <Icon type="VP" /> Win</>,
    player: undefined,
    value: 0,
    game: undefined
  });

  const lowestTr: GameRecord | undefined = gameData?.reduce((acc: GameRecord, game: Game) => {
    const players = Object.keys(game.players);
    const winner = game.players[players[0]];
    const tr = winner.terraformingRating ?? Infinity;
    if (tr < acc.value) {
      return {
        metricName: <>Lowest <Icon type="TR" /> Win</>,
        player: players[0],
        value: tr,
        game
      }
    }
    return acc;
  }, {
    metricName: <>Lowest <Icon type="TR" /> Win</>,
    player: undefined,
    value: Infinity,
    game: undefined
  });

  const highestTr: GameRecord | undefined = gameData?.reduce((acc: GameRecord, game: Game) => {
    const players = Object.keys(game.players);
    const winner = game.players[players[0]];
    const tr = winner.terraformingRating ?? 0;
    if (tr > acc.value) {
      return {
        metricName: <>Highest <Icon type="TR" /> Win</>,
        player: players[0],
        value: tr,
        game
      }
    }
    return acc;
  }, {
    metricName: <>Highest <Icon type="TR" /> Win</>,
    player: undefined,
    value: 0,
    game: undefined
  });

  const highestScore: GameRecord | undefined = gameData?.reduce((acc: GameRecord, game: Game) => {
    const players = Object.keys(game.players);
    const winner = game.players[players[0]];
    const score = winner.finalScore;
    if (score > acc.value) {
      return {
        metricName: <>Highest Score Win</>,
        player: players[0],
        value: score,
        game
      }
    }
    return acc;
  }, {
    metricName: <>Highest Score Win</>,
    player: undefined,
    value: 0,
    game: undefined
  });

  const lowestScore: GameRecord | undefined = gameData?.reduce((acc: GameRecord, game: Game) => {
    const players = Object.keys(game.players);
    const winner = game.players[players[0]];
    const score = winner.finalScore;
    if (score < acc.value) {
      return {
        metricName: <>Lowest Score Win</>,
        player: players[0],
        value: score,
        game
      }
    }
    return acc;
  }, {
    metricName: <>Lowest Score Win</>,
    player: undefined,
    value: Infinity,
    game: undefined
  });

  const gamesMetaData: GamesMetaData = {
    totalGames: gameData?.length ?? 0,
    gameRecords: {
      ...highestScore && { highestScore },
      ...lowestScore && { lowestScore },
      ...highestVp && { highestVp },
      ...lowestVp && { lowestVp },
      ...highestTr && { highestTr },
      ...lowestTr && { lowestTr },
    }
  }

  return (
    <GameDataContext.Provider value={{
      gameData,
      gamesMetaData,
      setGameData,
      setHighlightedGameId,
      highlightedGameId,
      getGameById
    }}>
      {children}
    </GameDataContext.Provider>
  );
}

export { GameDataContext, GameDataProvider };
