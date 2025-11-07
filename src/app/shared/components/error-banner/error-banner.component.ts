import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  templateUrl: './error-banner.component.html',
  styleUrl: './error-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorBannerComponent {
  readonly message = input.required<string>();
  readonly retryText = input<string>('Retry');
  
  readonly retry = output<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
