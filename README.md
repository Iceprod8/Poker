# Poker Texas Hold'em (TDD)

Petit moteur TypeScript pour:
- evaluer une main de 5 cartes
- trouver la meilleure main de 5 cartes parmi 7
- comparer plusieurs joueurs

## Installation

```bash
npm install
```

## Lancer les tests

```bash
npm test
```

## Fonctions principales

### `parseCard(value)`

Parse une carte depuis une string:
- `Ah`
- `Kd`
- `7c`
- `Ts`

### `evaluate5(cards)`

Prend exactement 5 cartes et retourne:
- `category`
- `chosen5`
- `tiebreaker`

Categories (du plus fort au plus faible):
- Straight flush
- Four of a kind
- Full house
- Flush
- Straight
- Three of a kind
- Two pair
- One pair
- High card

### `bestHandFrom7(cards)`

Prend exactement 7 cartes, genere toutes les combinaisons 5 parmi 7, evalue chaque combinaison et garde la meilleure.

### `comparePlayers(board, players)`

Prend:
- `board`: 5 cartes
- `players`: liste de joueurs avec 2 cartes chacun

Retourne:
- `winners`: id du gagnant ou des gagnants
- `players`: detail par joueur (`id`, `category`, `chosen5`, `tiebreaker`)

## Validite des entrees

Choix retenu: **validation et rejet des entrees invalides**.

Le code rejette les doublons de cartes:
- `evaluate5(cards)`: doublon dans les 5 cartes
- `bestHandFrom7(cards)`: doublon dans les 7 cartes
- `comparePlayers(board, players)`: doublon dans le board, dans les cartes joueurs, ou entre board et joueurs

Erreurs deja validees aussi:
- tailles attendues (`5` cartes pour `evaluate5`, `7` pour `bestHandFrom7`, board `5` et joueur `2` dans `comparePlayers`)

## Regle d'ordre de `chosen5`

`chosen5` est toujours deterministe:
- contient exactement 5 cartes
- vient des cartes disponibles
- respecte la categorie retournee
- est ordonne selon la force de la main

Details d'ordre:
- High card et Flush: cartes triees du rank le plus haut au plus bas
- One pair / Two pair / Three of a kind / Full house / Four of a kind:
  groupes forts d'abord, puis kickers
- Straight et Straight flush:
  du plus haut au plus bas
  (cas `A-2-3-4-5` represente en `5-4-3-2-A`)
