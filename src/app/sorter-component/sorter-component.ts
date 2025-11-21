import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DuelState, Music } from '@models/music.model';
import { SorterService } from '@services/sorter.service';
import { CommonModule, isPlatformServer } from '@angular/common';
import { take, tap } from 'rxjs/operators';
import { MonoTypeOperatorFunction } from 'rxjs';

@Component({
  selector: 'app-sorter-component',
  imports: [CommonModule],
  templateUrl: './sorter-component.html',
  styleUrl: './sorter-component.css',
})
export class SorterComponent implements OnInit {
  started = false;
  finished = false;
  hasSave = false;
  showSettingsModal = false;

  duelState: DuelState | null = null;
  results: any[] = [];

  settings = {
    video: true,
    region: 'eu'
  };

  constructor(
    private sorterService: SorterService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const once = <T>(): MonoTypeOperatorFunction<T> =>
      isPlatformServer(this.platformId) ? take(1) : tap(() => {});
    
    this.sorterService.loadData().pipe(once()).subscribe(() => {
      this.hasSave = this.sorterService.hasSave();
    });
    
    this.sorterService.currentDuel$.pipe(once()).subscribe(state => {
      this.duelState = state;
    });

    this.sorterService.finished$.pipe(once()).subscribe(isFinished => {
      this.finished = isFinished;
      if (isFinished) this.prepareResults();
    });
  }

  // Actions
  toggleSettings() {
    this.showSettingsModal = !this.showSettingsModal;
  }

  setFormat(isVideo: boolean) {
    this.settings.video = isVideo;
  }

  setRegion(region: string) {
    this.settings.region = region;
  }

  onStart(resume: boolean) {
    this.started = true;
    this.sorterService.start(resume);
  }

  onPick(choice: 'left' | 'right') {
    this.sorterService.pick(choice);
  }

  onUndo() {
    this.sorterService.undo();
  }

  // Media Helper
  isYoutube(url: string): boolean {
    return url?.includes('youtube.com') || url?.includes('youtu.be');
  }

  getSafeUrl(url: string): SafeResourceUrl {
    if (this.isYoutube(url)) {
      let videoId = '';
      try {
        if (url.includes('v=')) videoId = new URL(url).searchParams.get("v") || '';
      } catch (e) { }
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${videoId}`);
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getVideoUrl(url: string): string {
    if (url?.includes("animemusicquiz")) {
      return `https://${this.settings.region}dist.animemusicquiz.com/${url.split('/').pop()}`;
    }
    return url;
  }

  getAudioUrl(music: Music): string {
    if (music.video?.includes("animemusicquiz")) {
      return `https://${this.settings.region}dist.animemusicquiz.com/${music.mp3.split('/').pop()}`;
    }
    return music.mp3 || '';
  }

  // Result
  prepareResults() {
    const sortedMusic = this.sorterService.getResults();
    this.results = sortedMusic.map((music, index) => ({ ...music, rank: index + 1 }));
  }

  copyRanksToClipboard() {
    const ranksById: number[] = [];
    const maxId = Math.max(...this.results.map(m => Number(m.id)), 0);

    for (let id = 1; id <= maxId; id++) {
      const music = this.results.find(r => Number(r.id) === id);
      ranksById.push(music ? music.rank : 0);
    }
    navigator.clipboard.writeText(ranksById.join('\n')).then(() => alert("Ranks copied!"));
  }

  copyResultsToClipboard() {
    const text = this.results.map(r => `${r.rank}. ${r.anime} - ${r.name}`).join('\n');
    navigator.clipboard.writeText(text).then(() => alert("Results copied!"));
  }
}
