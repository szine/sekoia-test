export type JokeCategory = 'Misc' | 'Programming' | 'Dark' | 'Pun' | 'Spooky' | 'Christmas' | 'Custom';

export interface Joke {
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
