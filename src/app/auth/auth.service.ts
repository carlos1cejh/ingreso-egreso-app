import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase';
import Swal from 'sweetalert2';
import { User } from './user.model';
import { Store } from '@ngrx/store';
import { AppState } from '../app.reducer';
import * as fromUI from '../shared/ui.accions';
import { Subscription } from 'rxjs';
import * as fromAuth from './auth.actions';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userSubscription: Subscription = new Subscription();

  constructor(  private afAuth: AngularFireAuth,
                private router: Router,
                private afDB: AngularFirestore,
                private store: Store<AppState>
  ) { }

  initAuthListener() {

    this.afAuth.authState.subscribe( (fbUser: firebase.User) => {
      if ( fbUser ) {
        this.userSubscription = this.afDB.doc(`${fbUser.uid}/usuario`).valueChanges()
          .subscribe( (usuarioObj: any) => {
            console.log(usuarioObj);
            const newUser = new User(usuarioObj);
            this.store.dispatch(new fromAuth.SetUserAction(newUser));
          });
      } else {
        this.userSubscription.unsubscribe();
      }

    });
  }


  crearUsuario(nombre: string, email: string, password: string) {

    this.store.dispatch(new fromUI.ActivarLoadingAction());

    this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then( resp => {

        const user: User = {
          uid: resp.user.uid,
          nombre: nombre,
          email: resp.user.email
        };

        this.afDB.doc(`${ user.uid }/usuario`)
          .set( user )
          .then( () => {
            this.router.navigate(['/']);
            this.store.dispatch(new fromUI.DesactivarLoadingAction());
          });
      })
      .catch( error => {
        Swal.fire({
          title: 'Error!',
          text: error.message,
          type: 'error',
          confirmButtonText: 'OK'
        });
        this.store.dispatch(new fromUI.DesactivarLoadingAction());
      });
  }

  login( email: string, password: string ) {

    this.store.dispatch(new fromUI.ActivarLoadingAction());

    this.afAuth.auth.signInWithEmailAndPassword(email, password)
    .then( resp => {
      this.router.navigate(['/']);
      this.store.dispatch(new fromUI.DesactivarLoadingAction());
    })
    .catch( error => {
      Swal.fire({
        title: 'Error!',
        text: error.message,
        type: 'error',
        confirmButtonText: 'OK'
      });
      this.store.dispatch(new fromUI.DesactivarLoadingAction());
    });
  }

  logout() {
    this.router.navigate(['/login']);
    this.afAuth.auth.signOut();
  }

  isAuth() {
    return this.afAuth.authState
      .pipe(
        map( fbuser => {
          if (fbuser === null){
            this.router.navigate(['/login']);
          }
          return fbuser != null;
        })
      );
  }

}
