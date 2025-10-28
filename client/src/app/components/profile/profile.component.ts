import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  currentUser: any;
  editMode = false;
  loading = false;
  error = '';
  success = '';

  // Form fields
  name = '';
  email = '';
  phone = '';
  age = '';
  gender = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadProfile();
  }

  loadProfile(): void {
    this.apiService.getProfile().subscribe({
      next: (response) => {
        this.currentUser = response.user;
        this.name = this.currentUser.name;
        this.email = this.currentUser.email;
        this.phone = this.currentUser.phone || '';
        this.age = this.currentUser.age || '';
        this.gender = this.currentUser.gender || '';
      },
      error: (error) => {
        this.error = 'Failed to load profile';
      },
    });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    this.error = '';
    this.success = '';
  }

  updateProfile(): void {
    if (!this.name || !this.email) {
      this.error = 'Name and email are required';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.apiService
      .updateProfile({
        name: this.name,
        email: this.email,
        phone: this.phone,
        age: this.age ? parseInt(this.age) : null,
        gender: this.gender,
      })
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.success = 'Profile updated successfully';
          this.currentUser = response.user;
          this.authService.setCurrentUser(response.user);
          setTimeout(() => {
            this.editMode = false;
            this.success = '';
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Failed to update profile';
        },
      });
  }

  changePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.error = 'All password fields are required';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'New passwords do not match';
      return;
    }

    if (this.newPassword.length < 8) {
      this.error = 'New password must be at least 8 characters';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.apiService
      .changePassword({
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.success = 'Password changed successfully';
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
          setTimeout(() => {
            this.success = '';
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Failed to change password';
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}

