// TypeScript interfaces for backend models

export interface Sport {
  id: number;
  sport_name: string;
  event_type: 'LOG' | 'OLYMPIAD';
  team_based: boolean;
}

export interface House {
  id: number;
  house_name: string;
  captain: number | null;
  status: string;
}

export interface Team {
  id: number;
  team_name: string;
  event_type: 'LOG' | 'OLYMPIAD';
  sport: number;
  house: number | null;
  created_by: number | null;
}

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'captain' | 'player';
}
