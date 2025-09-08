import { Gabarito } from "next/font/google";
import path from "path";

const playerAliases: { [key: string]: string[] } = {
  Victor: ['Vic', 'VicVic', 'Victortor', 'Yogurt', 'notsuspicious', 'Vanadium', 'McVictor', 'V'],
  Yota: ['Haircut', 'flourer', 'Yoyo', 'y', 'Yoter'],
  Vy: ['Vyvy', 'need bubs', 'Vynus', 'Vyter'],
  Lindsey: ['LinLin', 'Lin', 'Lind', 'Lithium', 'McLindsey'],
  Landon: ['Lando', 'Lan', 'LanLan', 'Lanthanum', 'L'],
  Ming: ['need nap', 'm'],
  Amy: ['Americium', 'A'],
  Chris: ['Chras'],
};

export const normalizedPlayerNames = () => {
  const result: { [key: string]: string[] } = {};
  for (const name in playerAliases) {
    result[name] = [name, ...playerAliases[name]];
  }
  return result;
};

export async function getAllFilesInFolder(fs: typeof import('fs/promises'), folderPath: string): Promise<string[]> {
  const fullPath = path.join(process.cwd(), folderPath);
  try {
    const fileNames = await fs.readdir(fullPath);
    return fileNames;
  } catch (error) {
    console.error("Error reading directory:", error);
    return [];
  }
}

export const notableCollections = [
  "Stratospheric Birds",
  "Venusian Animals",
  "Ants",
  "Venusian Insects",
  "Penguins",
  "Birds",
  "Livestock",
  "Physics Complex",
  "Ecological Zone",
  "Pets",
  "Fish",
  "Immigration Shuttles",
  "Floating Habs",
  "Tardigrades",
  "Jovian Lanterns",
  "Io Mining Industries",
  "Ganymede Colony",
  "St. Joseph of Cupertino Mission",
  "Water Import From Europa",
  "Extremophiles",
  "Neptunian Power Consultants",
  "Asteroid Deflection System",
  "Decomposers",
  "Security Fleet",
  "Predators",
  "Commercial District",
  "Cloud Tourism",
  "Main Belt Asteroids",
  "Herbivores",
  "Small Animals"
];

export const formatDate = (date?: Date | string) => {
  if (!date) return 'n/a';

  // Check if date is a string and convert it to a Date object if necessary
  if (typeof date === 'string') {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      console.error(`Invalid date string: ${date}`);
      return 'invalid date';
    }
    date = parsedDate;
  }

  console.log(date);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

// round to two digits
const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

// round to two digits. if there are no digits after the decimal, include zeros up to two digits (or 0.30 or 0.00)
export const percentageWithTwoSigFigs = (num: number): string => {
  const rounded = round(num * 100);
  return rounded.toFixed(2) + '%';
}

export const roundWithTwoSigFigs = (num: number): string => {
  return round(num).toFixed(2);
}

export const gab = Gabarito({
  subsets: ["latin"],
  adjustFontFallback: false,
});

export const humanizeTimeTaken = (timer: {
  hours: number,
  minutes: number,
  seconds: number
}) => {
  return (timer.hours ? `${timer.hours}:` : "") + timer?.minutes.toString().padStart(2, "0") + ":" + (timer?.seconds).toString().padStart(2, "0")
}

