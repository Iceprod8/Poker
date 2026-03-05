import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card";
import { bestHandFrom7 } from "../src/bestHandFrom7";

function versTexte(cartes: { rank: string; suit: string }[]): string[] {
  return cartes.map((carte) => `${carte.rank}${carte.suit}`);
}

describe("bestHandFrom7", () => {
  it("prend le board quand c est deja la meilleure main", () => {
    const cartes = ["Ah", "Kh", "Qh", "Jh", "Th", "2c", "3d"].map(parseCard);

    const resultat = bestHandFrom7(cartes);

    expect(resultat.category).toBe("Straight flush");
    expect(versTexte(resultat.chosen5)).toEqual(["Ah", "Kh", "Qh", "Jh", "Th"]);
  });

  it("garde les 5 meilleures cartes d une flush quand il y en a 6", () => {
    const cartes = ["2h", "Ah", "Kh", "Qh", "9h", "3h", "7d"].map(parseCard);

    const resultat = bestHandFrom7(cartes);

    expect(resultat.category).toBe("Flush");
    expect(versTexte(resultat.chosen5)).toEqual(["Ah", "Kh", "Qh", "9h", "3h"]);
  });

  it("retourne un chosen5 deterministe en cas d egalite de force", () => {
    const cartes = ["9h", "8d", "7c", "6s", "5d", "5c", "Ah"].map(parseCard);

    const resultat = bestHandFrom7(cartes);

    expect(resultat.category).toBe("Straight");
    expect(versTexte(resultat.chosen5)).toEqual(["9h", "8d", "7c", "6s", "5d"]);
  });

  it("rejette les doublons", () => {
    const cartes = ["Ah", "Kh", "Qh", "Jh", "Th", "2c", "Ah"].map(parseCard);

    expect(() => bestHandFrom7(cartes)).toThrow("bestHandFrom7 contient des cartes en double");
  });
});
