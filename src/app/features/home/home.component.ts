import { Component, signal, inject, ChangeDetectionStrategy, OnInit, OnDestroy, effect, ElementRef, viewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, switchMap, catchError, of } from 'rxjs';

import { JokeService, JokeResult } from '../../core/services/joke.service';
import { Joke } from '../../models/joke.model';
import { I18nService } from '../../core/services/i18n.service';
import { JokeStorageService } from '../../core/services/joke-storage.service';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
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
  
  private readonly resultsHeading = viewChild<ElementRef>('resultsHeading');
  
  // Combine custom jokes with API jokes
  readonly jokes = computed(() => {
    const custom = this.jokeStorage.getCustomJokes()();
    const api = this.apiJokes();
    return [...custom, ...api];
  });

  constructor() {
    // Watch for query params to open/close dialog
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.showDialog.set(params['addJoke'] === 'true');
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
    this.toastMessage.set('Joke added successfully!');
    this.showToast.set(true);
  }

  onCloseToast(): void {
    this.showToast.set(false);
  }

  async loadDialogComponent() {
    const { AddJokeDialogComponent } = await import('../add-joke-dialog/add-joke-dialog.component');
    return AddJokeDialogComponent;
  }
}
