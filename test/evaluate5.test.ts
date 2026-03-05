import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card";
import { evaluate5 } from "../src/evaluate5";

function versTexte(cartes: { rank: string; suit: string }[]): string[] {
  return cartes.map((carte) => `${carte.rank}${carte.suit}`);
}

describe("evaluate5", () => {
  it("evalue une high card", () => {
    const cartes = ["7s", "Kd", "3d", "Ah", "9c"].map(parseCard);

    const resultat = evaluate5(cartes);

    expect(resultat.category).toBe("High card");
    expect(versTexte(resultat.chosen5)).toEqual(["Ah", "Kd", "9c", "7s", "3d"]);
  });

  it("evalue une one pair", () => {
    const cartes = ["7c", "Ah", "Ad", "Ts", "3d"].map(parseCard);

    const resultat = evaluate5(cartes);

    expect(resultat.category).toBe("One pair");
    expect(versTexte(resultat.chosen5)).toEqual(["Ad", "Ah", "Ts", "7c", "3d"]);
  });

  it("evalue une two pair", () => {
    const cartes = ["7s", "Kc", "2h", "Kh", "7d"].map(parseCard);

    const resultat = evaluate5(cartes);

    expect(resultat.category).toBe("Two pair");
    expect(versTexte(resultat.chosen5)).toEqual(["Kc", "Kh", "7d", "7s", "2h"]);
  });

  it("evalue une three of a kind", () => {
    const cartes = ["Kd", "9h", "2d", "9c", "9s"].map(parseCard);

    const resultat = evaluate5(cartes);

    expect(resultat.category).toBe("Three of a kind");
    expect(versTexte(resultat.chosen5)).toEqual(["9c", "9h", "9s", "Kd", "2d"]);
  });

  it("evalue une straight", () => {
    const cartes = ["7d", "9h", "5d", "8c", "6s"].map(parseCard);

    const resultat = evaluate5(cartes);

    expect(resultat.category).toBe("Straight");
    expect(versTexte(resultat.chosen5)).toEqual(["9h", "8c", "7d", "6s", "5d"]);
  });

  it("evalue une straight A-2-3-4-5", () => {
    const cartes = ["2d", "Ah", "4c", "5h", "3s"].map(parseCard);

    const resultat = evaluate5(cartes);

    expect(resultat.category).toBe("Straight");
    expect(versTexte(resultat.chosen5)).toEqual(["5h", "4c", "3s", "2d", "Ah"]);
  });

  it("evalue une flush", () => {
    const cartes = ["6h", "Kh", "3h", "9h", "Ah"].map(parseCard);

    const resultat = evaluate5(cartes);

    expect(resultat.category).toBe("Flush");
    expect(versTexte(resultat.chosen5)).toEqual(["Ah", "Kh", "9h", "6h", "3h"]);
  });

  it("evalue une full house", () => {
    const cartes = ["Qd", "7s", "Qc", "Qh", "7d"].map(parseCard);

    const resultat = evaluate5(cartes);

    expect(resultat.category).toBe("Full house");
    expect(versTexte(resultat.chosen5)).toEqual(["Qc", "Qd", "Qh", "7d", "7s"]);
  });

  it("evalue un four of a kind", () => {
    const cartes = ["Ah", "Ac", "7d", "As", "Ad"].map(parseCard);

    const resultat = evaluate5(cartes);

    expect(resultat.category).toBe("Four of a kind");
    expect(versTexte(resultat.chosen5)).toEqual(["Ac", "Ad", "Ah", "As", "7d"]);
  });

  it("evalue une straight flush", () => {
    const cartes = ["7h", "9h", "5h", "8h", "6h"].map(parseCard);

    const resultat = evaluate5(cartes);

    expect(resultat.category).toBe("Straight flush");
    expect(versTexte(resultat.chosen5)).toEqual(["9h", "8h", "7h", "6h", "5h"]);
  });

  it("rejette les doublons", () => {
    const cartes = ["Ah", "Ah", "Kd", "Qc", "Js"].map(parseCard);

    expect(() => evaluate5(cartes)).toThrow("evaluate5 contient des cartes en double");
  });
});
