import styles from "./Icon.module.css";

const iconTypes = ['TR', 'VP'] as const;
export type IconType = typeof iconTypes[number];

export const Icon = ({ type }: { type: IconType }) => {
  if (type === 'TR') return <span className={styles.terraformingRatingIcon}>TR</span>

  if (type === 'VP') return <span className={styles.victoryPointsIcon}>VP</span>

  return <></>
}