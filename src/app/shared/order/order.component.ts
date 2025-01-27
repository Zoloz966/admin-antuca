import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Order, OrderItems, ServiceMode, createItems } from '@interfaces/order';
import { ClientsService } from '@services/clients.service';
import { CustomersService } from '@services/customers.service';
import { OrdersService } from '@services/orders.service';
import { StatesService } from '@services/states.service';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { BadgeModule } from 'primeng/badge';
import { ItemsService } from '@services/items.service';
import { TableModule } from 'primeng/table';
import { Items } from '@interfaces/items';
import { CarouselModule } from 'primeng/carousel';
import { LayoutService } from '@services/layout.service';
import moment from 'moment';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DailyAvailability } from '@interfaces/dailyAvailability';
import { DailyAvailabilityServices } from '@services/dailyAvailability.service';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    InputTextareaModule,
    InputTextModule,
    RadioButtonModule,
    InputNumberModule,
    InputSwitchModule,
    ButtonModule,
    BadgeModule,
    TableModule,
    CarouselModule,
    TagModule,
    CalendarModule,
  ],
  templateUrl: './order.component.html',
})
export class OrderComponent {
  public dialogService = inject(DialogService);
  public config = inject(DynamicDialogConfig);
  public ref = inject(DynamicDialogRef);
  public ordersService = inject(OrdersService);
  public clientsService = inject(ClientsService);
  public customerService = inject(CustomersService);
  public statesService = inject(StatesService);
  public itemsService = inject(ItemsService);
  public layoutService = inject(LayoutService);
  private dailyAvailabilityServices = inject(DailyAvailabilityServices);

  public clients = this.clientsService.clients;
  public customers = this.customerService.customers;
  public states = this.statesService.states;
  public loadingStates = this.statesService.loading;

  public selectItems: any[] = [];

  public initialState = this.states().find((s) => s.priority === 2);

  public editTotal: boolean = false;
  public showAllItems: boolean = false;

  public order: Order = {
    id_order: 0,
    customerIdCustomer: this.customerService.customer()!.id_customer,
    customer: this.customerService.customer(),
    clientIdClient: 0,
    date: moment(new Date()).format('YYYY-MM-DD'),
    stateIdState: this.initialState ? this.initialState.id_state : 0,
    state: this.initialState ? this.initialState : undefined,
    total_amount: 0,
    paymentTypeIdPaymentType: 1,
    service_mode: ServiceMode.EN_SALA,
    notes: '',
  };

  public inputDirt = {
    client: false,
    customer: false,
    date: false,
    state: false,
    total_amount: false,
    item: false,
    paymentTypeIdPaymentType: false,
    service_mode: false,
    notes: false,
  };

  public serviceModes: {
    isSelect: boolean;
    label: ServiceMode;
  }[] = [
    { isSelect: true, label: ServiceMode.EN_SALA },
    { isSelect: false, label: ServiceMode.PARA_LLEVAR },
    { isSelect: false, label: ServiceMode.DELIVERY },
    { isSelect: false, label: ServiceMode.MIXTO },
  ];

  public itemsAvailables: DailyAvailability[] = [];
  public loadingItems: boolean = false;

  constructor() {
    if (this.config.data) {
      this.order = {
        ...this.config.data.order,
        date: moment(this.config.data.order.date).format('YYYY-MM-DD'),
      };
      this.serviceModes.forEach((s) => {
        s.label === this.order.service_mode
          ? (s.isSelect = true)
          : (s.isSelect = false);
      });
      console.log(this.config.data.order);
    }
    this.statesService.getAllStates();
    this.getItems();
  }

  public getItems() {
    this.loadingItems = true
    const today = new Date();
    // today.setDate(today.getDate() + 1); // quitar para prod
    this.dailyAvailabilityServices
    .getAllByDatesDailyAvailability(today, today)
    .subscribe((res) => {
        this.loadingItems = false
        this.itemsAvailables = res;
      });
  }

  public selectServiceMode(i: number) {
    this.serviceModes.forEach((s) => (s.isSelect = false));
    this.serviceModes[i].isSelect = true;
  }

  public addItem(item: Items) {
    const selectItem = this.selectItems.find(
      (i) => i.itemIdItem === item.id_item
    );
    if (selectItem) {
      selectItem.quantity += 1;
    } else {
      const pushItem = {
        itemIdItem: item.id_item,
        name: item.name,
        type_item: item.type_item,
        price: item.price,
        quantity: 1,
        subtotal: 10,
      };
      this.selectItems.push(pushItem);
    }
    this.calculateAmount();
  }
  public addUpdateItem(item: Items) {
    const selectItem = this.order.orderItems!.find(
      (i) => i.itemIdItem === item.id_item
    );
    if (selectItem) {
      selectItem.quantity += 1;
    } else {
      const pushItem: OrderItems = {
        itemIdItem: item.id_item,
        quantity: 1,
        id_order_item: 0,
        orderIdOrder: this.order.id_order,
        item: item,
      };
      this.order.orderItems!.push(pushItem);
    }
    this.calculateUpdateAmount();
  }

  public removeItem(item: createItems) {
    const selectItem = this.selectItems.find(
      (i) => i.itemIdItem === item.itemIdItem
    );

    selectItem!.quantity -= 1;
    if (selectItem?.quantity === 0) {
      const index = this.selectItems.indexOf(selectItem);
      if (index !== -1) {
        this.selectItems.splice(index, 1);
      }
    }
    this.calculateAmount();
  }
  public removeUpdateItem(item: OrderItems) {
    const selectItem = this.order.orderItems!.find(
      (i) => i.itemIdItem === item.itemIdItem
    );

    selectItem!.quantity -= 1;
    if (selectItem?.quantity === 0) {
      const index = this.order.orderItems!.indexOf(selectItem);
      if (index !== -1) {
        this.order.orderItems!.splice(index, 1);
      }
    }
    this.calculateUpdateAmount();
  }

  public calculateAmount(): void {
    const serviceModeSelected = this.serviceModes.find((s) => s.isSelect);

    this.order.total_amount = 0.0;
    if (this.selectItems.length === 0) {
      this.order.total_amount = 0.0;
      return;
    }
    const startersItems = this.selectItems.filter((i) => i.type_item === 0);
    const secondsItems = this.selectItems.filter((i) => i.type_item === 1);
    const otherItemsItems = this.selectItems.filter((i) => i.type_item === 2);

    let startersCount = 0;
    let secondsCount = 0;

    startersItems.forEach((i) => (startersCount += i.quantity));
    secondsItems.forEach((i) => (secondsCount += i.quantity));
    otherItemsItems.forEach(
      (i) => (this.order.total_amount += i.price * i.quantity)
    );
    if (serviceModeSelected!.label === ServiceMode.EN_SALA) {
      if (startersCount - secondsCount === 0) {
        this.order.total_amount += startersCount * 15;
      } else if (startersCount - secondsCount > 0) {
        this.order.total_amount += secondsCount * 15;
        this.order.total_amount += (startersCount - secondsCount) * 5;
      } else if (startersCount - secondsCount < 0) {
        this.order.total_amount += startersCount * 15;
        this.order.total_amount += (startersCount - secondsCount) * -1 * 12;
      }
    } else {
      startersItems.forEach(
        (i) => (this.order.total_amount += i.quantity * i.price)
      );
      secondsItems.forEach(
        (i) => (this.order.total_amount += i.quantity * i.price)
      );
    }
  }

  public calculateUpdateAmount(): void {
    this.order.total_amount = 0.0;
    if (this.order.orderItems!.length === 0) {
      this.order.total_amount = 0.0;
      return;
    }
    const startersItems = this.order.orderItems!.filter(
      (i) => i.item.type_item === 0
    );
    const secondsItems = this.order.orderItems!.filter(
      (i) => i.item.type_item === 1
    );
    const otherItemsItems = this.order.orderItems!.filter(
      (i) => i.item.type_item === 2
    );

    let startersCount = 0;
    let secondsCount = 0;

    startersItems.forEach((i) => (startersCount += i.quantity));
    secondsItems.forEach((i) => (secondsCount += i.quantity));
    otherItemsItems.forEach(
      (i) => (this.order.total_amount += i.item.price * i.quantity)
    );

    if (startersCount - secondsCount === 0) {
      this.order.total_amount += startersCount * 15;
    } else if (startersCount - secondsCount > 0) {
      this.order.total_amount += secondsCount * 15;
      this.order.total_amount += (startersCount - secondsCount) * 5;
    } else if (startersCount - secondsCount < 0) {
      this.order.total_amount += startersCount * 15;
      this.order.total_amount += (startersCount - secondsCount) * -1 * 12;
    }
  }

  public async createOrder() {
    if (!(await this.passOrderForm())) return;

    const service_mode = this.serviceModes.find((s) => s.isSelect);

    const newOrder: Partial<Order> = {
      customerIdCustomer: this.order.customer!.id_customer,
      clientIdClient: this.order.client!.id_client,
      date: moment(this.order.date).format('YYYY-MM-DD') + 'T04:00:00.0000Z',
      stateIdState: this.order.state!.id_state,
      total_amount: this.order.total_amount,
      paymentTypeIdPaymentType: 1,
      service_mode: service_mode!.label,
      notes: this.order.notes,
      items: this.selectItems.map(({ itemIdItem, quantity }) => ({
        itemIdItem,
        quantity,
      })),
    };
    this.ordersService.postOrder(newOrder).subscribe((resOrder) => {
      this.ref.close(resOrder);
    });
  }

  public async updateOrder() {
    if (!(await this.passOrderForm())) return;

    console.log('paso');

    const service_mode = this.serviceModes.find((s) => s.isSelect);

    const newOrder: Partial<Order> = {
      customerIdCustomer: this.order.customer!.id_customer,
      clientIdClient: this.order.client!.id_client,
      date: moment(this.order.date).format('YYYY-MM-DD') + 'T04:00:00.0000Z',
      stateIdState: this.order.state!.id_state,
      total_amount: this.order.total_amount,
      paymentTypeIdPaymentType: 1,
      service_mode: service_mode!.label,
      notes: this.order.notes,
      items: this.order.orderItems!.map(({ itemIdItem, quantity }) => ({
        itemIdItem,
        quantity,
      })),
    };

    this.ordersService
      .updateOrder(this.order.id_order, newOrder)
      .subscribe((resOrder) => {
        this.ref.close(resOrder);
      });
  }

  public passOrderForm(): Promise<boolean> {
    if (!this.order.client) {
      this.inputDirt.client = true;
      return Promise.resolve(false);
    }
    if (!this.order.customer) {
      this.inputDirt.customer = true;
      return Promise.resolve(false);
    }
    if (!this.order.state) {
      this.inputDirt.state = true;
      return Promise.resolve(false);
    }
    if (this.config.data) {
      if (this.order.orderItems!.length === 0) {
        return Promise.resolve(false);
      }
    } else {
      if (this.selectItems.length === 0) {
        return Promise.resolve(false);
      }
    }
    this.inputDirt.state = false;
    this.inputDirt.customer = false;
    this.inputDirt.client = false;

    return Promise.resolve(true);
  }
}
