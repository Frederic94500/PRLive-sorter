import { Routes } from '@angular/router';
import { SorterComponent } from './sorter-component/sorter-component';

export const routes: Routes = [
  {
    path: '',
    component: SorterComponent,
    pathMatch: 'full',
  },
  //   path: ':prId/:voterId/:sheetId',
  //   component: SorterComponent,
  // }
];
