import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/auth/user.model';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/app.reducer';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styles: []
})
export class NavbarComponent implements OnInit, OnDestroy {

  nombre: string;
  subscription: Subscription = new Subscription();

  constructor( private store: Store<AppState>
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

}
