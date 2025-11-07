import { Component, input, output, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'info';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent {
  readonly message = input.required<string>();
  readonly type = input<ToastType>('success');
  readonly duration = input<number>(3000);
  
  readonly close = output<void>();

  constructor() {
    effect(() => {
      const duration = this.duration();
      if (duration > 0) {
        const timer = setTimeout(() => {
          this.close.emit();
        }, duration);
        
        return () => clearTimeout(timer);
      }
      return undefined;
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
