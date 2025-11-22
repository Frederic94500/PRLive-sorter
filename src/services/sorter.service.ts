import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Music, DuelState, SortState } from '@models/music.model';

@Injectable({
  providedIn: 'root'
})
export class SorterService {
  private musicData: Music[] = [];

  private state: SortState = { queue: [], left: [], right: [], merged: [], battleCount: 0 };

  private history: SortState[] = [];

  private currentDuelSubject = new BehaviorSubject<DuelState | null>(null);
  public currentDuel$ = this.currentDuelSubject.asObservable();

  private finishedSubject = new BehaviorSubject<boolean>(false);
  public finished$ = this.finishedSubject.asObservable();

  public localStorageKey: string = "";

  constructor() { }

  loadData(musicData: Music[]) {
    this.musicData = musicData;
  }
  
  isFinished(): boolean {
    const state: SortState = this.readLocalStorage()!;
    if (!state) return false;
    return state.queue.length == 1 && state.left.length == 0 && state.right.length == 0;
  }

  start(resume: boolean = false) {
    if (resume && this.hasSave()) {
      this.state = this.readLocalStorage()!;
      if (this.state.left.length === 0 && this.state.queue.length > 1) {
        this.prepareNextBattle();
      } else if (this.state.queue.length == 1 && this.state.left.length == 0 && this.state.right.length == 0) {
        this.finishedSubject.next(true);
      }
    } else {
      this.init();
    }
    this.emitState();
  }

  private init() {
    const initialQueue = this.musicData.map((_, index) => [index]);

    this.state = {
      queue: initialQueue,
      left: [],
      right: [],
      merged: [],
      battleCount: 1
    };
    this.history = [];
    this.prepareNextBattle();
  }

  private prepareNextBattle() {
    if (this.state.queue.length <= 1 && this.state.left.length === 0) {
      this.finishedSubject.next(true);
      this.currentDuelSubject.next(null);
      localStorage.removeItem(this.localStorageKey);
      return;
    }

    if (this.state.left.length === 0 && this.state.right.length === 0) {
      this.state.left = this.state.queue.shift() || [];
      this.state.right = this.state.queue.shift() || [];
      this.state.merged = [];
    }
  }

  pick(choice: 'left' | 'right') {
    this.history.push(structuredClone(this.state));

    if (choice === 'left') {
      this.state.merged.push(this.state.left.shift()!);
    } else {
      this.state.merged.push(this.state.right.shift()!);
    }

    this.state.battleCount++;

    if (this.state.left.length === 0 || this.state.right.length === 0) {
      this.state.merged = [
        ...this.state.merged,
        ...this.state.left,
        ...this.state.right
      ];

      this.state.queue.push(this.state.merged);

      this.state.left = [];
      this.state.right = [];

      this.prepareNextBattle();
    }

    this.saveLocalStorage();
    this.emitState();
  }

  undo() {
    if (this.history.length === 0) return;
    this.state = this.history.pop()!;
    this.saveLocalStorage();
    this.emitState();
  }

  private emitState() {
    if (this.state.left.length === 0 && this.state.right.length === 0) return;

    const idLeft = this.state.left[0];
    const idRight = this.state.right[0];

    this.currentDuelSubject.next({
      left: this.musicData[idLeft],
      right: this.musicData[idRight],
      progress: this.state.battleCount
    });
  }

  getResults(): Music[] {
    if (this.state.queue.length > 0) {
      return this.state.queue[0].map(id => this.musicData[id]);
    }
    return [];
  }

  private saveLocalStorage() {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.state));
  }

  private readLocalStorage(): SortState | null {
    if (!this.hasSave()) {
      return null;
    }
    return JSON.parse(localStorage.getItem(this.localStorageKey)!);
  }

  hasSave(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    return !!localStorage.getItem(this.localStorageKey);
  }
}
