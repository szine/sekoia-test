import { Injectable, signal, computed } from '@angular/core';

export type Language = 'en' | 'fr';

export interface Translations {
  search: {
    placeholder: string;
    button: string;
    label: string;
  };
  loading: {
    message: string;
  };
  empty: {
    title: string;
    message: string;
  };
  error: {
    retry: string;
  };
  home: {
    title: string;
    resultsHeading: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    search: {
      placeholder: 'Search for jokes...',
      button: 'Search',
      label: 'Search jokes'
    },
    loading: {
      message: 'Loading jokes...'
    },
    empty: {
      title: 'No jokes found',
      message: 'Try adjusting your search criteria or search for something else.'
    },
    error: {
      retry: 'Retry'
    },
    home: {
      title: 'Joke Finder',
      resultsHeading: 'Jokes'
    }
  },
  fr: {
    search: {
      placeholder: 'Rechercher des blagues...',
      button: 'Rechercher',
      label: 'Rechercher des blagues'
    },
    loading: {
      message: 'Chargement des blagues...'
    },
    empty: {
      title: 'Aucune blague trouvée',
      message: 'Essayez d\'ajuster vos critères de recherche ou recherchez autre chose.'
    },
    error: {
      retry: 'Réessayer'
    },
    home: {
      title: 'Recherche de Blagues',
      resultsHeading: 'Blagues'
    }
  }
};

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly currentLanguage = signal<Language>('en');
  
  readonly t = computed(() => translations[this.currentLanguage()]);

  setLanguage(lang: Language): void {
    this.currentLanguage.set(lang);
  }

  getLanguage(): Language {
    return this.currentLanguage();
  }
}
