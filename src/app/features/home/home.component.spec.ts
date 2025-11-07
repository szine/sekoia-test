import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { HomeComponent } from './home.component';
import { JokeService, JokeResult } from '../../core/services/joke.service';
import { JokeStorageService } from '../../core/services/joke-storage.service';
import { Joke } from '../../models/joke.model';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let compiled: HTMLElement;
  let jokeService: jasmine.SpyObj<JokeService>;
  let jokeStorageService: jasmine.SpyObj<JokeStorageService>;

  const mockJokes: Joke[] = [
    {
      id: 1,
      type: 'single',
      joke: 'Test joke 1',
      category: 'Programming',
      flags: { nsfw: false, religious: false, political: false, racist: false, sexist: false, explicit: false }
    },
    {
      id: 2,
      type: 'twopart',
      setup: 'Setup 2',
      delivery: 'Delivery 2',
      category: 'Misc',
      flags: { nsfw: false, religious: false, political: false, racist: false, sexist: false, explicit: false }
    }
  ];

  beforeEach(async () => {
    const jokeServiceSpy = jasmine.createSpyObj('JokeService', ['getJokes']);
    const jokeStorageServiceSpy = jasmine.createSpyObj('JokeStorageService', ['getCustomJokes', 'addJoke', 'removeJoke']);
    
    // Mock getCustomJokes to return a signal with empty array
    jokeStorageServiceSpy.getCustomJokes.and.returnValue(() => []);
    
    // Default mock for getJokes to prevent errors in effect
    jokeServiceSpy.getJokes.and.returnValue(of({ jokes: [] }));

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: JokeService, useValue: jokeServiceSpy },
        { provide: JokeStorageService, useValue: jokeStorageServiceSpy }
      ]
    }).compileComponents();

    jokeService = TestBed.inject(JokeService) as jasmine.SpyObj<JokeService>;
    jokeStorageService = TestBed.inject(JokeStorageService) as jasmine.SpyObj<JokeStorageService>;
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger fetch on init with empty query', fakeAsync(() => {
    const result: JokeResult = { jokes: mockJokes };
    jokeService.getJokes.and.returnValue(of(result));

    fixture.detectChanges();
    tick();

    expect(jokeService.getJokes).toHaveBeenCalledWith('');
    expect(component.jokes().length).toBe(2);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
  }));

  it('should show loading skeleton while fetching', fakeAsync(() => {
    jokeService.getJokes.and.returnValue(of({ jokes: [] }));

    // Initial state - should trigger ngOnInit which calls onSearch
    expect(component.isInitialLoad()).toBe(true);
    
    fixture.detectChanges();
    tick();
    
    // After initial load completes
    expect(component.isInitialLoad()).toBe(false);
    expect(component.loading()).toBe(false);
  }));

  it('should display 10 joke cards in success state', fakeAsync(() => {
    const tenJokes: Joke[] = Array(10).fill(null).map((_, i) => ({
      id: i,
      type: 'single' as const,
      joke: `Joke ${i}`,
      category: 'Test',
      flags: { nsfw: false, religious: false, political: false, racist: false, sexist: false, explicit: false }
    }));

    jokeService.getJokes.and.returnValue(of({ jokes: tenJokes }));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const jokeCards = compiled.querySelectorAll('.joke-card');
    expect(jokeCards.length).toBe(10);
  }));

  it('should display empty state when no results', fakeAsync(() => {
    jokeService.getJokes.and.returnValue(of({ jokes: [] }));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const emptyState = compiled.querySelector('app-empty-state');
    expect(emptyState).toBeTruthy();
    expect(component.jokes().length).toBe(0);
  }));

  it('should display error banner with retry on error', fakeAsync(() => {
    const errorResult: JokeResult = {
      jokes: [],
      error: 'Network error occurred'
    };
    jokeService.getJokes.and.returnValue(of(errorResult));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const errorBanner = compiled.querySelector('app-error-banner');
    expect(errorBanner).toBeTruthy();
    expect(component.error()).toBe('Network error occurred');
    expect(component.jokes().length).toBe(0);
  }));

  it('should retry on error banner retry click', fakeAsync(() => {
    const errorResult: JokeResult = { jokes: [], error: 'Error' };
    const successResult: JokeResult = { jokes: mockJokes };
    
    // Configure mock to always return error first, then success
    jokeService.getJokes.and.returnValue(of(errorResult));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.error()).toBe('Error');

    // Now configure for success on retry
    jokeService.getJokes.and.returnValue(of(successResult));
    
    const callCountBefore = jokeService.getJokes.calls.count();
    component.onRetry();
    tick();
    fixture.detectChanges();

    expect(jokeService.getJokes.calls.count()).toBeGreaterThan(callCountBefore);
    expect(component.error()).toBeNull();
    expect(component.jokes().length).toBe(2);
  }));

  it('should trigger search on SearchBar search event', fakeAsync(() => {
    jokeService.getJokes.and.returnValue(of({ jokes: mockJokes }));

    fixture.detectChanges();
    tick();

    jokeService.getJokes.calls.reset();
    
    component.onSearch('programming');
    tick();

    expect(jokeService.getJokes).toHaveBeenCalledWith('programming');
    expect(component.query()).toBe('programming');
  }));

  it('should use trackBy function for joke list', () => {
    const joke = mockJokes[0];
    const trackByResult = component.trackByJokeId(0, joke);
    expect(trackByResult).toBe(joke.id);
  });

  it('should render single type joke correctly', fakeAsync(() => {
    const singleJoke: Joke = {
      id: 1,
      type: 'single',
      joke: 'This is a single joke',
      category: 'Test',
      flags: { nsfw: false, religious: false, political: false, racist: false, sexist: false, explicit: false }
    };

    jokeService.getJokes.and.returnValue(of({ jokes: [singleJoke] }));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const jokeContent = compiled.querySelector('.joke-card__content');
    expect(jokeContent?.textContent).toBe('This is a single joke');
  }));

  it('should render twopart type joke correctly', fakeAsync(() => {
    const twopartJoke: Joke = {
      id: 2,
      type: 'twopart',
      setup: 'Why did the developer quit?',
      delivery: 'Because they did not get arrays!',
      category: 'Programming',
      flags: { nsfw: false, religious: false, political: false, racist: false, sexist: false, explicit: false }
    };

    jokeService.getJokes.and.returnValue(of({ jokes: [twopartJoke] }));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const setup = compiled.querySelector('.joke-card__setup');
    const delivery = compiled.querySelector('.joke-card__delivery');
    
    expect(setup?.textContent).toBe('Why did the developer quit?');
    expect(delivery?.textContent).toBe('Because they did not get arrays!');
  }));

  it('should display joke tags', fakeAsync(() => {
    jokeService.getJokes.and.returnValue(of({ jokes: [mockJokes[0]] }));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const tags = compiled.querySelectorAll('.joke-card__tag');
    expect(tags.length).toBeGreaterThan(0);
    expect(tags[0]?.textContent).toContain('single');
  }));

  it('should show loading spinner in search bar during search', fakeAsync(() => {
    // First call for initial load
    jokeService.getJokes.and.returnValue(of({ jokes: [] }));

    fixture.detectChanges();
    tick();
    
    // Verify initial load is complete
    expect(component.isInitialLoad()).toBe(false);
    expect(component.loading()).toBe(false);
    
    // Set up a new observable that won't complete immediately
    let loadingStateWhenChecked = false;
    jokeService.getJokes.and.callFake(() => {
      // Capture loading state right after onSearch sets it
      loadingStateWhenChecked = component.loading();
      return of({ jokes: [] });
    });
    
    // Trigger a new search
    component.onSearch('test');
    
    // Loading should have been true when the service was called
    expect(loadingStateWhenChecked).toBe(true);
    expect(component.isInitialLoad()).toBe(false);
    
    tick();
    
    // After completion, loading should be false
    expect(component.loading()).toBe(false);
  }));

  it('should clear error on new search', fakeAsync(() => {
    const errorResult: JokeResult = { jokes: [], error: 'Error' };
    const successResult: JokeResult = { jokes: mockJokes };
    
    // Configure mock to return error first
    jokeService.getJokes.and.returnValue(of(errorResult));

    fixture.detectChanges();
    tick();

    expect(component.error()).toBe('Error');

    // Now configure for success on new search
    jokeService.getJokes.and.returnValue(of(successResult));

    component.onSearch('new query');
    tick();

    expect(component.error()).toBeNull();
  }));

  it('should have proper accessibility attributes', fakeAsync(() => {
    jokeService.getJokes.and.returnValue(of({ jokes: mockJokes }));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const main = compiled.querySelector('main');
    expect(main).toBeTruthy();

    const searchBar = compiled.querySelector('app-search-bar');
    expect(searchBar).toBeTruthy();

    const resultsSection = compiled.querySelector('.home__results');
    expect(resultsSection).toBeTruthy();
  }));

  it('should have focusable results heading', fakeAsync(() => {
    jokeService.getJokes.and.returnValue(of({ jokes: mockJokes }));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const heading = compiled.querySelector('.home__results-heading') as HTMLElement;
    expect(heading).toBeTruthy();
    expect(heading.getAttribute('tabindex')).toBe('-1');
  }));
});
