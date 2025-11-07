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
    it('should add a new single joke and return it', () => {
      const jokeData = {
        type: 'single' as const,
        joke: 'This is a test joke',
        category: 'Custom' as const
      };
      const newJoke = service.addJoke(jokeData);

      expect(newJoke).toBeDefined();
      expect(newJoke.joke).toBe(jokeData.joke);
      expect(newJoke.type).toBe('single');
      expect(newJoke.category).toBe('Custom');
      expect(newJoke.id).toBeGreaterThan(0);
    });

    it('should add a twopart joke and return it', () => {
      const jokeData = {
        type: 'twopart' as const,
        setup: 'Why did the chicken cross the road?',
        delivery: 'To get to the other side!',
        category: 'Pun' as const
      };
      const newJoke = service.addJoke(jokeData);

      expect(newJoke).toBeDefined();
      expect(newJoke.setup).toBe(jokeData.setup);
      expect(newJoke.delivery).toBe(jokeData.delivery);
      expect(newJoke.type).toBe('twopart');
      expect(newJoke.category).toBe('Pun');
      expect(newJoke.id).toBeGreaterThan(0);
    });

    it('should add joke to the beginning of the list', () => {
      const joke1 = service.addJoke({ type: 'single', joke: 'First joke', category: 'Custom' });
      const joke2 = service.addJoke({ type: 'single', joke: 'Second joke', category: 'Custom' });

      const jokes = service.getCustomJokes()();
      expect(jokes[0].id).toBe(joke2.id);
      expect(jokes[1].id).toBe(joke1.id);
    });

    it('should update the signal with new joke', () => {
      const initialCount = service.getCustomJokes()().length;
      service.addJoke({ type: 'single', joke: 'New joke', category: 'Custom' });
      
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
      service.addJoke({ type: 'single', joke: 'Joke 1', category: 'Custom' });
      service.addJoke({ type: 'single', joke: 'Joke 2', category: 'Custom' });

      const jokes = service.getCustomJokes()();
      expect(jokes.length).toBe(2);
    });
  });
});
