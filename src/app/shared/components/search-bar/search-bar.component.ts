import { Component, output, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarComponent {
  readonly placeholder = input<string>('Search...');
  readonly buttonText = input<string>('Search');
  readonly label = input<string>('Search');
  readonly disabled = input<boolean>(false);
  
  readonly search = output<string>();
  
  readonly query = signal<string>('');

  onSubmit(event: Event): void {
    event.preventDefault();
    this.search.emit(this.query());
  }

  onInput(value: string): void {
    this.query.set(value);
  }
}
