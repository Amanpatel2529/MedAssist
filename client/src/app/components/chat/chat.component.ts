import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; // ✅ CORRECTED IMPORT
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  chatId: string = '';
  messages: any[] = [];
  messageText = '';
  loading = false;
  error = '';
  currentUser: any;
  shouldScroll = false;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.route.params.subscribe((params) => {
      this.chatId = params['id'];
      if (this.chatId) {
        this.loadChat();
      }
    });

    this.chatService.messages$.subscribe((messages) => {
      this.messages = messages;
      this.shouldScroll = true;

      // ✅ Use requestAnimationFrame for guaranteed scroll after DOM update
      if (this.shouldScroll) {
        window.requestAnimationFrame(() => this.scrollToBottom());
      }
    });
  }

  // ngAfterViewChecked handles the initial load scroll.
  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  loadChat(): void {
    this.chatService.getChat(this.chatId).subscribe({
      next: (response) => {
        this.messages = response.messages;
        this.shouldScroll = true;
      },
      error: (error) => {
        this.error = 'Failed to load chat';
      },
    });
  }


  sendMessage(): void {
    if (!this.messageText.trim()) {
      return;
    }

    // 1. Immediately create and display the user's message for instant feedback
    const userMessage = {
      sender_type: 'user',
      message_text: this.messageText,
      created_at: new Date().toISOString(),
    };
    this.messages = [...this.messages, userMessage];

    // Clear the input and set loading state
    const messageToSend = this.messageText;
    this.messageText = '';
    this.loading = true;
    this.error = '';

    // 2. Scroll to the user's message
    window.requestAnimationFrame(() => this.scrollToBottom());

    // 3. Send the message to the backend
    this.chatService.sendMessage(this.chatId, messageToSend).subscribe({
      next: (response) => {
        // The subscription in ngOnInit handles updating 'messages' and scrolling for the AI response
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Failed to send message';
      },
    });
  }

  scrollToBottom(): void {
    try {
      if (this.messagesContainer && this.messagesContainer.nativeElement) {
        // Ensure that the scroll is done on the element with fixed height and overflow
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  isCritical(message: any): boolean {
    return message.is_critical === true;
  }

  isUserMessage(message: any): boolean {
    return message.sender_type === 'user';
  }

  isAIMessage(message: any): boolean {
    return message.sender_type === 'ai';
  }

  formatMessage(text: string): SafeHtml {
    if (!text) return '';

    // Convert markdown-like formatting to HTML
    let formatted = text
      // Bold text: **text** -> <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text: *text* -> <em>text</em>
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Headers: # text -> <h3>text</h3>
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      // Code blocks: `code` -> <code>code</code>
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Links: [text](url) -> <a href="url">text</a>
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Handle line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    // Basic list wrapping
    formatted = formatted.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');
    formatted = formatted.replace(/<\/ul>\s*<ul>/g, '');
    formatted = formatted.replace(/<br><br>/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }
}