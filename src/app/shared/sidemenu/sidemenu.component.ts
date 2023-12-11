import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { routes } from '../../app.routes';
import { RouterModule, provideRouter } from '@angular/router';
import { LayoutService } from '@services/layout.service';

import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-sidemenu',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, MenuModule, ToastModule],
  providers: [MessageService],
  templateUrl: './sidemenu.component.html',
  styles: `

  `,
})
export class SidemenuComponent {
  public layoutService = inject(LayoutService);
  public messageService = inject(MessageService);

  public menuItems = routes
    .map((route) => route.children)
    .flat()
    .filter((route) => route && route.path)
    .filter((route) => !route?.path?.includes(':'));

  public toogleMenu() {
    this.layoutService.onMenuToggle();
  }

  public items: MenuItem[] = [
    {
      label: 'Panel de control',
      items: [
        {
          label: 'Informes',
          icon: 'pi pi-chart-bar',
          command: () => {
            this.messageService.add({
              severity: 'info',
              summary: 'En construcción',
              detail: 'Página de informes en construcción',
            });
          },
        },
      ],
    },
    {
      label: 'Clientes',
      items: [
        {
          label: 'Órdenes',
          icon: 'pi pi-megaphone',
          url: 'dashboard/orders'
        },
      ],
    },
  ];
}