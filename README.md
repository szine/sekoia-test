# WikiJokes Application

Application Angular pour afficher et gérer des blagues avec recherche en temps réel et ajout de blagues personnalisées.

## Prérequis

- Node.js (version 18 ou supérieure)
- npm (version 9 ou supérieure)

## Installation

1. Cloner le repository
2. Installer les dépendances :

```bash
npm install
```

## Démarrage de l'application

### Mode développement

Pour démarrer l'application en mode développement :

```bash
npm start
```

ou

```bash
ng serve
```

L'application sera accessible à l'adresse : `http://localhost:4200`

### Build de production

Pour créer un build de production :

```bash
npm run build
```

ou

```bash
ng build
```

Les fichiers de build seront générés dans le dossier `dist/`.

## Tests

### Tests unitaires

Pour exécuter les tests unitaires avec Karma :

```bash
npm test
```

ou

```bash
ng test
```

Pour exécuter les tests en mode headless (sans interface) :

```bash
ng test --browsers=ChromeHeadless --watch=false
```

Pour exécuter les tests avec couverture de code :

```bash
ng test --code-coverage
```

Le rapport de couverture sera généré dans le dossier `coverage/`.

### Tests end-to-end (E2E)

Les tests E2E utilisent Playwright.

Pour installer Playwright (première utilisation) :

```bash
npx playwright install
```

Pour exécuter les tests E2E :

```bash
npm run e2e
```

ou

```bash
npx playwright test
```

Pour exécuter les tests E2E en mode UI (interface interactive) :

```bash
npx playwright test --ui
```

Pour exécuter les tests E2E en mode debug :

```bash
npx playwright test --debug
```

Pour voir le rapport des tests E2E :

```bash
npx playwright show-report
```

## Structure du projet

```
src/
├── app/
│   ├── core/
│   │   └── services/          # Services partagés (API, stockage, i18n)
│   ├── features/
│   │   ├── home/              # Page d'accueil avec liste de blagues
│   │   └── add-joke-dialog/   # Dialogue d'ajout de blague
│   ├── models/                # Modèles de données
│   └── shared/
│       └── components/        # Composants réutilisables
├── styles/
│   └── _variables.scss        # Variables SCSS globales
└── environments/              # Configuration d'environnement
```

## Fonctionnalités

### Recherche de blagues
- Recherche en temps réel avec debounce (500ms)
- Filtrage automatique des blagues offensantes
- Affichage des résultats avec tags

### Ajout de blagues personnalisées
- Dialogue latéral accessible via le bouton "+"
- Validation (minimum 10 caractères)
- Stockage local dans le navigateur
- Deep-linking avec query param `?addJoke=true`

### Accessibilité
- Navigation au clavier complète
- Focus trap dans les dialogues
- ARIA labels et live regions
- Support des lecteurs d'écran

## Technologies utilisées

- Angular 20.3.x
- TypeScript
- SCSS avec variables personnalisées
- RxJS pour la gestion asynchrone
- Signals pour la réactivité
- Playwright pour les tests E2E
- Karma/Jasmine pour les tests unitaires

## API

L'application utilise l'API JokeAPI v2 : `https://v2.jokeapi.dev/joke/Any`

Les blagues avec les flags suivants sont automatiquement filtrées :
- nsfw
- religious
- political
- racist
- sexist
- explicit

## Commandes utiles

### Linting

```bash
ng lint
```

### Format du code

Si ESLint est configuré avec fix :

```bash
ng lint --fix
```

### Analyse du bundle

```bash
ng build --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

## Troubleshooting

### L'application ne démarre pas

Vérifiez que toutes les dépendances sont installées :

```bash
npm ci
```

### Les tests E2E échouent

Assurez-vous que les navigateurs Playwright sont installés :

```bash
npx playwright install --with-deps
```

### Erreurs de compilation SCSS

Vérifiez que le fichier `src/styles/_variables.scss` existe et contient toutes les variables nécessaires.

## Support

Pour toute question ou problème, veuillez créer une issue dans le repository.
