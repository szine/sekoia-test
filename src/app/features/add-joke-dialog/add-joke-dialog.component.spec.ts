import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AddJokeDialogComponent } from './add-joke-dialog.component';
import { JokeStorageService } from '../../core/services/joke-storage.service';
import { I18nService } from '../../core/services/i18n.service';

describe('AddJokeDialogComponent', () => {
  let component: AddJokeDialogComponent;
  let fixture: ComponentFixture<AddJokeDialogComponent>;
  let compiled: HTMLElement;
  let jokeStorageService: jasmine.SpyObj<JokeStorageService>;

  beforeEach(async () => {
    const storageSpy = jasmine.createSpyObj('JokeStorageService', ['addJoke']);

    await TestBed.configureTestingModule({
      imports: [AddJokeDialogComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: JokeStorageService, useValue: storageSpy }
      ]
    }).compileComponents();

    jokeStorageService = TestBed.inject(JokeStorageService) as jasmine.SpyObj<JokeStorageService>;
    
    // Force language to English for consistent tests
    const i18nService = TestBed.inject(I18nService);
    i18nService.setLanguage('en');
    
    fixture = TestBed.createComponent(AddJokeDialogComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have dialog role and aria attributes', () => {
    const dialog = compiled.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.getAttribute('aria-labelledby')).toBe('dialog-title');
  });

  it('should display dialog title', () => {
    const title = compiled.querySelector('#dialog-title');
    expect(title?.textContent).toBe('Add Your Joke');
  });

  describe('Validation', () => {
    it('should be invalid when joke text is empty', () => {
      component.jokeText.set('');
      expect(component.isValid).toBe(false);
    });

    it('should be invalid when joke text is less than 10 characters', () => {
      component.jokeText.set('Short');
      expect(component.isValid).toBe(false);
    });

    it('should be valid when joke text is 10 or more characters', () => {
      component.jokeText.set('This is a valid joke');
      expect(component.isValid).toBe(true);
    });

    it('should trim whitespace when checking validity', () => {
      component.jokeText.set('   Valid   ');
      expect(component.isValid).toBe(false);
      
      component.jokeText.set('   Valid joke here   ');
      expect(component.isValid).toBe(true);
    });

    it('should disable submit button when invalid', () => {
      component.jokeText.set('Short');
      fixture.detectChanges();

      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(submitButton.disabled).toBe(true);
    });

    it('should enable submit button when valid', () => {
      component.jokeText.set('This is a valid joke');
      fixture.detectChanges();

      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(submitButton.disabled).toBe(false);
    });
  });

  describe('Hint text', () => {
    it('should display hint text', () => {
      const hint = compiled.querySelector('.dialog__hint');
      expect(hint?.textContent?.trim()).toBe('Your complete joke in one part');
    });

    it('should keep hint text visible on input', () => {
      const textarea = compiled.querySelector('textarea') as HTMLTextAreaElement;
      textarea.value = 'This is a test';
      textarea.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const hint = compiled.querySelector('.dialog__hint');
      expect(hint?.textContent?.trim()).toBe('Your complete joke in one part');
    });
  });

  describe('Submit', () => {
    it('should call jokeStorage.addJoke with trimmed text', fakeAsync(() => {
      const jokeText = '  This is a valid joke  ';
      component.jokeText.set(jokeText);
      
      jokeStorageService.addJoke.and.returnValue({
        id: 1,
        type: 'single',
        joke: jokeText.trim(),
        category: 'Custom',
        flags: {
          nsfw: false,
          religious: false,
          political: false,
          racist: false,
          sexist: false,
          explicit: false
        }
      });

      component.onSubmit();
      tick(300);

      expect(jokeStorageService.addJoke).toHaveBeenCalledWith(jokeText.trim());
    }));

    it('should emit jokeAdded event on successful submit', fakeAsync(() => {
      const jokeAddedSpy = jasmine.createSpy('jokeAdded');
      component.jokeAdded.subscribe(jokeAddedSpy);

      component.jokeText.set('This is a valid joke');
      jokeStorageService.addJoke.and.returnValue({
        id: 1,
        type: 'single',
        joke: 'This is a valid joke',
        category: 'Custom',
        flags: {
          nsfw: false,
          religious: false,
          political: false,
          racist: false,
          sexist: false,
          explicit: false
        }
      });

      component.onSubmit();
      tick(300);

      expect(jokeAddedSpy).toHaveBeenCalled();
    }));

    it('should emit close event after successful submit', fakeAsync(() => {
      const closeSpy = jasmine.createSpy('close');
      component.close.subscribe(closeSpy);

      component.jokeText.set('This is a valid joke');
      jokeStorageService.addJoke.and.returnValue({
        id: 1,
        type: 'single',
        joke: 'This is a valid joke',
        category: 'Custom',
        flags: {
          nsfw: false,
          religious: false,
          political: false,
          racist: false,
          sexist: false,
          explicit: false
        }
      });

      component.onSubmit();
      tick(300);

      expect(closeSpy).toHaveBeenCalled();
    }));

    it('should not submit when invalid', fakeAsync(() => {
      component.jokeText.set('Short');
      component.onSubmit();
      tick(300);

      expect(jokeStorageService.addJoke).not.toHaveBeenCalled();
    }));

    it('should show loading state during submit', fakeAsync(() => {
      component.jokeText.set('This is a valid joke');
      jokeStorageService.addJoke.and.returnValue({
        id: 1,
        type: 'single',
        joke: 'This is a valid joke',
        category: 'Custom',
        flags: {
          nsfw: false,
          religious: false,
          political: false,
          racist: false,
          sexist: false,
          explicit: false
        }
      });

      component.onSubmit();
      expect(component.isSubmitting()).toBe(true);
      
      tick(300);
      expect(component.isSubmitting()).toBe(false);
    }));
  });

  describe('Close', () => {
    it('should emit close event when close button clicked', () => {
      const closeSpy = jasmine.createSpy('close');
      component.close.subscribe(closeSpy);

      const closeButton = compiled.querySelector('.dialog__close') as HTMLButtonElement;
      closeButton.click();

      expect(closeSpy).toHaveBeenCalled();
    });

    it('should emit close event when cancel button clicked', () => {
      const closeSpy = jasmine.createSpy('close');
      component.close.subscribe(closeSpy);

      const cancelButton = compiled.querySelector('.dialog__button--secondary') as HTMLButtonElement;
      cancelButton.click();

      expect(closeSpy).toHaveBeenCalled();
    });

    it('should reset form state on close', () => {
      component.jokeText.set('Some text');
      component.error.set('Some error');
      component.isSubmitting.set(true);

      component.onClose();

      expect(component.jokeText()).toBe('');
      expect(component.error()).toBeNull();
      expect(component.isSubmitting()).toBe(false);
    });

    it('should close on Escape key', () => {
      const closeSpy = jasmine.createSpy('close');
      component.close.subscribe(closeSpy);

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      component.handleKeydown(event);

      expect(closeSpy).toHaveBeenCalled();
    });

    it('should close on backdrop click', () => {
      const closeSpy = jasmine.createSpy('close');
      component.close.subscribe(closeSpy);

      const backdrop = compiled.querySelector('.dialog-backdrop') as HTMLElement;
      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', { value: backdrop, enumerable: true });
      Object.defineProperty(event, 'currentTarget', { value: backdrop, enumerable: true });
      
      component.onBackdropClick(event);

      expect(closeSpy).toHaveBeenCalled();
    });

    it('should not close when clicking inside dialog', () => {
      const closeSpy = jasmine.createSpy('close');
      component.close.subscribe(closeSpy);

      const dialog = compiled.querySelector('.dialog') as HTMLElement;
      const backdrop = compiled.querySelector('.dialog-backdrop') as HTMLElement;
      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', { value: dialog, enumerable: true });
      Object.defineProperty(event, 'currentTarget', { value: backdrop, enumerable: true });
      
      component.onBackdropClick(event);

      expect(closeSpy).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should display error message when present', () => {
      component.error.set('Test error message');
      fixture.detectChanges();

      const errorElement = compiled.querySelector('.dialog__error');
      expect(errorElement).toBeTruthy();
      expect(errorElement?.textContent).toContain('Test error message');
    });

    it('should have aria-live for error announcements', () => {
      component.error.set('Test error');
      fixture.detectChanges();

      const errorElement = compiled.querySelector('.dialog__error');
      expect(errorElement?.getAttribute('role')).toBe('alert');
      expect(errorElement?.getAttribute('aria-live')).toBe('polite');
    });

    it('should clear error on input', () => {
      component.error.set('Some error');
      component.onInput('New text');

      expect(component.error()).toBeNull();
    });
  });
});
