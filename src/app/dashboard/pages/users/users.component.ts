import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Customer } from '@interfaces/customer';
import { CustomersService } from '@services/customers.service';
import { TitleComponent } from '@shared/title/title.component';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { PipesModule } from '../../../pipes/pipes.module';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Router, RouterModule } from '@angular/router';
import { LayoutService } from '@services/layout.service';
import { TagModule } from 'primeng/tag';
import { SidebarModule } from 'primeng/sidebar';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { UploadService } from '@services/upload.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    InputTextModule,
    FormsModule,
    PipesModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    DropdownModule,
    RouterModule,
    InputNumberModule,
    FileUploadModule,
    TagModule,
    SidebarModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './users.component.html',
})
export default class UsersComponent {
  public layoutService = inject(LayoutService);
  private customersService = inject(CustomersService);
  public customers = this.customersService.customers;
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  public router = inject(Router);
  public showUserForm: boolean = false;
  public uploadService = inject(UploadService);

  public user: Customer = {
    id_customer: 0,
    code_country: '+591',
    email: '',
    id: '',
    lastname: '',
    name: '',
    phone: '',
    photo: '',
    token: '',
    password: 'Antuca2024',
  };

  public userFormDirt = {
    name: false,
    lastname: false,
    phone: false,
    email: false,
  };

  public onUpload(event: any) {
    console.log(event);

    if (event.files.length > 0) {
      const file = event.files[0];
      const formData = new FormData();
      formData.append('file', file);

      this.uploadService.uploadfile(formData).subscribe((res) => {
        console.log(res);
        this.user.photo = res['filename'];
      });
    }
  }

  public optionsCodeCountries: { flag: string; code: string }[] = [
    {
      flag: 'https://www.worldstatesmen.org/bo_s.gif',
      code: '+591',
    },
  ];

  public selectedCodeCountry: { flag: string; code: string } = {
    flag: 'https://www.worldstatesmen.org/bo_s.gif',
    code: '+591',
  };

  constructor() {
    if (this.customers().length === 0) {
      this.customersService.getUsers();
    }
  }

  public removeUser(customer: Customer) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar este usuario?',
      acceptLabel: 'Si',
      acceptButtonStyleClass: 'p-button-rounded p-button-success w-7rem',
      rejectLabel: 'No',
      rejectButtonStyleClass: 'p-button-rounded p-button-warning w-7rem',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.customersService
          .deleteUser(customer.id_customer)
          .subscribe((_) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminación exitosa',
              detail: `Usuario eliminado exitosamente`,
            });
          });
      },
    });
  }

  public editUser(customer: Customer): void {
    this.user = customer;
    const selectedCountry = this.optionsCodeCountries.find(
      (o) => o.code === customer.code_country
    );
    this.showUserForm = true;
  }

  public createUser(): void {
    this.showUserForm = true;
    this.user = {
      id_customer: 0,
      code_country: '+591',
      email: '',
      id: '',
      lastname: '',
      name: '',
      phone: '',
      photo: '',
      token: '',
      password: 'Antuca2024',
    };
  }

  public async saveUser() {
    if (!(await this.passItemForm())) return;

    const newCustomer: Partial<Customer> = {
      name: this.user.name,
      lastname: this.user.lastname,
      id: this.user.id,
      email: this.user.email,
      phone: this.user.phone.toString(),
      code_country: this.selectedCodeCountry.code,
      photo: this.user.photo,
    };

    if (this.user.password) {
      newCustomer.password = this.user.password;
    }

    if (this.user.id_customer === 0) {
      this.customersService.postCustomer(newCustomer).subscribe((resItem) => {
        console.log(resItem);
        this.messageService.add({
          severity: 'success',
          summary: 'Exito',
          detail: 'El usuario se creo exitosamente',
        });
        this.showUserForm = false;
      });
    } else {
      this.customersService
        .updateUser(this.user.id_customer, newCustomer)
        .subscribe((resItem) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Exito',
            detail: 'El usuario se actualizo exitosamente',
          });
          this.showUserForm = false;
        });
    }
  }
  private passItemForm(): Promise<boolean> {
    if (!this.user.name) {
      this.userFormDirt.name = true;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Hay un error en el formulario revise porfavor',
      });
      return Promise.resolve(false);
    }
    if (!this.user.lastname) {
      this.userFormDirt.lastname = true;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Hay un error en el formulario revise porfavor',
      });
      return Promise.resolve(false);
    }
    if (!this.user.email) {
      this.userFormDirt.email = true;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Hay un error en el formulario revise porfavor',
      });
      return Promise.resolve(false);
    }
    if (!this.user.phone) {
      this.userFormDirt.phone = true;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Hay un error en el formulario revise porfavor',
      });
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  }
}
