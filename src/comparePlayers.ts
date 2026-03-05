import type { Card } from "./card";
import { bestHandFrom7, compareEvaluatedHands } from "./bestHandFrom7";
import type { HandCategory } from "./pokerConstants";

export type PlayerInput = {
  id: string;
  cards: Card[];
};

export type PlayerResult = {
  id: string;
  category: HandCategory;
  chosen5: Card[];
  tiebreaker: number[];
};

export type ComparePlayersResult = {
  winners: string[];
  players: PlayerResult[];
};

export function comparePlayers(board: Card[], players: PlayerInput[]): ComparePlayersResult {
  if (board.length !== 5) throw new Error("comparePlayers attend exactement 5 cartes de board");
  if (players.length === 0) return { winners: [], players: [] };
  const details = players.map((player) => {
    if (player.cards.length !== 2) throw new Error(`Le joueur ${player.id} doit avoir exactement 2 cartes`);
    const hand = bestHandFrom7([...board, ...player.cards]);
    return {
      id: player.id,
      category: hand.category,
      chosen5: hand.chosen5,
      tiebreaker: hand.tiebreaker,
      hand,
    };
  });

  let bestPlayer = details[0];
  let winners = [bestPlayer.id];

  for (let i = 1; i < details.length; i += 1) {
    const candidate = details[i];
    const diff = compareEvaluatedHands(candidate.hand, bestPlayer.hand);

    if (diff > 0) {
      bestPlayer = candidate;
      winners = [candidate.id];
    } else if (diff === 0) winners.push(candidate.id);
  }

  return {
    winners,
    players: details.map((detail) => ({
      id: detail.id,
      category: detail.category,
      chosen5: detail.chosen5,
      tiebreaker: detail.tiebreaker,
    })),
  };
}
