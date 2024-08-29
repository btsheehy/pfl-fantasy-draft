import { makeAutoObservable, runInAction } from "mobx";
import { RootStore } from "./RootStore";
import { api, ApiPlayer } from "../services/api";

export class PlayerStore {
  players: ApiPlayer[] = [];
  isLoading = false;
  error: string | null = null;
  rootStore: RootStore;
  hasLoaded = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false,
      hasLoaded: false
    });
  }

  async fetchPlayers() {
    if (this.hasLoaded) return; // Prevent refetching if already loaded

    this.isLoading = true;
    this.error = null;
    try {
      const players = await api.getPlayers();
      runInAction(() => {
        this.players = players;
        this.isLoading = false;
        this.hasLoaded = true;
      });
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error ? error.message : "An unknown error occurred";
        this.isLoading = false;
      });
    }
  }

  getPlayerById(id: number) {
    return this.players.find((player) => player.id === id);
  }
  getTopPlayersForPosition(position: string, count: number = 5) {
    return this.players
      .filter((player) => player.position === position)
      .sort((a, b) => b.projectedFantasyPoints - a.projectedFantasyPoints)
      .slice(0, count);
  }
  getTopPlayersForEachPosition() {
    const positions = ["QB", "RB", "WR", "TE", "K", "DST"];
    return positions.map((position) => ({
      position,
      players: this.getTopPlayersForPosition(position),
    }));
  }
}