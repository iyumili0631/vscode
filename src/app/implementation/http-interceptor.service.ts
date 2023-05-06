import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { DW_AUTH_TOKEN } from '@webdpt/framework/auth';
import { DwLanguageService } from '@webdpt/framework/language';
import { DwSystemConfigService } from '@webdpt/framework/config';
import { Inject, Injectable } from '@angular/core';
import { DynamicFormDataService, isObject, convertStrDate, isNone } from '@ng-dynamic-forms/core';
import { UUID } from 'angular2-uuid';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AppErrorHandleService } from './http-error-handle.service';
import { CookieUtil } from './utils.ts/cookie-util';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  whiteList: string[] = ['iam', 'emc', 'eoc'];

  constructor(
    @Inject(DW_AUTH_TOKEN) protected authToken: any,
    private languageService: DwLanguageService,
    private messageService: NzMessageService,
    private dateFormateService: DynamicFormDataService,
    private config: DwSystemConfigService,
    private appErrorHandleService: AppErrorHandleService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    req = req.clone({
      headers: req.headers.delete('noCommonTipError'),
    });
    req = req.clone({
      setHeaders: {
        'X-Requested-With': UUID.UUID(),
      },
    });

    if (this.languageService && this.languageService.currentLanguage) {
      req = req.clone({
        setHeaders: {
          locale: this.languageService.currentLanguage,
        },
      });
    }
    if (this.authToken.token && !req.headers.get('token')) {
      req = req.clone({
        setHeaders: {
          token: this.authToken.token,
        },
      });
    }

    if (this.authToken.token && !req.headers.get('digi-middleware-auth-user')) {
      req = req.clone({
        setHeaders: {
          'digi-middleware-auth-user': this.authToken.token,
        },
      });
    }

    if (
      (req.url.includes('/bot/') || req.url.includes('/atmc/') || req.url.includes('/atdm/')) &&
      sessionStorage.getItem('proxyToken') &&
      !req.headers.get('proxy_token')
    ) {
      req = req.clone({
        setHeaders: {
          proxy_token: sessionStorage.getItem('proxyToken'),
        },
      });
    }

    req = req.clone({
      setHeaders: {
        'client-agent': 'webplatform',
      },
    });

    const { url } = req;
    // uibotUrl、atmcUrl、atdmUrl、smartDataUrl、themeMapUrl、bpmUrl 添加routerKey，租户id
    if (
      url.includes('uibot') ||
      url.includes('atmc') ||
      url.includes('atdm') ||
      url.includes('smartdata') ||
      url.includes('thememap') ||
      url.includes('flowengine')
    ) {
      const tenantId = JSON.parse(sessionStorage.getItem('DwUserInfo'))?.tenantId ?? '';
      req = req.clone({
        setHeaders: {
          routerKey: tenantId,
        },
      });

      if (CookieUtil.get('routerKey') !== tenantId) {
        CookieUtil.set('routerKey', tenantId);
      }
    }

    if (req && req.body) {
      if (req.body['data']) {
        this.dateFormateService.formatDate(req.body['data']);
      } else {
        this.dateFormateService.formatDate(req.body);
      }
      this.convertAllStrDateFromData(req.body, true);
    }

    return next.handle(req).pipe(
      tap((event) => { /* fix SonarQube bug */ }),
      map((res: HttpResponse<any>) => {
        if (isObject(res) && res instanceof HttpResponse && isObject(res.body)) {
          const { body } = res as any;
          if (this.whiteList.every((item) => !res?.url?.includes(item)) && body.status) {
            if (body.status === 200) {
              res = res.clone({
                body: {
                  code: 0,
                  data: body.response,
                },
              });
            } else {
              console.error(res);
              const { errorMessage, statusDescription } = body;
              const message = errorMessage || statusDescription;
              this.messageService.error(message);
              throw new HttpErrorResponse({
                error: { errorMessage: message, errorCode: body.errorCode, code: body.status },
                headers: res.headers,
                status: body.status,
                statusText: body.status,
                url: res?.url,
              });
            }
          } else {
            if (body.code && body.code !== 200) {
              console.error(res);
              const { message } = body;
              if (message) {
                this.messageService.error(message);
              }
              throw new HttpErrorResponse({
                error: { errorMessage: message, errorCode: body.code },
                headers: res.headers,
                status: body.code,
                statusText: body.code,
                url: res.url,
              });
            }
          }
          this.convertAllStrDateFromData(res.body);
        }
        return res;
      }),
      catchError((error: any) => {
        this.appErrorHandleService.handleError(error);
        throw error;
      })
    );
  }


  convertAllStrDateFromData(data: any, isReverse: boolean = false): void {
    // tslint:disable-next-line: forin
    // eslint-disable-next-line guard-for-in
    for (const propName in data) {
      const prop = data[propName];
      const descriptor = Reflect.getOwnPropertyDescriptor(data, propName);
      if (isNone(descriptor) || !descriptor.writable) {
        continue;
      }
      if (typeof prop === 'string') {
        data[propName] = convertStrDate(prop, isReverse);
      } else if (prop instanceof Array) {
        for (let index = 0; index < prop.length; index++) {
          const element = prop[index];
          if (typeof element === 'string') {
            prop[index] = convertStrDate(element, isReverse);
          } else {
            this.convertAllStrDateFromData(element, isReverse);
          }
        }
      } else if (isObject(prop) && (prop !== null || prop !== undefined)) {
        this.convertAllStrDateFromData(prop, isReverse);
      }
    }
  }
}
