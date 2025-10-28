import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css'],
})
export class DoctorDashboardComponent implements OnInit {
  currentUser: any;
  consultations: any[] = [];
  referrals: any[] = [];
  loading = false;
  error = '';
  activeTab = 'consultations';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || this.currentUser.role !== 'doctor') {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadConsultations();
  }

  loadConsultations(): void {
    this.loading = true;
    this.apiService.getPatientConsultations().subscribe({
      next: (response) => {
        this.consultations = response.consultations;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load consultations';
        this.loading = false;
      },
    });
  }

  updateConsultationStatus(consultationId: string, status: string): void {
    this.apiService
      .updateConsultation(consultationId, { status })
      .subscribe({
        next: (response) => {
          this.loadConsultations();
        },
        error: (error) => {
          this.error = 'Failed to update consultation';
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

