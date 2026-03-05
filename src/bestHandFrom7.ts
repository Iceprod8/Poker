import type { Card } from "./card";
import { evaluate5, type EvaluatedHand5 } from "./evaluate5";
import { assertNoDuplicateCards } from "./inputValidation";
import { HAND_CATEGORY_STRENGTH } from "./pokerConstants";

// Compare 2 listes de tiebreaker de gauche a droite.
function compareTiebreakerDesc(a: number[], b: number[]): number {
  const maxLength = Math.max(a.length, b.length);
  for (let i = 0; i < maxLength; i += 1) {
    const left = a[i] ?? 0;
    const right = b[i] ?? 0;
    if (left !== right) return left - right;
  }
  return 0;
}

// Compare 2 mains deja evaluees.
// Ordre: categorie -> tiebreaker.
// Si tout est egal, c'est une egalite (pas de departage par couleur).
export function compareEvaluatedHands(a: EvaluatedHand5, b: EvaluatedHand5): number {
  const categoryDiff = HAND_CATEGORY_STRENGTH[a.category] - HAND_CATEGORY_STRENGTH[b.category];
  if (categoryDiff !== 0) return categoryDiff;

  return compareTiebreakerDesc(a.tiebreaker, b.tiebreaker);
}

// Genere toutes les combinaisons de 5 cartes parmi les 7 (21 au total).
function generate5CardCombinations(cards: Card[]): Card[][] {
  const combinations: Card[][] = [];
  const cardCount = cards.length;

  for (let i = 0; i < cardCount - 4; i += 1) {
    for (let j = i + 1; j < cardCount - 3; j += 1) {
      for (let k = j + 1; k < cardCount - 2; k += 1) {
        for (let l = k + 1; l < cardCount - 1; l += 1) {
          for (let m = l + 1; m < cardCount; m += 1) {
            combinations.push([cards[i], cards[j], cards[k], cards[l], cards[m]]);
          }
        }
      }
    }
  }

  return combinations;
}

export function bestHandFrom7(cards: Card[]): EvaluatedHand5 {
  if (cards.length !== 7) throw new Error("bestHandFrom7 attend exactement 7 cartes");
  assertNoDuplicateCards(cards, "bestHandFrom7");

  const combinations = generate5CardCombinations(cards);

  // On prend la premiere combinaison comme base puis on garde la meilleure.
  let bestHand = evaluate5(combinations[0]);
  for (let i = 1; i < combinations.length; i += 1) {
    const candidate = evaluate5(combinations[i]);
    if (compareEvaluatedHands(candidate, bestHand) > 0) bestHand = candidate;
  }

  return bestHand;
}
