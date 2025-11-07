import { Injectable, signal } from '@angular/core';
import { Joke, JokeCategory } from '../../models/joke.model';

export interface CustomJoke {
  id: number;
  type: 'single' | 'twopart';
  joke?: string;
  setup?: string;
  delivery?: string;
  category: JokeCategory;
  flags: {
    nsfw: boolean;
    religious: boolean;
    political: boolean;
    racist: boolean;
    sexist: boolean;
    explicit: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class JokeStorageService {
  private readonly STORAGE_KEY = 'custom_jokes';
  private customJokes = signal<CustomJoke[]>(this.loadFromStorage());

  getCustomJokes() {
    return this.customJokes.asReadonly();
  }

  addJoke(joke: Omit<CustomJoke, 'id' | 'flags'>): CustomJoke {
    const newJoke: CustomJoke = {
      id: Date.now(),
      ...joke,
      flags: {
        nsfw: false,
        religious: false,
        political: false,
        racist: false,
        sexist: false,
        explicit: false
      }
    };

    const current = this.customJokes();
    const updated = [newJoke, ...current];
    this.customJokes.set(updated);
    this.saveToStorage(updated);
    
    return newJoke;
  }

  removeJoke(id: number): void {
    const updated = this.customJokes().filter(joke => joke.id !== id);
    this.customJokes.set(updated);
    this.saveToStorage(updated);
  }

  private loadFromStorage(): CustomJoke[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(jokes: CustomJoke[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(jokes));
    } catch (error) {
      console.error('Failed to save jokes to localStorage:', error);
    }
  }
}
