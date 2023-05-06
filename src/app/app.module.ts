import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FrameworkModule, DwIamModule, DwAuthService, DwUserService } from '@webdpt/framework';
import { SystemModule } from './config/system.module';
import { ImplementationModule } from './implementation/implementation.module';
import { SYSTEM_CONFIG } from './config/system-config';
import { NzDateConfig, NZ_DATE_CONFIG, NZ_I18N, zh_CN } from 'ng-zorro-antd/i18n';
import { NzConfig, NZ_CONFIG } from 'ng-zorro-antd/core/config';
import { ReactiveFormsModule } from '@angular/forms';
import { AppErrorHandleService } from './implementation/http-error-handle.service';
import { HttpInterceptorService } from './implementation/http-interceptor.service';
import { DynamicFormsAntUIModule } from '@ng-dynamic-forms/ui-ant-web';
import {
  DynamicFormsCoreModule,
  DynamicUserBehaviorCommService,
  DynamicUserBehaviorService,
  isEmpty,
  PluginLanguageStoreService,
  UserOrgInfoService
} from '@ng-dynamic-forms/core';
import { UUID } from 'angular2-uuid';

const ngZorroConfig: NzConfig = {
  message: {
    nzTop: 'calc(50% - 20px)',
    nzDuration: 2000,
  },
  notification: {
    nzPlacement: 'bottomRight',
  },
  select: {
    nzBackdrop: true,
  },
};

const ngZorroDateConfig: NzDateConfig = {
  firstDayOfWeek: 0,
};

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    HttpClientJsonpModule,
    FrameworkModule.forRoot([], SYSTEM_CONFIG),
    DwIamModule,
    SystemModule.forRoot([]),
    DynamicFormsAntUIModule.forRoot(),
    DynamicFormsCoreModule.forRoot(),
    ImplementationModule.forRoot([]),
  ],
  declarations: [AppComponent],
  providers: [
    { provide: NZ_I18N, useValue: zh_CN },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true,
    },
    { provide: ErrorHandler, useClass: AppErrorHandleService },
    { provide: NZ_DATE_CONFIG, useValue: ngZorroDateConfig },
    { provide: NZ_CONFIG, useValue: ngZorroConfig },
    ...DynamicFormsCoreModule.forRoot().providers,
    DynamicUserBehaviorCommService,
    UserOrgInfoService,
    PluginLanguageStoreService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(
    private userBehaviorService: DynamicUserBehaviorService,
    private userOrgInfoService: UserOrgInfoService,
    private loginService: DwAuthService,
    private userService: DwUserService,
    private dynamicUserBehaviorCommService: DynamicUserBehaviorCommService,
  ) {
    this.userBehaviorService.init();
    this.userOrgInfoService.monitorLogin();
    let athenaSessionIdKey;
    this.loginService.isLoggedIn$.subscribe((isLogin): void => {
      if (isLogin) {
        const userInfo = this.userService.getUserInfo();
        athenaSessionIdKey = userInfo.userId + userInfo.tenantId;
        if (isEmpty(sessionStorage.getItem(athenaSessionIdKey))) {
          sessionStorage.setItem(athenaSessionIdKey, UUID.UUID());
        }
        this.dynamicUserBehaviorCommService.init({ clientId: UUID.UUID() });
      } else {
        sessionStorage.removeItem(athenaSessionIdKey);
      }
    });
  }
}
