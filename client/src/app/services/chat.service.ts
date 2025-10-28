import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private chatsSubject = new BehaviorSubject<any[]>([]);
  public chats$ = this.chatsSubject.asObservable();

  private currentChatSubject = new BehaviorSubject<any>(null);
  public currentChat$ = this.currentChatSubject.asObservable();

  private messagesSubject = new BehaviorSubject<any[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor(private apiService: ApiService) {}

  createChat(data: any): Observable<any> {
    return this.apiService.createChat(data).pipe(
      tap((response) => {
        this.currentChatSubject.next(response.chat);
        this.messagesSubject.next([]);
      })
    );
  }

  getChatHistory(): Observable<any> {
    return this.apiService.getChatHistory().pipe(
      tap((response) => {
        this.chatsSubject.next(response.chats);
      })
    );
  }

  getChat(chatId: string): Observable<any> {
    return this.apiService.getChat(chatId).pipe(
      tap((response) => {
        this.currentChatSubject.next(response.chat);
        this.messagesSubject.next(response.messages);
      })
    );
  }

  sendMessage(chatId: string, messageText: string): Observable<any> {
    return this.apiService.sendMessage(chatId, { message_text: messageText }).pipe(
      tap((response) => {
        const currentMessages = this.messagesSubject.value;
        currentMessages.push({
          id: response.userMessage.id,
          message_text: response.userMessage.message_text,
          sender_type: response.userMessage.sender_type,
          created_at: new Date(),
        });
        currentMessages.push({
          id: response.aiMessage.id,
          message_text: response.aiMessage.message_text,
          sender_type: response.aiMessage.sender_type,
          is_critical: response.aiMessage.is_critical,
          created_at: new Date(),
        });
        this.messagesSubject.next(currentMessages);
      })
    );
  }

  deleteChat(chatId: string): Observable<any> {
    return this.apiService.deleteChat(chatId).pipe(
      tap(() => {
        const chats = this.chatsSubject.value.filter((c) => c.id !== chatId);
        this.chatsSubject.next(chats);
      })
    );
  }

  updateChatTitle(chatId: string, title: string): Observable<any> {
    return this.apiService.updateChatTitle(chatId, { title }).pipe(
      tap(() => {
        const chats = this.chatsSubject.value.map((c) =>
          c.id === chatId ? { ...c, title } : c
        );
        this.chatsSubject.next(chats);
      })
    );
  }

  getCurrentChat(): any {
    return this.currentChatSubject.value;
  }

  getMessages(): any[] {
    return this.messagesSubject.value;
  }

  getChats(): any[] {
    return this.chatsSubject.value;
  }
}

