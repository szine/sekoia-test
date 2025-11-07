import { Component, output, signal, ChangeDetectionStrategy, effect, viewChild, ElementRef, AfterViewInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JokeStorageService } from '../../core/services/joke-storage.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-add-joke-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-joke-dialog.component.html',
  styleUrl: './add-joke-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddJokeDialogComponent {
  private readonly jokeStorage = inject(JokeStorageService);
  protected readonly i18n = inject(I18nService);
  private readonly dialogElement = viewChild<ElementRef<HTMLElement>>('dialog');
  private readonly firstInput = viewChild<ElementRef<HTMLTextAreaElement>>('jokeInput');
  
  readonly close = output<void>();
  readonly jokeAdded = output<void>();
  
  readonly jokeText = signal<string>('');
  readonly isSubmitting = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  
  private focusableElements: HTMLElement[] = [];
  private triggerElement: HTMLElement | null = null;

  constructor() {
    // Store the currently focused element when dialog opens
    this.triggerElement = document.activeElement as HTMLElement;
    
    // Focus management when dialog opens
    effect(() => {
      const input = this.firstInput();
      if (input) {
        setTimeout(() => {
          input.nativeElement.focus();
          this.setupFocusTrap();
        }, 100);
      }
    });
  }

  ngAfterViewInit(): void {
    this.setupFocusTrap();
  }

  get isValid(): boolean {
    const text = this.jokeText().trim();
    return text.length >= 10;
  }

  setTriggerElement(element: HTMLElement): void {
    this.triggerElement = element;
  }

  setupFocusTrap(): void {
    const dialog = this.dialogElement()?.nativeElement;
    if (!dialog) return;

    this.focusableElements = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.onClose();
      return;
    }

    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  private trapFocus(event: KeyboardEvent): void {
    if (this.focusableElements.length === 0) return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];
    
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onInput(value: string): void {
    this.jokeText.set(value);
    this.error.set(null);
  }

  async onSubmit(): Promise<void> {
    if (!this.isValid || this.isSubmitting()) {
      return;
    }

    const text = this.jokeText().trim();
    
    try {
      this.isSubmitting.set(true);
      this.error.set(null);

      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      this.jokeStorage.addJoke(text);
      
      this.jokeAdded.emit();
      this.onClose();
    } catch (err) {
      this.error.set('Failed to add joke. Please try again.');
      this.isSubmitting.set(false);
    }
  }

  onClose(): void {
    this.jokeText.set('');
    this.error.set(null);
    this.isSubmitting.set(false);
    
    this.close.emit();
    
    // Restore focus to trigger element after dialog is closed
    setTimeout(() => {
      if (this.triggerElement && this.triggerElement.isConnected) {
        this.triggerElement.focus();
      }
    }, 0);
  }
}
