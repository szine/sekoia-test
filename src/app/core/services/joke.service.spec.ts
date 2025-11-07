import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { JokeService, JokeApiResponse } from './joke.service';
import { Joke } from '../../models/joke.model';

describe('JokeService', () => {
  let service: JokeService;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://v2.jokeapi.dev/joke/Any';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        JokeService
      ]
    });
    service = TestBed.inject(JokeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getJokes', () => {
    it('should build correct params for empty query', (done) => {
      const mockResponse: JokeApiResponse = {
        error: false,
        amount: 10,
        jokes: []
      };

      service.getJokes('').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne((request) => {
        return request.url === baseUrl &&
          request.params.get('amount') === '10' &&
          request.params.get('blacklistFlags') === 'nsfw,religious,political,racist,sexist,explicit' &&
          !request.params.has('contains');
      });

      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should build correct params for non-empty query', (done) => {
      const query = 'programming';
      const mockResponse: JokeApiResponse = {
        error: false,
        amount: 10,
        jokes: []
      };

      service.getJokes(query).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne((request) => {
        return request.url === baseUrl &&
          request.params.get('amount') === '10' &&
          request.params.get('blacklistFlags') === 'nsfw,religious,political,racist,sexist,explicit' &&
          request.params.get('contains') === query;
      });

      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle single type jokes', (done) => {
      const mockJoke: Joke = {
        id: 1,
        type: 'single',
        joke: 'This is a funny joke',
        category: 'Programming',
        flags: {
          nsfw: false,
          religious: false,
          political: false,
          racist: false,
          sexist: false,
          explicit: false
        }
      };

      const mockResponse: JokeApiResponse = {
        error: false,
        amount: 1,
        jokes: [mockJoke]
      };

      service.getJokes('').subscribe((result) => {
        expect(result.jokes.length).toBe(1);
        expect(result.jokes[0].type).toBe('single');
        expect(result.jokes[0].joke).toBe('This is a funny joke');
        expect(result.error).toBeUndefined();
        done();
      });

      const req = httpMock.expectOne((request) => request.url === baseUrl);
      req.flush(mockResponse);
    });

    it('should handle twopart type jokes', (done) => {
      const mockJoke: Joke = {
        id: 2,
        type: 'twopart',
        setup: 'Why did the chicken cross the road?',
        delivery: 'To get to the other side!',
        category: 'Misc',
        flags: {
          nsfw: false,
          religious: false,
          political: false,
          racist: false,
          sexist: false,
          explicit: false
        }
      };

      const mockResponse: JokeApiResponse = {
        error: false,
        amount: 1,
        jokes: [mockJoke]
      };

      service.getJokes('').subscribe((result) => {
        expect(result.jokes.length).toBe(1);
        expect(result.jokes[0].type).toBe('twopart');
        expect(result.jokes[0].setup).toBe('Why did the chicken cross the road?');
        expect(result.jokes[0].delivery).toBe('To get to the other side!');
        expect(result.error).toBeUndefined();
        done();
      });

      const req = httpMock.expectOne((request) => request.url === baseUrl);
      req.flush(mockResponse);
    });

    it('should propagate API error with friendly message', (done) => {
      const mockResponse: JokeApiResponse = {
        error: true,
        amount: 0,
        message: 'No matching joke found'
      };

      service.getJokes('veryrarequery').subscribe((result) => {
        expect(result.jokes.length).toBe(0);
        expect(result.error).toBe('No jokes found matching your search criteria. Try a different search term.');
        done();
      });

      const req = httpMock.expectOne((request) => request.url === baseUrl);
      req.flush(mockResponse);
    });

    it('should handle HTTP 404 error', (done) => {
      service.getJokes('').subscribe({
        error: (error) => {
          expect(error.jokes.length).toBe(0);
          expect(error.error).toBe('Invalid request. Please try again.');
          done();
        }
      });

      const req = httpMock.expectOne((request) => request.url === baseUrl);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle HTTP 500 error', (done) => {
      service.getJokes('').subscribe({
        error: (error) => {
          expect(error.jokes.length).toBe(0);
          expect(error.error).toBe('The joke service is currently unavailable. Please try again later.');
          done();
        }
      });

      const req = httpMock.expectOne((request) => request.url === baseUrl);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle network error', (done) => {
      service.getJokes('').subscribe({
        error: (error) => {
          expect(error.jokes.length).toBe(0);
          expect(error.error).toBe('Unable to connect to the joke service. Please check your internet connection.');
          done();
        }
      });

      const req = httpMock.expectOne((request) => request.url === baseUrl);
      req.error(new ProgressEvent('error'), { status: 0 });
    });

    it('should trim whitespace from query', (done) => {
      const query = '  programming  ';
      const mockResponse: JokeApiResponse = {
        error: false,
        amount: 10,
        jokes: []
      };

      service.getJokes(query).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne((request) => {
        const containsParam = request.params.get('contains');
        expect(containsParam).toBe('programming');
        return containsParam === 'programming';
      });

      req.flush(mockResponse);
    });
  });
});
