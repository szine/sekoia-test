import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Joke } from '../../models/joke.model';
import { I18nService } from './i18n.service';

export interface JokeApiResponse {
  error: boolean;
  amount: number;
  jokes?: Joke[];
  message?: string;
}

export interface JokeResult {
  jokes: Joke[];
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JokeService {
  private readonly http = inject(HttpClient);
  private readonly i18n = inject(I18nService);
  private readonly baseUrl = 'https://v2.jokeapi.dev/joke/Any';
  private readonly blacklistFlags = ['nsfw', 'religious', 'political', 'racist', 'sexist', 'explicit'];

  getJokes(query: string): Observable<JokeResult> {
    let params = new HttpParams()
      .set('amount', '10')
      .set('lang', this.i18n.getLanguage())
      .set('blacklistFlags', this.blacklistFlags.join(','));

    if (query.trim()) {
      params = params.set('contains', query.trim());
    }

    return this.http.get<JokeApiResponse>(this.baseUrl, { params }).pipe(
      map(response => {
        if (response.error) {
          return {
            jokes: [],
            error: this.mapApiError(response.message || 'An error occurred while fetching jokes')
          };
        }
        return {
          jokes: response.jokes || []
        };
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => ({
          jokes: [],
          error: this.mapHttpError(error)
        }));
      })
    );
  }

  private mapApiError(message: string): string {
    if (message.includes('No matching joke')) {
      return 'No jokes found matching your search criteria. Try a different search term.';
    }
    return 'Unable to fetch jokes. Please try again later.';
  }

  private mapHttpError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Unable to connect to the joke service. Please check your internet connection.';
    }
    if (error.status >= 400 && error.status < 500) {
      return 'Invalid request. Please try again.';
    }
    if (error.status >= 500) {
      return 'The joke service is currently unavailable. Please try again later.';
    }
    return 'An unexpected error occurred. Please try again.';
  }
}
