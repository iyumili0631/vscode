import { Injectable } from '@angular/core';
import { UUID } from 'angular2-uuid';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private clientId: string;
  constructor() { /* fix SonarQube bug */ }

  generateClientId(): void {
    this.clientId = UUID.UUID().replace(/-/g, '').toLocaleUpperCase();
  }

  getClientId(): string {
    return this.clientId;
  }
}
