import { Game } from '@/types';
import { useState, createContext, ReactNode, Dispatch, SetStateAction } from 'react';

// Define a context value type that includes both gameData and setGameData
interface GameDataContextType {
  gameData: Game[] | undefined;
  setGameData: Dispatch<SetStateAction<Game[] | undefined>>;
}

// Step 1: Create a Context with the correct type
const GameDataContext = createContext<GameDataContextType | undefined>(undefined);

// Step 2: Create a Provider Component
const GameDataProvider = ({ children }: { children: ReactNode }) => {
  const [gameData, setGameData] = useState<Game[] | undefined>();

  // Ensure to pass an object matching GameDataContextType
  const value = { gameData, setGameData };

  return (
    <GameDataContext.Provider value={value}>
      {children}
    </GameDataContext.Provider>
  );
}

export { GameDataContext, GameDataProvider };


// import { createContext, useContext, ReactNode, useState } from 'react';

// // Define the type for your context state
// type Theme = 'light' | 'dark';

// // Define the type for your context value
// interface ThemeContextType {
//   theme: Theme;
//   toggleTheme: () => void;
// }

// // Create the context with a default value
// const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// // Define a provider component
// export const ThemeProvider = ({ children }: { children: ReactNode }) => {
//   const [theme, setTheme] = useState<Theme>('light');

//   const toggleTheme = () => {
//     setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
//   };

//   return (
//     <ThemeContext.Provider value={{ theme, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// // Custom hook to use the context
// export const useTheme = () => {
//   const context = useContext(ThemeContext);
//   if (context === undefined) {
//     throw new Error('useTheme must be used within a ThemeProvider');
//   }
//   return context;
// };
// Step 2: Wrap Your Application with the Provider
// Next, you need to wrap your Next.js application with the ThemeProvider you created. This is typically done in the _app.tsx file.

// pages/_app.tsx:

// tsx
// Copy code
// import type { AppProps } from 'next/app';
// import { ThemeProvider } from '../contexts/ThemeContext';

// function MyApp({ Component, pageProps }: AppProps) {
//   return (
//     <ThemeProvider>
//       <Component {...pageProps} />
//     </ThemeProvider>
//   );
// }

// export default MyApp;
// Step 3: Use the Context in Your Components
// Now, you can use the useTheme hook in any of your components to access or modify the theme.

// ExampleComponent.tsx:

// tsx
// Copy code
// import { useTheme } from '../contexts/ThemeContext';

// const ExampleComponent = () => {
//   const { theme, toggleTheme } = useTheme();

//   return (
//     <div>
//       <p>Current theme is {theme}.</p>
//       <button onClick={toggleTheme}>Toggle Theme</button>
//     </div>
//   );
// };

// export default ExampleComponent;