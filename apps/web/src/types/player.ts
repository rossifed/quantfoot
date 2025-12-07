export interface Player {
  id: number;
  name: string;
  photo: string;
  age: number;
  nationality: string;
  club: string;
  position: string;
  foot: 'Left' | 'Right' | 'Both';
  height: string;
  weight: string;
  description: string;
  strengths: string[];
  playingStyle: string;
}

export interface PlayerStats {
  season: string;
  appearances: number;
  goals: number;
  assists: number;
  minutesPlayed: number;
  yellowCards: number;
  redCards: number;
}

export interface Transfer {
  date: string;
  from: string;
  to: string;
  fee: string;
  type: 'Transfer' | 'Loan';
}

export interface PlayerValue {
  date: string;
  value: number;
}

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  type: 'Highlight' | 'Goal' | 'Skill';
}
