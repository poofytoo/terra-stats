import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { promises as fsPromises } from 'fs';

interface Game {
  dateOfGame?: Date;
  playerCount?: number;
  generations?: number;
  url?: string;
  players?: {
    [name: string]: {
      displayName?: string;
      finalScore?: number;
      terraformingRating?: number;
      milestonePoints?: number;
      awardPoints?: number;
      greeneryPoints?: number;
      cityPoints?: number;
      victoryPoints?: number;
      timer?: {
        minutes?: number;
        seconds?: number;
      };
      actionsTaken?: number;
      corporations?: string[];
    }
  }
}
type processedData = Game[];

async function getAllFilesInFolder(folderPath: string): Promise<string[]> {
  const fullPath = path.join(process.cwd(), folderPath);
  try {
    const fileNames = await fs.readdir(fullPath);
    // Optionally filter the files here if needed
    return fileNames;
  } catch (error) {
    console.error("Error reading directory:", error);
    return [];
  }
}

const normalizedPlayerNames = {
  Victor: ['Victor', 'Vic', 'VicVic'],
  Yota: ['Yota', 'Haircut'],
  Vy: ['Vy'],
  Lindsey: ['Lindsey', 'LinLin', 'Lin'],
  Landon: ['Landon', 'Lando', 'Lan', 'LanLan'],
}

export async function GET(request: Request) {
  const files = await getAllFilesInFolder('data');
  const htmlFiles = files.filter(file => file.endsWith('.html'));
  const processedData: processedData = [];

  for (const file of htmlFiles) {
    const filePath = path.join(process.cwd(), 'data', file);
    const game: Game = {}
    try {
      const fileContent = await fsPromises.readFile(filePath, 'utf-8');

      // grab contents within the table that has a class of "game_end_table"
      const tableRegex = /<table class=".*? game_end_table">(.*?)<\/table>/gs;
      const tableMatch = tableRegex.exec(fileContent);

      // grab content inside tbody
      const tbodyRegex = /<tbody.*?>(.*?)<\/tbody>/gs;
      let tbodyMatch;
      if (tableMatch) {
        tbodyMatch = tbodyRegex.exec(tableMatch[1]);
      }

      // inside this table, ignore the first row (header row). place the rest of the rows into an array.
      const rowRegex = /<tr.*?>(.*?)<\/tr>/gs;
      const rows = [];
      let rowMatch;
      if (tbodyMatch) {
        while ((rowMatch = rowRegex.exec(tbodyMatch[1])) !== null) {

          // for each row, grab the contents of every td and place them into an array.
          const tdRegex = /<td.*?>(.*?)<\/td>/gs;
          const tds = [];
          let tdMatch;
          while ((tdMatch = tdRegex.exec(rowMatch[1])) !== null) {
            tds.push(tdMatch[1]);
          }

          // the first td contains two values, the player name and the corporation they played. use regex to grab them.
          const playerRegex = /<a.*?>(.*?)<\/a>/gs;
          const playerMatch = playerRegex.exec(tds[0]);
          if (playerMatch) {
            const playerName = playerMatch[1];

            // also get the normalized player name based on the normalizedPlayerNames object. if the player name is not in the object, use the original name.
            let normalizedPlayerName = playerName;
            Object.entries(normalizedPlayerNames).forEach(([normalizedName, names]) => {
              if (names.includes(playerName)) {
                normalizedPlayerName = normalizedName;
              }
            });

            // get the corporation name as a list. the format it shows up is: <a href="https://terraforming-mars.herokuapp.com/player?id=pcfc131ecfc01&amp;noredirect">LanLan</a> <div class="column-corporation"><div>Polyphemos</div><div>Point Luna</div><div>Vitor</div></div>. In this case, the list would be: Polyphemos, Point Luna, and Vitor
            const corporationsHtml = tds[0];
            const corporationRegex = /<div>(.*?)<\/div>/gs;
            const corporationList = [];
            let corporationMatch;
            while ((corporationMatch = corporationRegex.exec(corporationsHtml)) !== null) {
              corporationList.push(corporationMatch[1]);
            }

            // if the player name is not in the players object, add it.
            if (!game.players?.[normalizedPlayerName]) {
              game.players = {
                ...game.players,
                [normalizedPlayerName]: {
                  displayName: playerName,
                  finalScore: 0,
                }
              }
            }

            // add the corporation name to the player object.
            game.players[normalizedPlayerName].corporations = corporationList;

            game.players[normalizedPlayerName].milestonePoints = parseInt(tds[2]);

            game.players[normalizedPlayerName].awardPoints = parseInt(tds[3]);

            game.players[normalizedPlayerName].greeneryPoints = parseInt(tds[4]);

            game.players[normalizedPlayerName].cityPoints = parseInt(tds[5]);

            // add the score to the player object.
            game.players[normalizedPlayerName].finalScore = parseInt(tds[7]);

            // add the victory points to the player object.
            game.players[normalizedPlayerName].victoryPoints = parseInt(tds[8].replace(/<\/?div.*?>/g, '').trim());

            // add the score to the player object.
            game.players[normalizedPlayerName].terraformingRating = parseInt(tds[1]);


            // add the timer to the player object. replace any <div> or </div> with a space, and trim the string.
            const timerString = tds[9].replace(/<\/?div.*?>/g, '').trim();
            const minutes = parseInt(timerString.split(':')[0]);
            const seconds = parseInt(timerString.split(':')[1]);
            game.players[normalizedPlayerName].timer = {
              minutes,
              seconds,
            }

            // actions taken
            game.players[normalizedPlayerName].actionsTaken = parseInt(tds[10].replace(/<\/?div.*?>/g, '').trim());

          }

          rows.push(tds);
        }
      }


      // look for a div with the class named log-gen-numbers and get the contents with regex. The contents within that will look something like: <div class="log-gen-indicator">1</div><div class="log-gen-indicator">2</div><div class="log-gen-indicator">3</div>... etc. we want to get the highest number and that will be the generation count.
      const generationRegex = /<div class="log-gen-indicator">(.*?)<\/div>/gs;
      let generationMatch;
      let generationCount = 0;
      while ((generationMatch = generationRegex.exec(fileContent)) !== null) {
        const generation = parseInt(generationMatch[1]);
        if (generation > generationCount) {
          generationCount = generation;
        }
      }
      game.generations = generationCount;

      game.playerCount = Object.keys(game.players ?? {}).length;

      game.url = `file://${filePath}`;

      processedData.push(game);


    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }

  return new Response(JSON.stringify(processedData));
}