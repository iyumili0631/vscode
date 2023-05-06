import { Injectable } from '@angular/core';
import { DwSystemConfigService } from '@webdpt/framework/config';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EventLogService {
  /** atmc url */
  private atmcUrl: string;
  public $INFO_LEVEL: string = 'info';
  public $ERROR_LEVEL: string = 'error';
  public $WARN_LEVEL: string = 'warn';

  constructor(
    private http: HttpClient,
    private configService: DwSystemConfigService
  ) {
    this.configService.get('atmcUrl').subscribe((url) => {
      this.atmcUrl = url;
    });
  }
  addEventLog(params: any): void {
    this.http
      .post(`${this.atmcUrl}/api/atmc/v1/eventlog`, params)
      .subscribe((res) => {
        console.log(res);
      });
  }
}
