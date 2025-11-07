import { Component, output, input, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarComponent implements OnDestroy {
  readonly placeholder = input<string>('Search...');
  readonly label = input<string>('Search');
  readonly disabled = input<boolean>(false);
  readonly debounceTime = input<number>(500);
  readonly loading = input<boolean>(false);
  
  readonly search = output<string>();
  readonly addJoke = output<void>();
  
  private readonly searchSubject$ = new Subject<string>();

  constructor() {
    // Setup debounced search
    this.searchSubject$
      .pipe(
        debounceTime(this.debounceTime()),
        distinctUntilChanged()
      )
      .subscribe(query => {
        this.search.emit(query);
      });
  }

  ngOnDestroy(): void {
    this.searchSubject$.complete();
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    // Open add joke dialog instead of searching
    this.addJoke.emit();
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.searchSubject$.next(value);
  }
}
