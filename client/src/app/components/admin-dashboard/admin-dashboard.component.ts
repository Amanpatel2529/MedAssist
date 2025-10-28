import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  currentUser: any;
  users: any[] = [];
  pendingDoctors: any[] = [];
  stats: any = {};
  loading = false;
  error = '';
  activeTab = 'users';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.apiService.getAllUsers().subscribe({
      next: (response) => {
        this.users = response.users;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load users';
        this.loading = false;
      },
    });

    this.apiService.getPendingDoctors().subscribe({
      next: (response) => {
        this.pendingDoctors = response.doctors;
      },
      error: (error) => {
        console.error('Failed to load pending doctors');
      },
    });

    this.apiService.getSystemStats().subscribe({
      next: (response) => {
        this.stats = response.stats;
      },
      error: (error) => {
        console.error('Failed to load stats');
      },
    });
  }

  updateUserRole(userId: string, role: string): void {
    this.apiService.updateUserRole(userId, { role }).subscribe({
      next: (response) => {
        this.loadData();
      },
      error: (error) => {
        this.error = 'Failed to update user role';
      },
    });
  }

  toggleUserActive(userId: string): void {
    this.apiService.toggleUserActive(userId, {}).subscribe({
      next: (response) => {
        this.loadData();
      },
      error: (error) => {
        this.error = 'Failed to toggle user status';
      },
    });
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.apiService.deleteUser(userId).subscribe({
        next: (response) => {
          this.loadData();
        },
        error: (error) => {
          this.error = 'Failed to delete user';
        },
      });
    }
  }

  approveDoctorRegistration(userId: string): void {
    this.apiService.approveDoctorRegistration(userId).subscribe({
      next: (response) => {
        this.loadData();
      },
      error: (error) => {
        this.error = 'Failed to approve doctor';
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
  }
}

