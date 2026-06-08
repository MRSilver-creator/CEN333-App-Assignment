import { Routes } from '@angular/router';
import { IdentifyComponent } from './features/identify/identify.component';
import { LibraryComponent } from './features/library/library.component';
import { LogDoseComponent } from './features/log-dose/log-dose.component';
import { HistoryComponent } from './features/history/history.component';

export const routes: Routes = [
  { path: '', component: IdentifyComponent },
  { path: 'identify', component: IdentifyComponent },
  { path: 'library', component: LibraryComponent },
  { path: 'log-dose', component: LogDoseComponent },
  { path: 'history', component: HistoryComponent },
  { path: '**', redirectTo: '' },
];