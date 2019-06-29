import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user.model';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/app.reducer';
import { IngresoEgresoService } from 'src/app/ingreso-egreso/ingreso-egreso.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styles: []
})
export class SidebarComponent implements OnInit, OnDestroy {

  nombre: string;
  subscription: Subscription = new Subscription();

  constructor(  private authService: AuthService ,
                private store: Store<AppState>,
                private ingresosEgresosService: IngresoEgresoService
  ) {

  }

  ngOnInit() {
    this.subscription = this.store.select('auth')
      .subscribe( auth => {
        if (auth.user) {
          this.nombre = auth.user.nombre;
        }
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  logout() {
    this.authService.logout();
    this.ingresosEgresosService.cancelarSubscriptions();
  }

}
