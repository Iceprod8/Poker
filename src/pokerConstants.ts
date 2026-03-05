import type { Rank, Suit } from "./card";

export type HandCategory =
  | "Straight flush"
  | "Four of a kind"
  | "Full house"
  | "Flush"
  | "Straight"
  | "Three of a kind"
  | "Two pair"
  | "One pair"
  | "High card";

export const HAND_CATEGORY_STRENGTH: Record<HandCategory, number> = {
  "High card": 0,
  "One pair": 1,
  "Two pair": 2,
  "Three of a kind": 3,
  "Straight": 4,
  "Flush": 5,
  "Full house": 6,
  "Four of a kind": 7,
  "Straight flush": 8,
};

export const RANK_VALUES: Record<Rank, number> = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "T": 10,
  "J": 11,
  "Q": 12,
  "K": 13,
  "A": 14,
};

export const VALID_RANKS: readonly Rank[] = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
];

export const VALID_SUITS: readonly Suit[] = ["c", "d", "h", "s"];

// Ordre utilise pour trier les cartes de maniere deterministe.
export const SUIT_ORDER: Record<Suit, number> = {
  "c": 0,
  "d": 1,
  "h": 2,
  "s": 3,
};

// En cas d'egalite parfaite, on garde un ordre stable pour chosen5.
// Attention: ce n'est PAS une regle de departage poker.
export const DETERMINISTIC_SUIT_STRENGTH: Record<Suit, number> = {
  "c": 4,
  "d": 3,
  "h": 2,
  "s": 1,
};
