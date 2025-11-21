export interface Music {
  id: number;
  anime: string;
  name: string;
  video: string;
  mp3: string;
}

export interface SortState {
  queue: number[][];
  left: number[];
  right: number[];
  merged: number[];
  
  battleCount: number; 
}

export interface DuelState {
  left: Music;
  right: Music;
  progress: number;
}
