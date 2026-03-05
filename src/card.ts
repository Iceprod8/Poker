export type Suit = "c" | "d" | "h" | "s";
export type Rank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "T"
  | "J"
  | "Q"
  | "K"
  | "A";

export type Card = {
  rank: Rank;
  suit: Suit;
};

const SUITS: readonly Suit[] = ["c", "d", "h", "s"];
const RANKS: readonly Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];

export function parseCard(value: string): Card {
  if (value.length !== 2) {
    throw new Error("La carte doit avoir exactement 2 caracteres");
  }

  const rank = value[0];
  const suit = value[1];

  if (!RANKS.includes(rank as Rank) || !SUITS.includes(suit as Suit)) {
    throw new Error("Carte non prise en charge");
  }

  return { rank: rank as Rank, suit: suit as Suit };
}
