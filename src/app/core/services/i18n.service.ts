import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
  addJoke: {
    title: string;
    setupLabel: string;
    setupPlaceholder: string;
    deliveryLabel: string;
    deliveryPlaceholder: string;
    jokeLabel: string;
    jokePlaceholder: string;
    setupHint: string;
    deliveryHint: string;
    jokeHint: string;
    cancel: string;
    add: string;
    errorRequired: string;
  };
  toast: {
    jokeAdded: string;
  };
}

// Default fallback translations (used during tests or if loading fails)
const defaultTranslations: Record<Language, Translations> = {
  en: {
    search: { placeholder: 'find a joke', button: 'Search', label: 'Search' },
    loading: { message: 'Loading jokes...' },
    empty: { title: 'No jokes found', message: 'Try adjusting your search criteria or search for something else.' },
    error: { retry: 'Retry' },
    home: { title: 'WikiJokes', resultsHeading: 'Jokes' },
    addJoke: {
      title: 'Add Your Joke',
      setupLabel: 'Setup',
      setupPlaceholder: 'Enter the setup...',
      deliveryLabel: 'Delivery',
      deliveryPlaceholder: 'Enter the punchline...',
      jokeLabel: 'Joke',
      jokePlaceholder: 'Enter your joke...',
      setupHint: 'The first part of your two-part joke',
      deliveryHint: 'The punchline of your joke',
      jokeHint: 'Your complete joke in one part',
      cancel: 'Cancel',
      add: 'Add Joke',
      errorRequired: 'Please fill in all required fields'
    },
    toast: { jokeAdded: 'Joke added successfully!' }
  },
  fr: {
    search: { placeholder: 'trouver une blague', button: 'Rechercher', label: 'Rechercher' },
    loading: { message: 'Chargement des blagues...' },
    empty: { title: 'Aucune blague trouvée', message: 'Essayez d\'ajuster vos critères de recherche ou recherchez autre chose.' },
    error: { retry: 'Réessayer' },
    home: { title: 'WikiJokes', resultsHeading: 'Blagues' },
    addJoke: {
      title: 'Ajouter une Blague Personnalisée',
      setupLabel: 'Introduction',
      setupPlaceholder: 'Entrez l\'introduction...',
      deliveryLabel: 'Chute',
      deliveryPlaceholder: 'Entrez la chute...',
      jokeLabel: 'Blague',
      jokePlaceholder: 'Entrez votre blague...',
      setupHint: 'La première partie de votre blague en deux parties',
      deliveryHint: 'La chute de votre blague',
      jokeHint: 'Votre blague complète en une seule partie',
      cancel: 'Annuler',
      add: 'Ajouter la Blague',
      errorRequired: 'Veuillez remplir tous les champs requis'
    },
    toast: { jokeAdded: 'Blague ajoutée avec succès !' }
  }
};

// Translations are loaded from JSON files
const translations = signal<Record<Language, Translations>>(defaultTranslations);

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly http = inject(HttpClient);
  private readonly STORAGE_KEY = 'language-preference';
  private readonly currentLanguage = signal<Language>(this.getInitialLanguage());
  private translationsLoaded = false;
  
  readonly t = computed(() => translations()[this.currentLanguage()]);
  readonly language = this.currentLanguage.asReadonly();

  constructor() {
    this.loadTranslations();
  }

  private loadTranslations(): void {
    // Use HttpClient to load translations (works with PWA and tests)
    Promise.all([
      this.http.get<Translations>('/assets/i18n/en.json').toPromise(),
      this.http.get<Translations>('/assets/i18n/fr.json').toPromise()
    ])
      .then(([enData, frData]) => {
        if (enData && frData) {
          translations.set({
            en: enData,
            fr: frData
          });
          this.translationsLoaded = true;
        }
      })
      .catch(error => {
        // Silently fail in tests or if files are not found
        // Default translations are already loaded
        if (typeof window !== 'undefined' && !window.location.href.includes('localhost:9876')) {
          console.warn('Using default translations. Could not load translation files:', error);
        }
      });
  }

  setLanguage(lang: Language): void {
    this.currentLanguage.set(lang);
    this.saveLanguage(lang);
  }

  getLanguage(): Language {
    return this.currentLanguage();
  }

  private getInitialLanguage(): Language {
    // Check localStorage first
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored === 'en' || stored === 'fr') {
      return stored;
    }

    // Fall back to browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('fr')) {
      return 'fr';
    }

    return 'en';
  }

  private saveLanguage(lang: Language): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, lang);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  }
}
