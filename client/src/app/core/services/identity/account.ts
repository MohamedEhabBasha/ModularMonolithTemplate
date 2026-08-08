import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Address, User } from '../../../shared/models/identity/user';
import { firstValueFrom } from 'rxjs';
import { RegisterRequest } from '../../../shared/models/identity/register';
import { LoginRequest } from '../../../shared/models/identity/login';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  currentUser = signal<User | null>(null);

  private refreshAntiforgeryToken() {
    return firstValueFrom(this.http.get(`${this.baseUrl}antiforgery/token`));
  }

  async register(request: RegisterRequest) {
    await firstValueFrom(this.http.post(`${this.baseUrl}identity/register`, request));
    await this.refreshAntiforgeryToken(); // re-mint for the now-authenticated identity
    await this.loadCurrentUser();
  }

  async login(request: LoginRequest) {
    await firstValueFrom(this.http.post(`${this.baseUrl}identity/login`, request));
    await this.refreshAntiforgeryToken();
    await this.loadCurrentUser();
  }

  async logout() {
    await firstValueFrom(this.http.post(`${this.baseUrl}identity/logout`, {}));
    this.currentUser.set(null);
    await this.refreshAntiforgeryToken(); // re-mint for anonymous again
  }

  async loadCurrentUser() {
    const user = await firstValueFrom(this.http.get<User>(`${this.baseUrl}identity/user-info`));
    this.currentUser.set(user);
    return user;
  }

  async checkAuthState(): Promise<boolean> {
    const state = await firstValueFrom(
      this.http.get<{ isAuthenticated: boolean }>(`${this.baseUrl}identity/user-state`),
    );
    return state.isAuthenticated;
  }

  async updateAddress(address: Address) {
    return await firstValueFrom(this.http.post(this.baseUrl + 'identity/address', address));
  }

  // Runs once on app bootstrap — see app.config.ts
  async bootstrap() {
    await this.refreshAntiforgeryToken();
    if (await this.checkAuthState()) {
      await this.loadCurrentUser();
    }
  }
}
