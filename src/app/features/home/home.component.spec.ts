import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { HomeComponent } from './home.component';
import { JokeService, JokeResult } from '../../core/services/joke.service';
import { Joke } from '../../models/joke.model';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let compiled: HTMLElement;
  let jokeService: jasmine.SpyObj<JokeService>;

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

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: JokeService, useValue: jokeServiceSpy }
      ]
    }).compileComponents();

    jokeService = TestBed.inject(JokeService) as jasmine.SpyObj<JokeService>;
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

    fixture.detectChanges();
    
    // Before async operation completes
    expect(component.loading()).toBe(true);
    
    tick();
    fixture.detectChanges();
    
    // After async operation completes
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
    
    jokeService.getJokes.and.returnValues(of(errorResult), of(successResult));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.error()).toBe('Error');

    component.onRetry();
    tick();
    fixture.detectChanges();

    expect(jokeService.getJokes).toHaveBeenCalledTimes(2);
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

  it('should disable search bar while loading', fakeAsync(() => {
    jokeService.getJokes.and.returnValue(of({ jokes: [] }));

    fixture.detectChanges();
    
    expect(component.loading()).toBe(true);
    
    tick();
    fixture.detectChanges();
    
    expect(component.loading()).toBe(false);
  }));

  it('should clear error on new search', fakeAsync(() => {
    const errorResult: JokeResult = { jokes: [], error: 'Error' };
    const successResult: JokeResult = { jokes: mockJokes };
    
    jokeService.getJokes.and.returnValues(of(errorResult), of(successResult));

    fixture.detectChanges();
    tick();

    expect(component.error()).toBe('Error');

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

    const searchSection = compiled.querySelector('[aria-label="Search section"]');
    expect(searchSection).toBeTruthy();

    const resultsSection = compiled.querySelector('[aria-label="Search results"]');
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
