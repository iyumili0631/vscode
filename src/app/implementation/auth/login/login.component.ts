import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DW_AUTH_TOKEN, DwAuthService } from '@webdpt/framework/auth';
import { DwIamRepository } from '@webdpt/framework/iam';
import { DwLanguageListService, DwLanguageService } from '@webdpt/framework/language';
import { DwSystemConfigService, Logo_Path } from '@webdpt/framework/config';
import { DwTenantService, DwUserService } from '@webdpt/framework/user';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { en_US, NzI18nInterface, NzI18nService, zh_CN, zh_TW } from 'ng-zorro-antd/i18n';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable, of, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment-timezone';
import { catchError } from 'rxjs/operators';
import { EventLogService } from 'app/implementation/home/service/event-log.service';
import { ClientService } from 'app/implementation/shared/client/client.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  validateForm: FormGroup;
  returnUrl: string;
  private subscription: Subscription = new Subscription();
  currTenantList = [];
  private isAutoForward = false;
  passowrdVisible: boolean = false;
  serverErrorMessage: string = null;

  defaultLanguage: string;
  iamUrl: string;
  url: string;
  digiwincloudUrl: string;
  ip: string = '0.0.0.0';
  metadata: any[];
  languageList: Array<any> = [];
  defaultLanguageLabel: string;
  isRecommendedResolution: boolean = false;
  currentSelectedIndex: number = 0;

  constructor(
    private http: HttpClient,
    @Inject(Logo_Path) public dwLogoPath: string,
    private fb: FormBuilder,
    private loginService: DwAuthService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService,
    private languageService: DwLanguageService,
    private translateService: TranslateService,
    @Inject(DW_AUTH_TOKEN) private authToken: any,
    private userService: DwUserService,
    private dwTenantService: DwTenantService,
    private eventLogService: EventLogService,
    private clientService: ClientService,
    private configService: DwSystemConfigService,
    private languageListService: DwLanguageListService,
    private i18n: NzI18nService,
    private tenantLoginService: DwIamRepository
  ) {
    this.configService.get('iamUrl').subscribe((url) => {
      this.iamUrl = url;
    });
    this.configService.get('atmcUrl').subscribe((url) => {
      this.url = url;
    });
    this.configService.get('digiwincloudUrl').subscribe((url) => {
      this.digiwincloudUrl = url;
    });
  }

  ngOnInit(): void {
    this.isRecommendedResolution = screen.width < 1920 && screen.height < 1080;
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl'); 
    if (this.currentSelectedIndex === 0) {
      this.validateForm = this.fb.group({
        userId: [null, [Validators.required]],
        password: [null, [Validators.required]],
        tenantId: [null],
        remember: [true],
        autoLogin: [false],
      });
    } else if (this.currentSelectedIndex === 1) {
      this.validateForm = this.fb.group({
        userId: [null, [Validators.required]],
        password: [null, [Validators.required]],
        tenantId: [null, [Validators.required]],
        remember: [true],
        autoLogin: [false],
      });
    }

    this.http.get(`${this.url}/api/atmc/v1/search/getIp`).subscribe((res: any) => {
      if (res.code === 0) {
        this.ip = res.data;
      }
    });

    if (this.loginService.isLoggedIn === true) {
      this.isAutoForward = true;
      this.afterLogin();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.isAutoForward === true) {
        this.isAutoForward = false;
      }
    });
  }

  /**
   * 在開啟多頁簽模式下, 沒有觸發 OnDestroy, 所以在選擇完租戶後, 手動 unsubscribe(),
   * 因為選擇完租戶後, 如果正常,會進行導頁, 如果不正常,會進行登出並導向 login 頁.
   */
  private unsubscribe(): void {
    this.subscription.unsubscribe();
  }

  /**
   * 獲取用戶個性化設定
   */
  getMeta(): Observable<any> {
    return this.http
      .post(`${this.iamUrl}/api/iam/v2/usermetadata`, {
        id: this.userService.getUser('userId'),
      })
      .pipe(
        catchError(() => {
          return of(null);
        })
      );
  }

  selectChange(current: any): void {
    this.currentSelectedIndex = current.index;
  }


  submitForm(): void {
    this.serverErrorMessage = null;
    // tslint:disable-next-line:forin
    for (const i in this.validateForm.controls) {
      if(this.validateForm.controls.hasOwnProperty(i)){
        this.validateForm.controls[i].markAsDirty();
        this.validateForm.controls[i].updateValueAndValidity();
      }
    }
    if (this.validateForm.invalid) {
      return;
    }

    if (this.currentSelectedIndex === 1) {
      const params = this.validateForm.getRawValue();
      params.identityType = 'query';
      this.tenantLoginService.internalLogin(params).subscribe(
        (res) => {
          this.operateLogin(res);
        },
        (error) => {
          this.serverErrorMessage = error.error.message;
        }
      );
    } else if (this.currentSelectedIndex === 0) {
      this.loginService.login(this.validateForm.getRawValue()).subscribe(
        (res) => {
          if (res.success || !!this.authToken.token) {
            this.operateLogin(res);
          }
        },
        (error) => {
          this.serverErrorMessage = error.error.message;
        }
      );
    }
  }

  operateLogin(res: any): void {
    // 平台基於租戶概念，即使有登入資訊
    // if (res.success || !!this.authToken.token) {
    this.loginService.setLogined(res);
    // 取得租戶清單
    this.subscription.add(
      this.dwTenantService.currTenantList$.subscribe(
        (lists) => {
          if (lists.length > 0) {
            this.currTenantList = lists;
            const tenantId = this.userService.getUser('tenantSid');
            if (!tenantId || tenantId === '0') {
              this.dwTenantService.tokenRefreshTenant(this.currTenantList[0].tenantSid).subscribe(
                () => {
                  this.getMeta().subscribe((temp: any) => {
                    const meta = (temp === null ? [] : temp.metadata) || [];
                    const indTZ = meta.findIndex((item) => item.key === 'timeZone');
                    if (indTZ >= 0) {
                      moment.tz.setDefault(meta[indTZ].value);
                    }
                  });
                  this.afterLogin();
                },
                () => {
                  this.afterLogin();
                }
              );
            }
            this.getMeta().subscribe((temp: any) => {
              const meta = (temp === null ? [] : temp.metadata) || [];
              const indTZ = meta.findIndex((item) => item.key === 'timeZone');
              if (indTZ >= 0) {
                moment.tz.setDefault(meta[indTZ].value);
              }
            });
            this.afterLogin();
          } else {
            this.afterLogin();
          }
        },
        () => {
          this.afterLogin();
        }
      )
    );

  }

  private afterLogin(): void {

    this.initLanguage();
    this.clientService.generateClientId();
    this.returnUrl = this.returnUrl || '/';
    this.eventLogService.addEventLog({
      level: this.eventLogService.$INFO_LEVEL,
      eventContent:
        this.userService.getUser('userName') +
        '(' +
        this.userService.getUser('userId') +
        ')尝试于(' +
        this.ip +
        ')登入系统，成功',
      appear: '登陆',
    });
    this.router.navigateByUrl(this.returnUrl);
  }


  private initLanguage(): void {
    const language = this.userService.getUser('acceptLanguage');
    this.defaultLanguage = language || this.languageService.currentLanguage;
    this.languageListService.getLanguagesList().subscribe((data) => {
      this.languageList = data;
      this.defaultLanguageLabel = this.languageList.find(
        (d) => d.value === this.defaultLanguage
      ).label;
    });
    this.i18n.setLocale(this.switchLanguage(this.defaultLanguage));
    this.languageService.setUp(this.defaultLanguage);
  }

  switchLanguage(type: string): NzI18nInterface {
    switch (type) {
    case 'zh_CN':
      return zh_CN;
    case 'zh_TW':
      return zh_TW;
    case 'en_US':
      return en_US;
    default:
      return zh_CN;
    }
  }


  passowrdVisibleChange(): void {
    this.passowrdVisible = !this.passowrdVisible;
  }

  translateWord(val: string): string {
    return this.translateService.instant(`dj-login-${val}`);
  }
}
