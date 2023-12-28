import { CommonModule } from '@angular/common';
import { Component, Signal, inject } from '@angular/core';
import { Client } from '@interfaces/client';
import { Items } from '@interfaces/items';
import { Order } from '@interfaces/order';
import { OrdersService } from '@services/orders.service';
import { ClientComponent } from '@shared/client/client.component';
import { ItemComponent } from '@shared/item/item.component';
import { OrderComponent } from '@shared/order/order.component';
import { TitleComponent } from '@shared/title/title.component';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DataViewModule } from 'primeng/dataview';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    DataViewModule,
    CardModule,
    TitleComponent,
    TableModule,
    ButtonModule,
    TagModule,
    TieredMenuModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [
    ConfirmationService,
    MessageService,
    DialogService,
    DynamicDialogConfig,
  ],
  templateUrl: './orders.component.html',
})
export default class OrdersComponent {
  public configRef = inject(DynamicDialogConfig);
  public dialogService = inject(DialogService);
  public ordersService = inject(OrdersService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  public orders: Signal<Order[]> = this.ordersService.orders;
  public selectOrder: Order | undefined;

  public ref: DynamicDialogRef | undefined;

  public items: MenuItem[] = [
    {
      label: 'Borrar',
      icon: 'pi pi-trash',
      command: () => {
        this.confirmationService.confirm({
          message: '¿Está seguro de eliminar esta orden?',
          acceptLabel: 'Si',
          acceptButtonStyleClass: 'p-button-rounded p-button-success w-7rem',
          rejectLabel: 'No',
          rejectButtonStyleClass: 'p-button-rounded p-button-warning w-7rem',
          header: 'Confirmación',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.ordersService
              .deleteOrders(this.selectOrder!.id_order)
              .subscribe((_) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Eliminación exitosa',
                  detail: `Orden eliminada exitosamente`,
                });
              });
          },
        });
      },
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () => {
        this.showOrder(this.selectOrder!);
      },
    },
  ];

  public refreshData(): void {
    this.ordersService.getOrders();
  }

  selectOptionOrder(order: Order): void {
    this.selectOrder = order;
  }

  public showClient(client: Client): void {
    this.ref = this.dialogService.open(ClientComponent, {
      header: 'Client: ' + client.name + ' ' + client.lastname,
      draggable: true,
      styleClass: 'w-11 md:w-7',
      data: {
        client: client,
        disabled: true,
      },
    });
  }

  public showItem(item: Items): void {
    this.ref = this.dialogService.open(ItemComponent, {
      header: 'Item: ' + item.name,
      draggable: true,
      styleClass: 'w-11 md:w-5',
      data: {
        item: item,
        disabled: true,
      },
    });
  }

  public showOrder(order: Order): void {
    this.ref = this.dialogService.open(OrderComponent, {
      header: `Orden ${order.id_order}: ${order.client!.name} ${
        order.client!.lastname
      }`,
      draggable: true,
      styleClass: 'w-11 md:w-6',
      data: {
        order: order,
      },
    });

    this.ref.onClose.subscribe((order: Order) => {
      if (order) {
        this.messageService.add({
          severity: 'success',
          summary: 'Exito!',
          detail: `Orden para el cliente ${
            order.client!.name
          } actualizado exitosamente`,
        });
      }
    });
  }

  public createOrder(): void {
    this.ref = this.dialogService.open(OrderComponent, {
      header: `Nueva Orden`,
      draggable: true,
      styleClass: 'w-11 md:w-6',
    });

    this.ref.onClose.subscribe((order: Order) => {
      if (order) {
        this.messageService.add({
          severity: 'success',
          summary: 'Exito!',
          detail: `Orden para el cliente ${
            order.client!.name
          } creado exitosamente`,
        });
      }
    });
  }

  public get totalAmount(): number {
    return this.orders().reduce(
      (total, order) => total + +order.total_amount,
      0
    );
  }
}
