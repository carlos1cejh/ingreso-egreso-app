import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IngresoEgreso } from './ingreso-egreso.model';
import { IngresoEgresoService } from './ingreso-egreso.service';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
// import { AppState } from '../app.reducer';
import { Subscription } from 'rxjs';
import * as fromUI from '../shared/ui.accions';

import * as fromIngresoEgreso from './ingreso-egreso.reducer';

@Component({
  selector: 'app-ingreso-egreso',
  templateUrl: './ingreso-egreso.component.html',
  styles: []
})
export class IngresoEgresoComponent implements OnInit, OnDestroy {

  forma: FormGroup;
  tipo: string = 'ingreso';
  subscription: Subscription = new Subscription();
  cargando: boolean;

  constructor(  private ingresoEgresoService: IngresoEgresoService,
                private store: Store<fromIngresoEgreso.AppState>
  )  { }

  ngOnInit() {

    this.subscription = this.store.select('ui').subscribe( ui => {
      this.cargando = ui.isLoading;
    });

    this.forma = new FormGroup({
      descripcion: new FormControl('', Validators.required),
      monto: new FormControl('0', Validators.min(0))
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  crearIngredoEgreso() {
    this.store.dispatch(new fromUI.ActivarLoadingAction());
    const ingresoEgreso = new IngresoEgreso({...this.forma.value, tipo: this.tipo});
    this.ingresoEgresoService.crearIngresoEgreso(ingresoEgreso)
      .then( () => {
        Swal.fire({
          title: 'Creado',
          text: ingresoEgreso.descripcion,
          type: 'success',
          confirmButtonText: 'OK'
        });
        this.store.dispatch(new fromUI.DesactivarLoadingAction());
      })
      .catch( error => {
        Swal.fire({
          title: 'Error!',
          text: error.descripcion,
          type: 'error',
          confirmButtonText: 'OK'
        });
        this.store.dispatch(new fromUI.DesactivarLoadingAction());
      });


  }

}
