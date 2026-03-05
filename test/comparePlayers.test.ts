import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card";
import { comparePlayers } from "../src/comparePlayers";

function versTexte(cartes: { rank: string; suit: string }[]): string[] {
  return cartes.map((carte) => `${carte.rank}${carte.suit}`);
}

describe("comparePlayers", () => {
  it("retourne un gagnant unique", () => {
    const board = ["Ah", "Kd", "Qd", "7c", "2s"].map(parseCard);
    const joueurs = [
      { id: "p1", cards: ["As", "Ad"].map(parseCard) },
      { id: "p2", cards: ["Kh", "Kc"].map(parseCard) },
    ];

    const resultat = comparePlayers(board, joueurs);

    expect(resultat.winners).toEqual(["p1"]);
    expect(resultat.players).toHaveLength(2);

    expect(resultat.players[0].id).toBe("p1");
    expect(resultat.players[0].category).toBe("Three of a kind");
    expect(versTexte(resultat.players[0].chosen5)).toEqual(["Ad", "Ah", "As", "Kd", "Qd"]);

    expect(resultat.players[1].id).toBe("p2");
    expect(resultat.players[1].category).toBe("Three of a kind");
    expect(versTexte(resultat.players[1].chosen5)).toEqual(["Kc", "Kd", "Kh", "Ah", "Qd"]);
  });

  it("retourne plusieurs gagnants en cas d egalite", () => {
    const board = ["Ah", "Kd", "Qd", "Jh", "Tc"].map(parseCard);
    const joueurs = [
      { id: "p1", cards: ["2c", "3d"].map(parseCard) },
      { id: "p2", cards: ["4s", "5h"].map(parseCard) },
    ];

    const resultat = comparePlayers(board, joueurs);

    expect(resultat.winners).toEqual(["p1", "p2"]);
    expect(resultat.players[0].category).toBe("Straight");
    expect(resultat.players[1].category).toBe("Straight");
    expect(versTexte(resultat.players[0].chosen5)).toEqual(["Ah", "Kd", "Qd", "Jh", "Tc"]);
    expect(versTexte(resultat.players[1].chosen5)).toEqual(["Ah", "Kd", "Qd", "Jh", "Tc"]);
  });

  it("rejette les doublons entre board et joueurs", () => {
    const board = ["Ah", "Kd", "Qd", "Jh", "Tc"].map(parseCard);
    const joueurs = [
      { id: "p1", cards: ["Ah", "3d"].map(parseCard) },
      { id: "p2", cards: ["4s", "5h"].map(parseCard) },
    ];

    expect(() => comparePlayers(board, joueurs)).toThrow("comparePlayers contient des cartes en double");
  });
});
