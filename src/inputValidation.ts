import type { Card } from "./card";

function cardKey(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export function assertNoDuplicateCards(cards: Card[], context: string): void {
  const uniques = new Set(cards.map(cardKey));
  if (uniques.size !== cards.length) {
    throw new Error(`${context} contient des cartes en double`);
  }
}
