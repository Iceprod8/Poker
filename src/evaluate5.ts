import type { Card, Rank, Suit } from "./card";

// Liste des categories du plus fort au plus faible.
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

export type EvaluatedHand5 = {
  category: HandCategory;
  chosen5: Card[];
  tiebreaker: number[];
};

type RankGroup = {
  rank: Rank;
  cards: Card[];
};

type StraightInfo = {
  orderedCards: Card[];
  highValue: number;
};

const RANK_VALEUR: Record<Rank, number> = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

const SUIT_ORDRE: Record<Suit, number> = {
  c: 0,
  d: 1,
  h: 2,
  s: 3,
};

const WHEEL_VALUES = [5, 4, 3, 2, 14] as const;

// Tri "descendant" pour avoir un ordre stable dans chosen5.
// On trie d'abord par rank, puis par suit juste pour rendre le resultat deterministe.
function compareCarteDesc(a: Card, b: Card): number {
  const ecartRank = RANK_VALEUR[b.rank] - RANK_VALEUR[a.rank];
  if (ecartRank !== 0) return ecartRank;
  return SUIT_ORDRE[a.suit] - SUIT_ORDRE[b.suit];
}

// Pour les groupes, on veut d'abord les plus gros paquets (4, 3, 2, 1),
// puis le rank le plus haut.
function compareGroupes(a: RankGroup, b: RankGroup): number {
  if (a.cards.length !== b.cards.length) return b.cards.length - a.cards.length;
  return RANK_VALEUR[b.rank] - RANK_VALEUR[a.rank];
}

function rankValue(rank: Rank): number {
  return RANK_VALEUR[rank];
}

function tiebreakerFromCards(cards: Card[]): number[] {
  return cards.map((card) => rankValue(card.rank));
}

function buildResult(
  category: HandCategory,
  chosen5: Card[],
  tiebreaker: number[] = tiebreakerFromCards(chosen5),
): EvaluatedHand5 {
  return { category, chosen5, tiebreaker };
}

function groupByRank(cards: Card[]): RankGroup[] {
  const map = new Map<Rank, Card[]>();

  for (const card of cards) {
    const groupedCards = map.get(card.rank) ?? [];
    groupedCards.push(card);
    map.set(card.rank, groupedCards);
  }

  return [...map.entries()]
    .map(([rank, groupedCards]) => ({ rank, cards: [...groupedCards].sort(compareCarteDesc) }))
    .sort(compareGroupes);
}

function cardsFromValues(values: readonly number[], valueToCard: Map<number, Card>): Card[] | null {
  const orderedCards: Card[] = [];
  for (const value of values) {
    const card = valueToCard.get(value);
    if (!card) return null;
    orderedCards.push(card);
  }
  return orderedCards;
}

function detectStraight(cards: Card[]): StraightInfo | null {
  // On mappe valeur -> carte pour verifier facilement la suite.
  const valueToCard = new Map<number, Card>();

  for (const card of cards) {
    valueToCard.set(RANK_VALEUR[card.rank], card);
  }

  // Doublon de rank => impossible d'avoir une straight sur 5 cartes.
  if (valueToCard.size !== 5) return null;

  const values = [...valueToCard.keys()].sort((a, b) => b - a);

  const isRegularStraight = values.every(
    (value, index) => index === 0 || values[index - 1] - 1 === value,
  );

  if (isRegularStraight) {
    const orderedCards = cardsFromValues(values, valueToCard);
    if (!orderedCards) return null;
    return {
      orderedCards,
      highValue: values[0],
    };
  }

  const isWheelStraight =
    values[0] === 14 &&
    values[1] === 5 &&
    values[2] === 4 &&
    values[3] === 3 &&
    values[4] === 2;

  if (isWheelStraight) {
    // Cas special: A-2-3-4-5, la carte haute compte comme 5.
    const orderedCards = cardsFromValues(WHEEL_VALUES, valueToCard);
    if (!orderedCards) return null;
    return {
      orderedCards,
      highValue: 5,
    };
  }

  return null;
}

function isFlush(cards: Card[]): boolean {
  // Toutes les cartes de la meme couleur.
  return cards.every((card) => card.suit === cards[0].suit);
}

export function evaluate5(cards: Card[]): EvaluatedHand5 {
  if (cards.length !== 5) throw new Error("evaluate5 attend exactement 5 cartes");

  const sortedCards = [...cards].sort(compareCarteDesc);
  const groupes = groupByRank(cards);
  const [groupe1, groupe2, groupe3] = groupes;
  const straight = detectStraight(cards);
  const flush = isFlush(cards);

  // IMPORTANT: on verifie du plus fort vers le plus faible.
  if (straight && flush) return buildResult("Straight flush", straight.orderedCards, [straight.highValue]);

  if (groupe1?.cards.length === 4 && groupe2?.cards.length === 1) {
    return buildResult("Four of a kind", [...groupe1.cards, ...groupe2.cards], [
      rankValue(groupe1.rank),
      rankValue(groupe2.rank),
    ]);
  }

  if (groupe1?.cards.length === 3 && groupe2?.cards.length === 2) {
    return buildResult("Full house", [...groupe1.cards, ...groupe2.cards], [
      rankValue(groupe1.rank),
      rankValue(groupe2.rank),
    ]);
  }

  // En flush, la force depend juste des ranks tries.
  if (flush) return buildResult("Flush", sortedCards);

  if (straight) return buildResult("Straight", straight.orderedCards, [straight.highValue]);

  if (groupe1?.cards.length === 3 && groupe2?.cards.length === 1) {
    const triplet = groupe1;
    const kickers = groupes.slice(1).flatMap((groupe) => groupe.cards);

    return buildResult("Three of a kind", [...triplet.cards, ...kickers], [
      rankValue(triplet.rank),
      ...tiebreakerFromCards(kickers),
    ]);
  }

  if (groupe1?.cards.length === 2 && groupe2?.cards.length === 2 && groupe3?.cards.length === 1) {
    // Two pair: paire haute, paire basse, puis kicker.
    const highPair = groupe1;
    const lowPair = groupe2;
    const kicker = groupe3.cards[0];

    return buildResult("Two pair", [...highPair.cards, ...lowPair.cards, kicker], [
      rankValue(highPair.rank),
      rankValue(lowPair.rank),
      rankValue(kicker.rank),
    ]);
  }

  if (groupe1?.cards.length === 2 && groupe2?.cards.length === 1) {
    const kickers = groupes.slice(1).flatMap((groupe) => groupe.cards);

    return buildResult("One pair", [...groupe1.cards, ...kickers], [
      rankValue(groupe1.rank),
      ...tiebreakerFromCards(kickers),
    ]);
  }

  // Fallback: rien de mieux detecte, donc high card.
  return buildResult("High card", sortedCards);
}
