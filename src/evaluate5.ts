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

// Tri "descendant" pour avoir un ordre stable dans chosen5.
// On trie d'abord par rank, puis par suit juste pour rendre le resultat deterministe.
function compareCarteDesc(a: Card, b: Card): number {
  const ecartRank = RANK_VALEUR[b.rank] - RANK_VALEUR[a.rank];
  if (ecartRank !== 0) {
    return ecartRank;
  }

  return SUIT_ORDRE[a.suit] - SUIT_ORDRE[b.suit];
}

// Pour les groupes, on veut d'abord les plus gros paquets (4, 3, 2, 1),
// puis le rank le plus haut.
function compareGroupes(a: RankGroup, b: RankGroup): number {
  if (a.cards.length !== b.cards.length) {
    return b.cards.length - a.cards.length;
  }

  return RANK_VALEUR[b.rank] - RANK_VALEUR[a.rank];
}

function groupByRank(cards: Card[]): RankGroup[] {
  const map = new Map<Rank, Card[]>();

  for (const card of cards) {
    const deja = map.get(card.rank);
    if (deja) {
      deja.push(card);
      continue;
    }

    map.set(card.rank, [card]);
  }

  return [...map.entries()]
    .map(([rank, groupedCards]) => ({ rank, cards: [...groupedCards].sort(compareCarteDesc) }))
    .sort(compareGroupes);
}

function detectStraight(cards: Card[]): StraightInfo | null {
  // On mappe valeur -> carte pour verifier facilement la suite.
  const valueToCard = new Map<number, Card>();

  for (const card of cards) {
    valueToCard.set(RANK_VALEUR[card.rank], card);
  }

  if (valueToCard.size !== 5) {
    // Doublon de rank => impossible d'avoir une straight sur 5 cartes.
    return null;
  }

  const values = [...valueToCard.keys()].sort((a, b) => b - a);

  const isRegularStraight =
    values[0] - 1 === values[1] &&
    values[1] - 1 === values[2] &&
    values[2] - 1 === values[3] &&
    values[3] - 1 === values[4];

  if (isRegularStraight) {
    return {
      orderedCards: values.map((value) => valueToCard.get(value)!),
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
    const wheelOrder = [5, 4, 3, 2, 14];
    return {
      orderedCards: wheelOrder.map((value) => valueToCard.get(value)!),
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
  if (cards.length !== 5) {
    throw new Error("evaluate5 attend exactement 5 cartes");
  }

  const groupes = groupByRank(cards);
  const straight = detectStraight(cards);
  const flush = isFlush(cards);

  // IMPORTANT: on verifie du plus fort vers le plus faible.
  if (straight && flush) {
    return {
      category: "Straight flush",
      chosen5: straight.orderedCards,
      tiebreaker: [straight.highValue],
    };
  }

  if (groupes[0]?.cards.length === 4 && groupes[1]?.cards.length === 1) {
    return {
      category: "Four of a kind",
      chosen5: [...groupes[0].cards, ...groupes[1].cards],
      tiebreaker: [RANK_VALEUR[groupes[0].rank], RANK_VALEUR[groupes[1].rank]],
    };
  }

  if (groupes[0]?.cards.length === 3 && groupes[1]?.cards.length === 2) {
    return {
      category: "Full house",
      chosen5: [...groupes[0].cards, ...groupes[1].cards],
      tiebreaker: [RANK_VALEUR[groupes[0].rank], RANK_VALEUR[groupes[1].rank]],
    };
  }

  if (flush) {
    // En flush, la force depend juste des ranks tries.
    const chosen5 = [...cards].sort(compareCarteDesc);
    return {
      category: "Flush",
      chosen5,
      tiebreaker: chosen5.map((card) => RANK_VALEUR[card.rank]),
    };
  }

  if (straight) {
    return {
      category: "Straight",
      chosen5: straight.orderedCards,
      tiebreaker: [straight.highValue],
    };
  }

  if (groupes[0]?.cards.length === 3 && groupes[1]?.cards.length === 1) {
    const triplet = groupes[0];
    const kickers = groupes.slice(1).flatMap((groupe) => groupe.cards);

    return {
      category: "Three of a kind",
      chosen5: [...triplet.cards, ...kickers],
      tiebreaker: [RANK_VALEUR[triplet.rank], ...kickers.map((card) => RANK_VALEUR[card.rank])],
    };
  }

  if (
    groupes[0]?.cards.length === 2 &&
    groupes[1]?.cards.length === 2 &&
    groupes[2]?.cards.length === 1
  ) {
    // Two pair: paire haute, paire basse, puis kicker.
    const highPair = groupes[0];
    const lowPair = groupes[1];
    const kicker = groupes[2].cards[0];

    return {
      category: "Two pair",
      chosen5: [...highPair.cards, ...lowPair.cards, kicker],
      tiebreaker: [
        RANK_VALEUR[highPair.rank],
        RANK_VALEUR[lowPair.rank],
        RANK_VALEUR[kicker.rank],
      ],
    };
  }

  if (groupes[0]?.cards.length === 2 && groupes[1]?.cards.length === 1) {
    const pairRankValue = RANK_VALEUR[groupes[0].rank];
    const kickers = groupes.slice(1).flatMap((groupe) => groupe.cards);

    return {
      category: "One pair",
      chosen5: [...groupes[0].cards, ...kickers],
      tiebreaker: [pairRankValue, ...kickers.map((card) => RANK_VALEUR[card.rank])],
    };
  }

  const chosen5 = [...cards].sort(compareCarteDesc);

  // Fallback: rien de mieux detecte, donc high card.
  return {
    category: "High card",
    chosen5,
    tiebreaker: chosen5.map((card) => RANK_VALEUR[card.rank]),
  };
}
