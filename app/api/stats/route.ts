import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { promises as fsPromises } from 'fs';

const notableCollections = [
  "Stratospheric Birds",
  "Venusian Animals",
  "Ants",
  "Venusian Insects",
  "Penguins",
  "Birds",
  "Livestock",
  "Physics Complex",
  "Pets",
  "Fish",
  "Immigration Shuttles",
  "Floating Habs",
  "Tardigrades",
  "Jovian Lanterns",
];

export interface vpCard {
  vp: number;
  cardName: string;
  isNotable?: boolean;
}
export interface Game {
  dateOfGame: Date;
  playerCount?: number;
  generations?: number;
  url?: string;
  fileName: string;
  players: {
    [name: string]: {
      displayName?: string;
      finalScore?: number;
      terraformingRating?: number;
      milestonePoints?: number;
      awardPoints?: number;
      greeneryPoints?: number;
      cityPoints?: number;
      victoryPoints?: number;
      megaCredits?: number;
      timer: {
        minutes: number;
        seconds: number;
        hours: number;
      };
      actionsTaken?: number;
      corporations?: string[];
      vpCards?: vpCard[];
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
  Victor: ['Victor', 'Vic', 'VicVic', 'Victortor'],
  Yota: ['Yota', 'Haircut'],
  Vy: ['Vy', 'Vyvy'],
  Lindsey: ['Lindsey', 'LinLin', 'Lin', 'Lind'],
  Landon: ['Landon', 'Lando', 'Lan', 'LanLan'],
}

export async function GET(request: Request) {
  const files = await getAllFilesInFolder('data');
  const htmlFiles = files.filter(file => file.endsWith('.html'));
  const processedData: processedData = [];

  const notableCollectionRecords = notableCollections.map(collection => {
    return {
      collection,
      vp: 0,
    }
  })

  for (const file of htmlFiles) {
    const filePath = path.join(process.cwd(), 'data', file);
    const dateOfGame = new Date(parseInt(file.split('-')[2]), parseInt(file.split('-')[0]) - 1, parseInt(file.split('-')[1]));
    // add 6 hours to the date because the date is in UTC time and we want it in EST time.
    dateOfGame.setHours(dateOfGame.getHours() + 6);
    const game: Game = {
      dateOfGame,
      fileName: file,
      players: {}
    }

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
              if (names.map(name => name.toLowerCase()).includes(playerName.toLowerCase())) {
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
                  timer: {
                    minutes: 0,
                    seconds: 0,
                    hours: 0,
                  }
                }
              }
            }

            // see if this html "<th data-tooltip="Escape Velocity penalty" class="clock-icon tooltip tooltip-top">⏳</th>" is in the entire html
            const hasEscapeVelocity = fileContent.includes('<th data-tooltip="Escape Velocity penalty" class="clock-icon tooltip tooltip-top">⏳</th>') ? 1 : 0;

            // add the corporation name to the player object.
            game.players[normalizedPlayerName].corporations = corporationList;

            // add the score to the player object.
            game.players[normalizedPlayerName].terraformingRating = parseInt(tds[1]);
            game.players[normalizedPlayerName].milestonePoints = parseInt(tds[2]);
            game.players[normalizedPlayerName].awardPoints = parseInt(tds[3]);
            game.players[normalizedPlayerName].greeneryPoints = parseInt(tds[4]);
            game.players[normalizedPlayerName].cityPoints = parseInt(tds[5]);

            // add the victory points to the player object.
            game.players[normalizedPlayerName].victoryPoints = parseInt(tds[6].replace(/<\/?div.*?>/g, '').trim());
            // add the score to the player object.
            game.players[normalizedPlayerName].finalScore = parseInt(tds[7 + hasEscapeVelocity]);
            // add the score to the player object.
            game.players[normalizedPlayerName].megaCredits = parseInt(tds[8 + hasEscapeVelocity].replace(/<\/?div.*?>/g, '').trim());
            // add the timer to the player object. replace any <div> or </div> with a space, and trim the string.
            const timerString = tds[9 + hasEscapeVelocity].replace(/<\/?div.*?>/g, '').trim();

            // if there are only two colons, then it's in the format of mm:ss. if there are three colons, then it's in the format of hh:mm:ss.
            const colonCount = timerString.split(':').length;
            let hours = 0;
            let minutes = 0;
            let seconds = 0;

            if (colonCount === 2) {
              minutes = parseInt(timerString.split(':')[0]);
              seconds = parseInt(timerString.split(':')[1]);
            } else if (colonCount === 3) {
              hours = parseInt(timerString.split(':')[0]);
              minutes = parseInt(timerString.split(':')[1]);
              seconds = parseInt(timerString.split(':')[2]);
            }

            game.players[normalizedPlayerName].timer = {
              minutes,
              seconds,
              hours,
            }

            // actions taken
            game.players[normalizedPlayerName].actionsTaken = parseInt(tds[10 + hasEscapeVelocity].replace(/<\/?div.*?>/g, '').trim());
          }

          rows.push(tds);
        }
      }

      // look for divs named game-end-column; split the content into sections where that occurs. ignore the first section. within each section, there are multiple instances of two divs, which is always in pairs. one that is game-end-column-vp and one that is game-end-column-text. grab the vp and text and place it into an array. do this for every section
      const splitRegex = /<div class="game-end-column">/gs;
      const splitMatch = fileContent.split(splitRegex);

      // ignore the first section
      const vpSections = splitMatch.slice(1);

      // for each section, grab the vp and text and place it into an array.

      // iterate through each section. for each section, console log the id
      for (const id in vpSections) {
        const section = vpSections[id];

        const vpRegex = /<div class="game-end-column-vp">(.*?)<\/div>/gs;
        const textRegex = /<div class="game-end-column-text">(.*?)<\/div>/gs;
        const vpMatches: string[] = [];
        const textMatches: string[] = [];
        let vpMatch;
        let textMatch;

        while ((vpMatch = vpRegex.exec(section)) !== null) {
          vpMatches.push(vpMatch[1]);
        }
        while ((textMatch = textRegex.exec(section)) !== null) {
          textMatches.push(textMatch[1]);
        }

        const vpCards: vpCard[] = [];

        for (let i = 0; i < vpMatches.length; i++) {
          // ignore white space like &nbsp;
          let cardName = textMatches[i].replace(/<\/?span.*?>/g, '');

          // if the cardname contains the phrase `funded by X`, we want to replace X which is the original player name with the normalized player name.
          const fundedByRegex = /\(funded by (.*?)\)/;
          const fundedByMatch = fundedByRegex.exec(cardName);
          if (fundedByMatch) {
            const originalPlayerName = fundedByMatch[1];
            let normalizedPlayerName = originalPlayerName;
            Object.entries(normalizedPlayerNames).forEach(([normalizedName, names]) => {
              if (names.map(name => name.toLowerCase()).includes(originalPlayerName.toLowerCase())) {
                normalizedPlayerName = normalizedName;
              }
            });
            cardName = cardName.replace(fundedByRegex, `(funded by ${normalizedPlayerName})`);
          }
          // remove double spaces
          cardName = cardName.replace(/  /g, ' ');

          if (textMatches[i].replace(/&nbsp;/g, '') !== '') {
            vpCards.push({
              vp: parseInt(vpMatches[i]),
              cardName
            });
          }
        }

        game.players[Object.keys(game.players)[id]].vpCards = vpCards;
      }

      // look through each player's vp cards. if the card name is in the notableCollections array. if the vp is greater than the existing value in the corresponding notableCollectionRecords array, replace it.

      for (const playerName in game.players) {
        const player = game.players[playerName];
        if (!player.vpCards) {
          continue;
        }
        for (const vpCard of player.vpCards) {
          const notableCollectionRecord = notableCollectionRecords.find(collection => collection.collection === vpCard.cardName);
          if (notableCollectionRecord && vpCard.vp > notableCollectionRecord.vp) {
            notableCollectionRecord.vp = vpCard.vp;
          }
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
      game.generations = generationCount + 1;

      game.playerCount = Object.keys(game.players ?? {}).length;

      game.url = `file://${filePath}`;

      processedData.push(game);


    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }

  // for each game, look through each player's vp cards. if the card name is in the notableCollections array, and if the vp is within 5 of the highest vp in notableCollectionRecords, set isNotable to true.

  for (const game of processedData) {
    for (const playerName in game.players) {
      const player = game.players[playerName];
      if (!player.vpCards) {
        continue;
      }
      for (const vpCard of player.vpCards) {
        const notableCollectionRecord = notableCollectionRecords.find(collection => collection.collection === vpCard.cardName);
        if (notableCollectionRecord && vpCard.vp >= notableCollectionRecord.vp - 5 && vpCard.vp > 5) {
          vpCard.isNotable = true;
        }
      }
    }
  }

  return new Response(JSON.stringify(processedData));
}