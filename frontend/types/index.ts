export interface User {
  id: number;
  username: string;
  email: string;
  role: 'general' | 'player' | 'captain' | 'admin';
  department?: string | null;
  contact_no?: string | null;
  house?: string | null;
}

export interface House {
  id: number;
  house_name: string;
  captain?: User;
  status: 'pending' | 'active' | 'inactive';
  created_at: string;
}

export interface Sport {
  id: number;
  sport_name: string;
  event_type: 'LOG' | 'OLYMPIAD';
  team_based: boolean;
}

export interface Player {
  id: number;
  user: User;
  bio?: string;
  joined_at: string;
}

export interface Team {
  id: number;
  team_name: string;
  event_type: 'LOG' | 'OLYMPIAD';
  sport: Sport;
  house?: House;
  created_by: User;
  captain: User;
  created_at: string;
}

export interface Court {
  id: number;
  court_name: string;
  location: string;
  hourly_rate: string;
  status: boolean;
}

export interface Booking {
  id: number;
  court: number;
  court_details?: Court;
  user?: User;
  date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  re_password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}
