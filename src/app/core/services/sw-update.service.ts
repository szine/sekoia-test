import { Injectable, ApplicationRef, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, first, interval, concat } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SwUpdateService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly appRef = inject(ApplicationRef);

  constructor() {
    if (this.swUpdate.isEnabled) {
      this.checkForUpdates();
      this.handleUpdates();
    }
  }

  /**
   * Check for updates every 6 hours
   */
  private checkForUpdates(): void {
    // Wait for app to stabilize, then check every 6 hours
    const appIsStable$ = this.appRef.isStable.pipe(
      first(isStable => isStable === true)
    );
    const everySixHours$ = interval(6 * 60 * 60 * 1000);
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

    everySixHoursOnceAppIsStable$.subscribe(async () => {
      try {
        const updateFound = await this.swUpdate.checkForUpdate();
        if (updateFound) {
          console.log('New version available');
        }
      } catch (err) {
        console.error('Failed to check for updates:', err);
      }
    });
  }

  /**
   * Handle version updates - reload immediately to get fresh content
   */
  private handleUpdates(): void {
    this.swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      )
      .subscribe(evt => {
        console.log('New version ready:', evt.latestVersion);
        // Reload immediately to get the latest version
        document.location.reload();
      });
  }

  /**
   * Force check for updates
   */
  async checkNow(): Promise<boolean> {
    if (!this.swUpdate.isEnabled) {
      return false;
    }
    
    try {
      return await this.swUpdate.checkForUpdate();
    } catch (err) {
      console.error('Failed to check for updates:', err);
      return false;
    }
  }
}
