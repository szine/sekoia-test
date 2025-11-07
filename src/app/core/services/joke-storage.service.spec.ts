import { TestBed } from '@angular/core/testing';
import { JokeStorageService, CustomJoke } from './joke-storage.service';

describe('JokeStorageService', () => {
  let service: JokeStorageService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    TestBed.configureTestingModule({
      providers: [JokeStorageService]
    });
    
    service = TestBed.inject(JokeStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addJoke', () => {
    it('should add a new joke and return it', () => {
      const jokeText = 'This is a test joke';
      const newJoke = service.addJoke(jokeText);

      expect(newJoke).toBeDefined();
      expect(newJoke.joke).toBe(jokeText);
      expect(newJoke.type).toBe('single');
      expect(newJoke.category).toBe('Custom');
      expect(newJoke.id).toBeGreaterThan(0);
    });

    it('should add joke to the beginning of the list', () => {
      const joke1 = service.addJoke('First joke');
      const joke2 = service.addJoke('Second joke');

      const jokes = service.getCustomJokes()();
      expect(jokes[0].id).toBe(joke2.id);
      expect(jokes[1].id).toBe(joke1.id);
    });

    it('should update the signal with new joke', () => {
      const initialCount = service.getCustomJokes()().length;
      service.addJoke('New joke');
      
      expect(service.getCustomJokes()().length).toBe(initialCount + 1);
    });
  });

  describe('getCustomJokes', () => {
    it('should return readonly signal', () => {
      const jokes = service.getCustomJokes();
      expect(jokes).toBeDefined();
      expect(typeof jokes).toBe('function');
    });

    it('should return all custom jokes', () => {
      service.addJoke('Joke 1');
      service.addJoke('Joke 2');

      const jokes = service.getCustomJokes()();
      expect(jokes.length).toBe(2);
    });
  });
});
