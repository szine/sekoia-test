import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdateService } from './core/services/sw-update.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // Initialize service worker update service
  private readonly swUpdate = inject(SwUpdateService);
}
