import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { programs } from 'app/config/custom-app-config';

@Component({
  selector: 'app-page-index',
  templateUrl: './page-index.component.html',
  styleUrls: ['./page-index.component.less']
})
export class PageIndexComponent implements OnInit {
  public programs: { [key: string]: any } = programs
  selectedValue: string = '';
  constructor(private router: Router) { }

  ngOnInit(): void { /* fix SonarQube bug */ }

  onSelected(value) {
    if (value) {
      this.router.navigate(['/dev/xxx'], {
        queryParams: {
          programName: value
        }
      });
    }
  }
}
