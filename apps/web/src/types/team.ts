export interface Team {
  id: number;
  name: string;
  logo: string;
  stadium: string;
  founded: number;
  country: string;
  league: string;
  leagueRank?: number;
  city: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

export interface SquadPlayer {
  id: number;
  name: string;
  photo: string;
  position: string;
  number: number;
  age: number;
  nationality: string;
  marketValue: number;
}

export interface Coach {
  name: string;
  photo: string;
  age: number;
  nationality: string;
  since: string;
}

export interface Fixture {
  id: number;
  date: string;
  homeTeam: {
    id: number;
    name: string;
    logo: string;
    score?: number;
  };
  awayTeam: {
    id: number;
    name: string;
    logo: string;
    score?: number;
  };
  competition: string;
  status: 'scheduled' | 'live' | 'finished';
  venue: string;
}

export interface FixtureDetail extends Fixture {
  referee: string;
  time: string;
  attendance?: number;
  homeLineup: FixturePlayer[];
  awayLineup: FixturePlayer[];
  events?: MatchEvent[];
}

export interface FixturePlayer {
  id: number;
  name: string;
  photo: string;
  position: string;
  number: number;
  marketValue: number;
  liveValue?: number;
  valueHistory: { time: string; value: number }[];
  stats?: {
    goals?: number;
    assists?: number;
    yellowCards?: number;
    redCards?: number;
    rating?: number;
  };
}

export interface MatchEvent {
  time: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'penalty';
  team: 'home' | 'away';
  player: string;
  detail?: string;
}

export interface TeamTransfer {
  playerId: number;
  playerName: string;
  playerPhoto: string;
  date: string;
  from: string;
  to: string;
  fee: string;
  type: 'In' | 'Out' | 'Loan In' | 'Loan Out';
}

export interface TeamValue {
  date: string;
  value: number;
}

export interface Club {
  id: number;
  name: string;
  logo: string;
  founded: number;
  country: string;
  city: string;
  address: string;
  stadium: string;
  website?: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

export interface ClubTeam {
  id: number;
  name: string;
  type: 'First Team' | 'Reserve' | 'Youth' | 'Women';
  league: string;
  leagueRank?: number;
  squadSize: number;
}
