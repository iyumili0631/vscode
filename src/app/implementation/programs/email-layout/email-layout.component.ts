import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import {
  Content,
  DynamicCommDataService,
  DynamicFormControlModel,
  DynamicFormLayout,
  DynamicFormService,
  exitFullscreen,
  fullScreen,
  isNotEmpty,
  listenFullscreen,
  ValidationErrorsService,
  DynamicCalculateComponentHeight,
} from '@ng-dynamic-forms/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EmailService } from './email.service';
import { TranslateService } from '@ngx-translate/core';
import { AntFormSubmitService, SubmitSpinService } from '@ng-dynamic-forms/ui-ant-web';

@Component({
  selector: 'app-email-layout',
  templateUrl: './email-layout.component.html',
  styleUrls: ['./email-layout.component.less'],
  providers: [EmailService, ValidationErrorsService, DynamicCommDataService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailLayoutComponent extends DynamicCalculateComponentHeight implements OnInit, AfterViewInit {
  private shortAddress: string;
  private programName: string;
  @Input() _shortAddres: string;
  rules: Array<any> = [];
  actions: Array<any> = [];
  formGroup: FormGroup;
  formModel: DynamicFormControlModel[];
  formLayout: DynamicFormLayout;
  content: Content;
  loading: boolean;
  loadingFailed: boolean;
  isNotEmpty = isNotEmpty;
  templateJson: any;
  isFullScreen: boolean = false;
  constructor(
    private _route: ActivatedRoute,
    private formService: DynamicFormService,
    private messageService: NzMessageService,
    private emailService: EmailService,
    private submitService: AntFormSubmitService,
    private translateService: TranslateService,
    private renderer2: Renderer2,
    private submitSpinService: SubmitSpinService,
    private changeRef: ChangeDetectorRef,
    protected elementRef: ElementRef
  ) {
    super(elementRef);
    this.shortAddress = this._route.snapshot.paramMap.get('secretkey');
    this.programName = this._route.snapshot.queryParams['programName'];
  }

  ngOnInit(): void {
    if (this._shortAddres) {
      this.shortAddress = this._shortAddres;
    }
    this.getDataBySecretKey();
  }

  ngAfterViewInit(): void {

    listenFullscreen().subscribe((res): void => {
      this.isFullScreen = res;
    });
  }


  private getDataBySecretKey(): void {
    this.loading = true;
    this.loadingFailed = false;
    this.templateJson = null;
    setTimeout(() => {
      this.emailService.getDataBySecretKey(this.shortAddress, this.programName).subscribe(
        (res: any): void => {
          this.loading = false;
          if (res?.code !== 0) {
            this.messageService.error(res?.message || '');
          } else {
            if (isNotEmpty(res.data)) {
              this.templateJson = res.data;
            } else {
              this.loadingFailed = true;
            }
            this.changeRef.markForCheck();
          }
        },
        (): void => {
          this.loading = false;
          this.loadingFailed = true;
          this.changeRef.markForCheck();
        }
      );
    }, 500);
  }

  submit(event: { actionParams: any; formGroup: FormGroup }): void {
    const params = this.formService.formateSubmitValue(event.actionParams, event.formGroup);
    this.emailService.executeAction(params).subscribe(
      (res: any): void => {
        if (res.code === 0 || res.status === 200) {
          this.submitSpinService.showSubmitSpin = false;
          this.refreshPage();
          this.messageService.success(this.translateService.instant('dj-上传成功'));
          this.getDataBySecretKey();
        } else {
          this.submitSpinService.showSubmitSpin = false;
          this.refreshPage();
          this.messageService.error(res.message);
        }
      },
      (err): void => {
        this.messageService.error(err.message);
        this.submitSpinService.showSubmitSpin = false;
        this.refreshPage();
      }
    );
  }

  onReload($event: any): void {
    this.getDataBySecretKey();
  }

  private refreshPage(): void {
    this.changeRef.markForCheck();
    this.changeRef.detectChanges();
  }


  fullScreenModel(): void {
    fullScreen();
    this.isFullScreen = true;
  }

  exitFullScreenModel(): void {
    exitFullscreen();
    this.isFullScreen = false;
  }
}
