
import path from 'path';
import fs from 'fs/promises';

import { promises as fsPromises } from 'fs';
import { Award, Game, Milestone, processedData, vpCard, vpCardType } from '@/types';
import { getAllFilesInFolder, normalizedPlayerNames, notableCollections } from '@/libs/util';

function extractMilestone(text: string, gameId: string): Milestone {
  const regex = /Claimed (.+?) milestone/;
  const match = text.match(regex);

  if (match && match.length === 2) {
    return { name: match[1], points: 5, gameId }; // Returns the captured milestone text
  } else {
    return { name: "", points: 0, gameId }; // Returns null if no match found
  }
}

function extractAwardDetails(text: string): Award | null {
  const regex = /(\d+)(?:st|nd|rd|th) place for (.+?) award \(funded by (.+?)\)/;
  const match = text.match(regex);

  if (match && match.length === 4) {
    const place = parseInt(match[1], 10);
    const award = match[2]?.trim() || ""; // Use optional chaining and fallback to null;
    const fundedBy = match[3]?.trim() || ""; // Use optional chaining and fallback to null

    if (fundedBy === "") console.log(text);

    return { place, name: award, points: place === 1 ? 5 : 2 };
  } else {
    return null;
  }
}

export async function GET(request: Request) {
  const files = await getAllFilesInFolder(fs, 'data');
  const htmlFiles = files.filter(file => file.endsWith('.html') || file.endsWith('.htm'));
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
      id: "",
      dateOfGame,
      streakCount: 0,

      fileName: file,
      players: {}
    }

    try {
      const fileContent = await fsPromises.readFile(filePath, 'utf-8');

      // see if this html "<th data-tooltip="Escape Velocity penalty" class="clock-icon tooltip tooltip-top">⏳</th>" is in the entire html
      const hasEscapeVelocity = fileContent.includes('<th data-tooltip="Escape Velocity penalty" class="clock-icon tooltip tooltip-top">⏳</th>') ? 1 : 0;

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
                  megaCredits: 0,
                  gamePlace: 0,
                  timer: {
                    minutes: 0,
                    seconds: 0,
                    hours: 0,
                  }
                }
              }
            }

            game.players[normalizedPlayerName].corporations = corporationList;
            game.players[normalizedPlayerName].terraformingRating = parseInt(tds[1]);
            // temporarily remove this as it's inaccurate
            // game.players[normalizedPlayerName].milestonePoints = parseInt(tds[2]);
            // game.players[normalizedPlayerName].awardPoints = parseInt(tds[3]);
            game.players[normalizedPlayerName].greeneryPoints = parseInt(tds[4]);
            game.players[normalizedPlayerName].cityPoints = parseInt(tds[5]);
            game.players[normalizedPlayerName].victoryPoints = parseInt(tds[6].replace(/<\/?div.*?>/g, '').trim());
            game.players[normalizedPlayerName].finalScore = parseInt(tds[7 + hasEscapeVelocity]);
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

            // search for this: <a href="api/game/logs?id=p7955b5d5891&amp;full=true" target="_blank">Download game log</a> and extract the ID, in this case it's p7955b5d5891
            const logIdRegex = /logs\?id=(.*?)&amp;full=true"/;
            const logIdMatch = logIdRegex.exec(fileContent);
            if (logIdMatch) {
              game.id = logIdMatch[1];
            }
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
        const awards: Award[] = [];
        const milestones: Milestone[] = []

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

          if (cardName.indexOf('funded') > -1) {
            const award = extractAwardDetails(cardName);
            if (extractAwardDetails(cardName)) {
              awards.push(award as Award);
            }
          }
          if (cardName.indexOf('milestone') > -1) {
            milestones.push(extractMilestone(cardName, game.id ?? ""));
          }
        }

        game.players[Object.keys(game.players)[id]] = {
          ...game.players[Object.keys(game.players)[id]],
          milestones,
          vpCards,
          awards
        }
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
        if (notableCollectionRecord && vpCard.vp >= notableCollectionRecord.vp - 5 && (vpCard.vp > 2 || vpCard.cardName === "Tardigrades")) {
          vpCard.isNotable = true;
          if (vpCard.vp === notableCollectionRecord.vp) {
            vpCard.isTop = true;
          }
        }
        if (vpCard.cardName.includes('milestone')) {
          vpCard.vpType = vpCardType.milestone;
        }
        if (vpCard.cardName.includes('1st place')) {
          vpCard.vpType = vpCardType.award;
        }
      }
    }
  }

  // for each game, look at the first player (the winner). Determine the difference in score between the first player and second. set the aheadBy object to the difference in score and megaCredits.
  for (const game of processedData) {
    const players = Object.keys(game.players);
    const winner = game.players[players[0]];
    const secondPlace = game.players[players[1]];
    winner.aheadBy = {
      score: winner.finalScore - secondPlace.finalScore,
      megaCredits: winner.megaCredits - secondPlace.megaCredits,
    }

    players.forEach((player, key) => {
      // set the place
      game.players[player].gamePlace = key + 1;
    });
  }

  const streakTracker: {
    [player: string]: {
      wins: number;
      losses: number;
    }
  } = {};

  // let mostConsecutiveWins = 0

  processedData?.sort((a: Game, b: Game) => {
    // if dates are the same, sort by filename
    if (new Date(b.dateOfGame).getTime() === new Date(a.dateOfGame).getTime()) {
      return (b.fileName.split("-")[3] ?? "0").localeCompare(a.fileName.split("-")[3] ?? "0");
    }

    // sort by date
    return new Date(b.dateOfGame).getTime() - new Date(a.dateOfGame).getTime();
  })

  // iterate through data but reversed
  processedData?.slice().reverse().forEach((game: Game) => {
    const winner = Object.entries(game.players)[0][0];
    const players = Object.keys(game.players);
    players.map((player) => {
      if (!streakTracker[player]) {
        streakTracker[player] = {
          wins: 0,
          losses: 0
        }
      }

      if (player === winner) {
        streakTracker[player].wins = (streakTracker?.[player].wins ?? 0) + 1;
      } else {
        streakTracker[player].wins = 0;
      }
    })
    game.streakCount = streakTracker[winner].wins;
  });

  return new Response(JSON.stringify(processedData));
}