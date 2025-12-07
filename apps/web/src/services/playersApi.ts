const API_BASE_URL = 'http://localhost:5087/api';

export interface Team {
  id: number;
  teamName: string;
  teamCode: string | null;
  teamCountry: string | null;
  teamLogo: string | null;
}

export interface Player {
  id: number;
  playerName: string;
  age: number | null;
  position: string | null;
  jerseyNumber: number | null;
  photoUrl: string | null;
  team: Team | null;
}

export const playersApi = {
  async getPlayerById(id: number): Promise<Player> {
    const response = await fetch(`${API_BASE_URL}/players/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch player: ${response.statusText}`);
    }
    return response.json();
  },

  async getAllPlayers(): Promise<Player[]> {
    const response = await fetch(`${API_BASE_URL}/players`);
    if (!response.ok) {
      throw new Error(`Failed to fetch players: ${response.statusText}`);
    }
    return response.json();
  },

  async getPlayersByTeamId(teamId: number): Promise<Player[]> {
    const response = await fetch(`${API_BASE_URL}/players/team/${teamId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch team players: ${response.statusText}`);
    }
    return response.json();
  }
};
