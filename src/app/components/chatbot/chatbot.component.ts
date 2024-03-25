import { Component } from '@angular/core';
import {  SafeHtml } from '@angular/platform-browser';
import { ChangeDetectorRef } from '@angular/core';
import { ChatAIService } from 'src/app/services/chat-ai.service';
interface User {
  id: number;
}

interface Message {
  author: User;
  text: string;
  timestamp: Date;
}
@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  public user: User = { id: 1 };
  public textareaMessages: Message[] = [];
  public showCopyButton: boolean = false;
  public userMessage: string = '';
  public loading: boolean = false;

  constructor(private nelaAI: ChatAIService,private cdr: ChangeDetectorRef) { }


  public async sendUserMessage(): Promise<void> {
    const userMessage = this.userMessage.trim();
    if (!userMessage) return;

    const message: Message = {
      author: this.user,
      text: userMessage,
      timestamp: new Date(),
    };

    this.textareaMessages = [...this.textareaMessages, message];
    this.userMessage = '';
    this.loading = true;

    try {
      const response = await this.nelaAI.sendPrompt(userMessage).toPromise();

      const markdownText = response?.output[0]?.data;
      if (markdownText !== undefined) {
        const processedText: SafeHtml | undefined = await this.nelaAI.processText(markdownText as string).toPromise();

        if (processedText !== undefined) {
          const botMessage: Message = {
            author: { id: 0 },
            text: processedText.toString(),
            timestamp: new Date(),
          };

          this.textareaMessages = [...this.textareaMessages, botMessage];
          this.showCopyButton = !!botMessage.text;
        }
      }
    } catch (error) {
      console.error('Error in sendUserMessage:', error);

      const errorMessage: Message = {
        author: { id: 0 },
        text: 'Error processing ........',
        timestamp: new Date(),
      };

      this.textareaMessages = [...this.textareaMessages, errorMessage];
      this.showCopyButton = false;
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); 
    }
  }


  updateTextarea(prompt: string): void {
    this.userMessage = prompt;
  }
}
