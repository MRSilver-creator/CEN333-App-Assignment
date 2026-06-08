import { ApplicationConfig }       from '@angular/core';
import { provideRouter }            from '@angular/router';
import { provideHttpClient }        from '@angular/common/http';
import { routes }                   from './app.routes';
import { initializeApp }            from 'firebase/app';
import { environment }              from '../environments/environments';

initializeApp(environment.firebaseConfig);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
  ]
};
