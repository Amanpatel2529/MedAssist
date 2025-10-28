import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private apiService: ApiService) {}

  private getUserFromStorage(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  register(data: any): Observable<any> {
    return this.apiService.register(data).pipe(
      tap((response) => {
        if (response.token) {
          this.setToken(response.token);
          this.setUser(response.user);
        }
      })
    );
  }

  login(data: any): Observable<any> {
    return this.apiService.login(data).pipe(
      tap((response) => {
        if (response.token) {
          this.setToken(response.token);
          this.setUser(response.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    this.isAuthenticatedSubject.next(true);
  }

  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: any): void {
    this.setUser(user);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isDoctor(): boolean {
    return this.getCurrentUser()?.role === 'doctor';
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'admin';
  }

  isPatient(): boolean {
    return this.getCurrentUser()?.role === 'patient';
  }

  getProfile(): Observable<any> {
    return this.apiService.getProfile();
  }

  updateProfile(data: any): Observable<any> {
    return this.apiService.updateProfile(data);
  }

  changePassword(data: any): Observable<any> {
    return this.apiService.changePassword(data);
  }
}

