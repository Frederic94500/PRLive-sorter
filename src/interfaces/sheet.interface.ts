import { Music } from "../models/music.model";

export interface SorterSheet {
  sheetId: string;
  prId: string;
  voterId: string;
  latestUpdate: string;
  name: string;
  image?: string;
  songList: Music[];
}
