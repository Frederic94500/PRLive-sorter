import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
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

  private readonly STORAGE_KEY = 'sorter_minimal_state';

  constructor(private http: HttpClient) { }

  loadData(): Observable<void> {
    return this.http.get<Music[]>('assets/songList.json').pipe(
      map(data => { this.musicData = data; })
    );
  }

  start(resume: boolean = false) {
    if (resume && localStorage.getItem(this.STORAGE_KEY)) {
      this.state = JSON.parse(localStorage.getItem(this.STORAGE_KEY)!);
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
      localStorage.removeItem(this.STORAGE_KEY);
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

    this.save();
    this.emitState();
  }

  undo() {
    if (this.history.length === 0) return;
    this.state = this.history.pop()!;
    this.save();
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

  private save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
  }

  hasSave(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    return !!localStorage.getItem(this.STORAGE_KEY);
  }
}
