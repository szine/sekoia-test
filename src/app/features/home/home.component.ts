import { Component, signal, inject, ChangeDetectionStrategy, OnInit, OnDestroy, effect, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, switchMap, catchError, of } from 'rxjs';

import { JokeService, JokeResult } from '../../core/services/joke.service';
import { Joke } from '../../models/joke.model';
import { I18nService } from '../../core/services/i18n.service';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    SearchBarComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    ErrorBannerComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly jokeService = inject(JokeService);
  protected readonly i18n = inject(I18nService);
  
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject$ = new Subject<string>();
  
  readonly query = signal<string>('');
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly jokes = signal<Joke[]>([]);
  
  private readonly resultsHeading = viewChild<ElementRef>('resultsHeading');

  constructor() {
    // Setup search stream with switchMap for request cancellation
    this.searchSubject$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(query => {
          this.loading.set(true);
          this.error.set(null);
          return this.jokeService.getJokes(query).pipe(
            catchError((error: JokeResult) => of(error))
          );
        })
      )
      .subscribe(result => {
        this.loading.set(false);
        if (result.error) {
          this.error.set(result.error);
          this.jokes.set([]);
        } else {
          this.jokes.set(result.jokes);
          this.error.set(null);
          
          // Focus management: move focus to results heading after successful search
          setTimeout(() => {
            const heading = this.resultsHeading();
            if (heading && result.jokes.length > 0) {
              heading.nativeElement.focus();
            }
          }, 100);
        }
      });
  }

  ngOnInit(): void {
    // Initial load with empty query
    this.onSearch('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(query: string): void {
    this.query.set(query);
    this.searchSubject$.next(query);
  }

  onRetry(): void {
    this.onSearch(this.query());
  }

  trackByJokeId(index: number, joke: Joke): number {
    return joke.id;
  }

  getJokeContent(joke: Joke): string {
    if (joke.type === 'single') {
      return joke.joke || '';
    }
    return '';
  }

  getJokeSetup(joke: Joke): string {
    if (joke.type === 'twopart') {
      return joke.setup || '';
    }
    return '';
  }

  getJokeDelivery(joke: Joke): string {
    if (joke.type === 'twopart') {
      return joke.delivery || '';
    }
    return '';
  }
}
