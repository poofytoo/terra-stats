'use client';

import { useEffect, useState } from 'react';
import { wordList } from './wordlist';

const Page = () => {
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [isWordVisible, setIsWordVisible] = useState<boolean>(false);

  const getRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    return wordList[randomIndex];
  };

  const handleNewGame = () => {
    setCurrentWord(getRandomWord());
    setIsWordVisible(false);
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // detect s key
      if (e.code === 'KeyN') {
        if (currentWord === null) {
          setCurrentWord(getRandomWord());
          setIsWordVisible(true);
        } else {
          setIsWordVisible(!isWordVisible);
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    }
  }
    , [currentWord, isWordVisible]);

  return (
    <div
      tabIndex={0}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}
    >
      {isWordVisible && currentWord && <h1>{currentWord}</h1>}
      <button onClick={handleNewGame}>New Game</button>
    </div>
  );
};

export default Page;
