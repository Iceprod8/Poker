import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card";

describe("parseCard", () => {
  it("parse Ah", () => {
    expect(parseCard("Ah")).toEqual({ rank: "A", suit: "h" });
  });

  it("parse Kd", () => {
    expect(parseCard("Kd")).toEqual({ rank: "K", suit: "d" });
  });

  it("parse 7c", () => {
    expect(parseCard("7c")).toEqual({ rank: "7", suit: "c" });
  });

  it("parse Ts", () => {
    expect(parseCard("Ts")).toEqual({ rank: "T", suit: "s" });
  });

  it("rejette une carte avec une longueur invalide", () => {
    expect(() => parseCard("10h")).toThrow("La carte doit avoir exactement 2 caracteres");
  });

  it("rejette un rang non pris en charge", () => {
    expect(() => parseCard("Xh")).toThrow("Carte non prise en charge");
  });
});
