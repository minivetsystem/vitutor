import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';

export interface IRequestOptions {
  headers?: HttpHeaders;
  observe?: 'body';
  params?: HttpParams;
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  body?: any;
}

export function applicationHttpClientCreator(http: HttpClient) {
  return new ApplicationHttpClient(http);
}

@Injectable()
export class ApplicationHttpClient {

  private api = '';

  private formatErrors(error) {
    return throwError(error);
  }
  returnJsonResponse(response: any) {
      return response.json();
  }
  // Extending the HttpClient through the Angular DI.
  public constructor(public http: HttpClient) {
    // If you don't want to use the extended versions in some cases you can access the public property and use the original one.
    // for ex. this.httpClient.http.get(...)
  }

  /**
   * GET request
   * @param {string} endPoint it doesn't need / in front of the end point
   * @param {IRequestOptions} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */
  public get(endPoint: string, options?: IRequestOptions): Observable<any> {
    return this.http.get(this.api + endPoint, options)
    .pipe(map((resp: Response) => this.returnJsonResponse(resp) ), catchError( this.formatErrors ) );
  }

  /**
   * POST request
   * @param {string} endPoint end point of the api
   * @param {Object} params body of the request.
   * @param {IRequestOptions} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */
  public post(endPoint: string, params: Object, options?: IRequestOptions): Observable<any> {
    return this.http.post(this.api + endPoint, params, options)
    .pipe(map((resp: Response) => this.returnJsonResponse(resp) ), catchError( this.formatErrors ) );
  }

  /**
   * PUT request
   * @param {string} endPoint end point of the api
   * @param {Object} params body of the request.
   * @param {IRequestOptions} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */
  public put(endPoint: string, params: Object, options?: IRequestOptions): Observable<any> {
    return this.http.put(this.api + endPoint, params, options);
  }

  /**
   * DELETE request
   * @param {string} endPoint end point of the api
   * @param {IRequestOptions} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */
  public delete(endPoint: string, options?: IRequestOptions): Observable<any> {
    return this.http.delete(this.api + endPoint, options);
  }
}
