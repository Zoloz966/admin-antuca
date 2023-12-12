import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomersService } from '@services/customers.service';
import { LayoutService } from '@services/layout.service';
import { SidemenuComponent } from '@shared/sidemenu/sidemenu.component';
import { TopbarComponent } from '@shared/topbar/topbar.component';
import UserComponent from './pages/user/user.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SidemenuComponent,
    TopbarComponent,
    RouterOutlet,
    UserComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export default class DashboardComponent {
  private customerService = inject(CustomersService);
  public layoutService = inject(LayoutService);
}
