import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  chats: any[] = [];
  currentUser: any;
  loading = false;
  error = '';

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadChats();
  }

  loadChats(): void {
    this.loading = true;
    this.chatService.getChatHistory().subscribe({
      next: (response) => {
        this.chats = response.chats;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load chats';
        this.loading = false;
      },
    });
  }

  createNewChat(): void {
    this.chatService.createChat({ title: `Chat - ${new Date().toLocaleDateString()}` }).subscribe({
      next: (response) => {
        this.router.navigate(['/chat', response.chat.id]);
      },
      error: (error) => {
        this.error = 'Failed to create chat';
      },
    });
  }

  openChat(chatId: string): void {
    this.router.navigate(['/chat', chatId]);
  }

  deleteChat(chatId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      this.chatService.deleteChat(chatId).subscribe({
        next: () => {
          this.loadChats();
        },
        error: (error) => {
          this.error = 'Failed to delete chat';
        },
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}

