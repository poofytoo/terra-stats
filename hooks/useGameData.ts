import { Game } from '@/types';
import { formatDate } from '@/utils';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';

export interface UseGameData {
  data: Game[] | undefined;
  error: Error | undefined;
  isLoading: boolean;
  getGameById: (id: string) => Game;
  setHighlightedGameId: (id?: string) => void;
  highlightedGameId?: string;
}

export function useGameData(): UseGameData {
  const [highlightedGameId, setHighlightedGameId] = useState<string>();

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  let { data, error } = useSWR('/api/stats', fetcher);

  const getGameById = useCallback((id: string) => {
    return data?.find((game: Game) => game.id === id);
  }, [data]);

  useEffect(() => {
    if (highlightedGameId) {
      const game = getGameById(highlightedGameId);
      if (game) {
        document.title = `Terra-Stats! - ${formatDate(game.dateOfGame)}`;
        const rows = document.querySelectorAll('.gameRow');
        rows.forEach((row) => {
          if (row.id === game.id) {
            row.classList.add('highlightedRow');
          } else {
            row.classList.remove('highlightedRow');
          }
        });
      }
    }
  }, [highlightedGameId, data, getGameById]);

  return {
    getGameById,
    setHighlightedGameId,
    highlightedGameId,
    data,
    error,
    isLoading: !error && !data,
  };
}
