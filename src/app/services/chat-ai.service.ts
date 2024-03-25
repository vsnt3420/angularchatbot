import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import parse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import rehype from 'remark-rehype';
import katex from 'rehype-katex';
import stringify from 'rehype-stringify';
import { unified } from 'unified';
import { SafeHtml } from '@angular/platform-browser';
@Injectable({
  providedIn: 'root'
})
export class ChatAIService {
  private apiUrl: string = environment.PUBLIC_API_URL;
  private apiKey: string = environment.PUBLIC_API_KEY;
  private accountId: string = environment.PUBLIC_ACCOUNT_ID;

  processText(inputText: string): Observable<SafeHtml> {
    const resultPromise = unified()
      .use(parse)
      .use(remarkGfm)
      .use(rehype)
      .use(katex)
      .use(stringify)
      .process(inputText)

    return from(resultPromise)
      .pipe(
        catchError((error: any) => {
          console.error('Error processing text:', error);
          return throwError('Error processing text.');
        })
      );
  }


  constructor(private http: HttpClient) { }

  sendPrompt(prompt: string): Observable<any> {
    const conversations = [{ role: 'system', content: 'Hello, welcome to the chatbot.' }, { role: 'user', content: prompt }];
    const requestData = {
      conversations,
      max_tokens: 512,
      do_sample: true,
      temperature: 0.5,
      top_p: 0.8,
      top_k: 50,
      repetition_penalty: 1.05,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'auth-key': `api-key ${this.apiKey}`,
      'account-id': this.accountId,
    });
    const resultPromise = unified()
      .use(parse)
      .use(remarkGfm)
      .use(rehype)
      .use(katex)
      .use(stringify)
      .process(prompt);

    return from(resultPromise)
      .pipe(
        catchError((error: any) => {
          console.error('Error processing text:', error);
          return throwError('Error processing text.');
        }),
        // Send prompt to API after processing the text
        switchMap(() => this.http.post<any>(this.apiUrl, requestData, { headers })),
        catchError(this.handleError)
      );
  }


  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 422) {
      console.error('Unprocessable Entity Error:', error.error);
    } else {
      console.error('API Error:', error);
    }
    return throwError('Error processing your request.');
  }
}
