import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Provider } from '@angular/compiler/src/core';
import { DW_LANGUAGE_JSON } from '@webdpt/framework/config';
import { ImplementationRoutingModule } from './implementation-routing.module';
import { SharedModule } from './shared/shared.module';
import { languageList } from './language/model/language.config';
import { DefaultLayoutComponent } from './layout/default-layout/default-layout.component';
import { DwSsoLoginModule } from '@webdpt/components/sso-login';
import { DwModalService } from 'ng-quicksilver/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { PageIndexComponent } from './programs/page-index/page-index.component';

@NgModule({
  imports: [
    CommonModule,
    ImplementationRoutingModule,
    DwSsoLoginModule,
    SharedModule, 
    NzSpinModule,
    NzButtonModule,
    NzCardModule,
    NzDividerModule,
  
  ],
  declarations: [DefaultLayoutComponent, PageIndexComponent],
  providers: [],
})
export class ImplementationModule {
  static forRoot(providers: Provider[]): ModuleWithProviders<ImplementationModule> {
    return {
      ngModule: ImplementationModule,
      providers: [
        ...SharedModule.forRoot([]).providers,
   
        { provide: DW_LANGUAGE_JSON, useValue: languageList },
        { provide: DwModalService, useClass: DwModalService },
        ...providers,
      ],
    };
  }
}
