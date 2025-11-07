import { Component, signal, inject, ChangeDetectionStrategy, OnInit, OnDestroy, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, catchError, of } from 'rxjs';

import { JokeService, JokeResult } from '../../core/services/joke.service';
import { Joke } from '../../models/joke.model';
import { I18nService } from '../../core/services/i18n.service';
import { JokeStorageService } from '../../core/services/joke-storage.service';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';
import { AddJokeDialogComponent } from '../add-joke-dialog/add-joke-dialog.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    SearchBarComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    ErrorBannerComponent,
    ToastComponent,
    ThemeToggleComponent,
    LanguageSelectorComponent,
    AddJokeDialogComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly jokeService = inject(JokeService);
  private readonly jokeStorage = inject(JokeStorageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);
  
  private readonly destroy$ = new Subject<void>();
  
  readonly query = signal<string>('');
  readonly loading = signal<boolean>(false);
  readonly isInitialLoad = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly apiJokes = signal<Joke[]>([]);
  readonly showDialog = signal<boolean>(false);
  readonly showToast = signal<boolean>(false);
  readonly toastMessage = signal<string>('');
  
  // Combine custom jokes with API jokes only when no search query
  readonly jokes = computed(() => {
    const api = this.apiJokes();
    const currentQuery = this.query();
    
    // Only show custom jokes when there's no search query (empty or initial load)
    if (!currentQuery || currentQuery.trim() === '') {
      const custom = this.jokeStorage.getCustomJokes()();
      return [...custom, ...api];
    }
    
    // When searching, only show API results
    return api;
  });

  constructor() {
    // Watch for query params to open/close dialog
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.showDialog.set(params['addJoke'] === 'true');
      });

    // Refresh jokes when language changes
    effect(() => {
      const currentLang = this.i18n.language();
      // Skip the initial load (will be handled by ngOnInit)
      if (!this.isInitialLoad()) {
        this.onSearch(this.query());
      }
    });
  }

  ngOnInit(): void {
    // Initial load with empty query to fetch jokes
    this.onSearch('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(query: string): void {
    this.query.set(query);
    this.loading.set(true);
    this.error.set(null);
    
    this.jokeService.getJokes(query)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error: JokeResult) => of(error))
      )
      .subscribe(result => {
        this.loading.set(false);
        this.isInitialLoad.set(false);
        if (result.error) {
          this.error.set(result.error);
          this.apiJokes.set([]);
        } else {
          this.apiJokes.set(result.jokes);
          this.error.set(null);
        }
      });
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

  async onOpenDialog(): Promise<void> {
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { addJoke: 'true' },
      queryParamsHandling: 'merge'
    });
  }

  async onCloseDialog(): Promise<void> {
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { addJoke: null },
      queryParamsHandling: 'merge'
    });
  }

  onJokeAdded(): void {
    this.toastMessage.set(this.i18n.t().toast.jokeAdded);
    this.showToast.set(true);
  }

  onCloseToast(): void {
    this.showToast.set(false);
  }
}
