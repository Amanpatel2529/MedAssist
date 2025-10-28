import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    });
  }

  // Auth endpoints
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/profile`, { headers: this.getHeaders() });
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/profile`, data, { headers: this.getHeaders() });
  }

  changePassword(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/change-password`, data, { headers: this.getHeaders() });
  }

  // Chat endpoints
  createChat(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/chats`, data, { headers: this.getHeaders() });
  }

  getChatHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/chats`, { headers: this.getHeaders() });
  }

  getChat(chatId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/chats/${chatId}`, { headers: this.getHeaders() });
  }

  sendMessage(chatId: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/chats/${chatId}/messages`, data, {
      headers: this.getHeaders(),
    });
  }

  deleteChat(chatId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/chats/${chatId}`, { headers: this.getHeaders() });
  }

  updateChatTitle(chatId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/chats/${chatId}/title`, data, {
      headers: this.getHeaders(),
    });
  }

  // Doctor endpoints
  registerDoctor(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/doctors/register`, data, { headers: this.getHeaders() });
  }

  getDoctorProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors/profile`, { headers: this.getHeaders() });
  }

  updateDoctorProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/doctors/profile`, data, { headers: this.getHeaders() });
  }

  getPatientConsultations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors/consultations`, { headers: this.getHeaders() });
  }

  updateConsultation(consultationId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/doctors/consultations/${consultationId}`, data, {
      headers: this.getHeaders(),
    });
  }

  getPatientHistory(patientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors/patients/${patientId}/history`, {
      headers: this.getHeaders(),
    });
  }

  createReferral(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/doctors/referrals`, data, { headers: this.getHeaders() });
  }

  getAvailableDoctors(specialization?: string): Observable<any> {
    let url = `${this.apiUrl}/doctors/available`;
    if (specialization) {
      url += `?specialization=${specialization}`;
    }
    return this.http.get(url, { headers: this.getHeaders() });
  }

  updateAvailability(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/doctors/availability`, data, { headers: this.getHeaders() });
  }

  // Admin endpoints
  getAllUsers(role?: string): Observable<any> {
    let url = `${this.apiUrl}/admin/users`;
    if (role) {
      url += `?role=${role}`;
    }
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/users/${userId}`, { headers: this.getHeaders() });
  }

  updateUserRole(userId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/${userId}/role`, data, {
      headers: this.getHeaders(),
    });
  }

  toggleUserActive(userId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/${userId}/toggle-active`, data, {
      headers: this.getHeaders(),
    });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/users/${userId}`, { headers: this.getHeaders() });
  }

  getPendingDoctors(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/doctors/pending`, { headers: this.getHeaders() });
  }

  approveDoctorRegistration(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/doctors/${userId}/approve`, {}, {
      headers: this.getHeaders(),
    });
  }

  getCriticalReferrals(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/referrals/critical`, { headers: this.getHeaders() });
  }

  getSystemStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/stats`, { headers: this.getHeaders() });
  }
}

