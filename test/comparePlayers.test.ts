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

  it("departage les straight flush avec la carte haute", () => {
    const board = ["5h", "6h", "7h", "8h", "Kd"].map(parseCard);
    const joueurs = [
      { id: "p1", cards: ["9h", "2c"].map(parseCard) },
      { id: "p2", cards: ["4h", "Ac"].map(parseCard) },
    ];

    const resultat = comparePlayers(board, joueurs);

    expect(resultat.winners).toEqual(["p1"]);
    expect(resultat.players[0].category).toBe("Straight flush");
    expect(resultat.players[1].category).toBe("Straight flush");
  });

  it("departage les four of a kind avec le kicker", () => {
    const board = ["7c", "7d", "7h", "7s", "2d"].map(parseCard);
    const joueurs = [
      { id: "p1", cards: ["Ac", "Kc"].map(parseCard) },
      { id: "p2", cards: ["Qc", "Jc"].map(parseCard) },
    ];

    const resultat = comparePlayers(board, joueurs);

    expect(resultat.winners).toEqual(["p1"]);
    expect(resultat.players[0].category).toBe("Four of a kind");
    expect(resultat.players[1].category).toBe("Four of a kind");
  });

  it("departage les full house avec le brelan d abord", () => {
    const board = ["7c", "7d", "Qh", "Qd", "2s"].map(parseCard);
    const joueurs = [
      { id: "p1", cards: ["Qc", "As"].map(parseCard) },
      { id: "p2", cards: ["7h", "Ks"].map(parseCard) },
    ];

    const resultat = comparePlayers(board, joueurs);

    expect(resultat.winners).toEqual(["p1"]);
    expect(resultat.players[0].category).toBe("Full house");
    expect(resultat.players[1].category).toBe("Full house");
  });

  it("departage les flush carte par carte", () => {
    const board = ["Ah", "Jh", "9h", "2c", "3d"].map(parseCard);
    const joueurs = [
      { id: "p1", cards: ["Kh", "4h"].map(parseCard) },
      { id: "p2", cards: ["Qh", "5h"].map(parseCard) },
    ];

    const resultat = comparePlayers(board, joueurs);

    expect(resultat.winners).toEqual(["p1"]);
    expect(resultat.players[0].category).toBe("Flush");
    expect(resultat.players[1].category).toBe("Flush");
  });

  it("departage les straight avec la carte haute", () => {
    const board = ["5c", "6d", "7h", "8s", "Qd"].map(parseCard);
    const joueurs = [
      { id: "p1", cards: ["9c", "2c"].map(parseCard) },
      { id: "p2", cards: ["4c", "Kc"].map(parseCard) },
    ];

    const resultat = comparePlayers(board, joueurs);

    expect(resultat.winners).toEqual(["p1"]);
    expect(resultat.players[0].category).toBe("Straight");
    expect(resultat.players[1].category).toBe("Straight");
  });

  it("departage les two pair", () => {
    const board = ["Ah", "Kd", "7c", "7d", "2s"].map(parseCard);
    const joueurs = [
      { id: "p1", cards: ["As", "Qc"].map(parseCard) },
      { id: "p2", cards: ["Kh", "Qd"].map(parseCard) },
    ];

    const resultat = comparePlayers(board, joueurs);

    expect(resultat.winners).toEqual(["p1"]);
    expect(resultat.players[0].category).toBe("Two pair");
    expect(resultat.players[1].category).toBe("Two pair");
  });

  it("departage les one pair avec les kickers", () => {
    const board = ["Ah", "Kd", "Qc", "7d", "2s"].map(parseCard);
    const joueurs = [
      { id: "p1", cards: ["As", "Jc"].map(parseCard) },
      { id: "p2", cards: ["Ad", "Tc"].map(parseCard) },
    ];

    const resultat = comparePlayers(board, joueurs);

    expect(resultat.winners).toEqual(["p1"]);
    expect(resultat.players[0].category).toBe("One pair");
    expect(resultat.players[1].category).toBe("One pair");
  });

  it("departage les high card carte par carte", () => {
    const board = ["Ah", "Kd", "Qc", "8d", "2s"].map(parseCard);
    const joueurs = [
      { id: "p1", cards: ["Jc", "3h"].map(parseCard) },
      { id: "p2", cards: ["Tc", "9h"].map(parseCard) },
    ];

    const resultat = comparePlayers(board, joueurs);

    expect(resultat.winners).toEqual(["p1"]);
    expect(resultat.players[0].category).toBe("High card");
    expect(resultat.players[1].category).toBe("High card");
  });

  it("ne departage jamais avec la couleur", () => {
    const board = ["Ah", "Kd", "Qc", "8s", "2d"].map(parseCard);
    const joueurs = [
      { id: "p1", cards: ["Jc", "3h"].map(parseCard) },
      { id: "p2", cards: ["Jh", "4h"].map(parseCard) },
    ];

    const resultat = comparePlayers(board, joueurs);

    expect(resultat.winners).toEqual(["p1", "p2"]);
    expect(resultat.players[0].category).toBe("High card");
    expect(resultat.players[1].category).toBe("High card");
  });
});
