import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { IngresoEgreso } from './ingreso-egreso.model';
import { AuthService } from '../auth/auth.service';
import { Store } from '@ngrx/store';
import { AppState } from '../app.reducer';
import { filter, map } from 'rxjs/operators';
import * as fromIngresoEgreso from './ingreso-egreso.actions';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IngresoEgresoService {
  ingresoEgresoListenerSubcription: Subscription = new Subscription();
  ingresoEgresoItemsSubcription: Subscription = new Subscription();

  constructor(  private afDB: AngularFirestore,
                private authService: AuthService,
                private store: Store<AppState>
  ) {

  }

  initIngresoEgresoListener() {
    this.ingresoEgresoListenerSubcription = this.store.select('auth')
      .pipe(
        filter(auth => auth.user != null)
      )
      .subscribe( auth => {
        this.ingresoEgresoItems(auth.user.uid);
      });
  }

  private ingresoEgresoItems( uid: string) {
    this.ingresoEgresoItemsSubcription = this.afDB.collection(`${uid}/ingresos-egresos/items`)
      .snapshotChanges()
      .pipe(
        map( docData => {
          return docData.map( doc => {
            return {
              ...doc.payload.doc.data(),
              uid: doc.payload.doc.id
            };
          });
        })
      )
      .subscribe( (coleccion: any[]) => {
        this.store.dispatch( new fromIngresoEgreso.SetItemsAction(coleccion));
      });
  }

  cancelarSubscriptions() {
    this.ingresoEgresoListenerSubcription.unsubscribe();
    this.ingresoEgresoItemsSubcription.unsubscribe();

    this.store.dispatch(new fromIngresoEgreso.UnsetItemsAction());
  }

  crearIngresoEgreso( ingresoEgreso: IngresoEgreso ) {
    const user = this.authService.getUsuario();
    return this.afDB.doc(`${user.uid}/ingresos-egresos`)
      .collection('items').add({...ingresoEgreso});
  }

  borrarIngresoEgreso( uid: string ) {
    const user = this.authService.getUsuario();

    return this.afDB.doc(`${user.uid}/ingresos-egresos/items/${uid}`)
      .delete();
  }

}
