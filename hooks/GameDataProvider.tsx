"use client"

import { Game } from '@/types';
import { useState, createContext, ReactNode, Dispatch, SetStateAction, useEffect, useCallback } from 'react';
import useSWR from 'swr';

interface GameDataContextType {
  gameData: Game[] | undefined;
  setGameData: Dispatch<SetStateAction<Game[] | undefined>>;
  setHighlightedGameId: Dispatch<SetStateAction<string | undefined>>;
  getGameById: (id: string) => Game | undefined;
  gamesMetaData: any;
  highlightedGameId?: string;
}

const defaultState: GameDataContextType = {
  gameData: undefined,
  gamesMetaData: {},
  setGameData: () => { },
  setHighlightedGameId: () => { },
  getGameById: () => undefined,
  highlightedGameId: undefined
};

const GameDataContext = createContext<GameDataContextType>(defaultState);

const GameDataProvider = ({ children }: { children: ReactNode }) => {
  const [gameData, setGameData] = useState<Game[] | undefined>();

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  let { data, error } = useSWR('/api/stats', fetcher);

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

  const lowestVp = gameData?.reduce((acc: {
    player: string | undefined,
    vp: number,
    game: Game | undefined
  }, game: Game) => {
    const players = Object.keys(game.players);
    const winner = game.players[players[0]];
    const score = winner.victoryPoints ?? Infinity;
    if (score < acc.vp) {
      return {
        player: players[0],
        vp: score,
        game
      }
    }
    return acc;
  }, {
    player: undefined,
    vp: Infinity,
    game: undefined
  });

  const highestVp = gameData?.reduce((acc: {
    player: string | undefined,
    vp: number,
    game: Game | undefined
  }, game: Game) => {
    const players = Object.keys(game.players);
    const winner = game.players[players[0]];
    const score = winner.victoryPoints ?? 0;
    if (score > acc.vp) {
      return {
        player: players[0],
        vp: score,
        game
      }
    }
    return acc;
  }, {
    player: undefined,
    vp: 0,
    game: undefined
  });

  const gamesMetaData = {
    totalGames: gameData?.length,
    lowestVp,
    highestVp
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
