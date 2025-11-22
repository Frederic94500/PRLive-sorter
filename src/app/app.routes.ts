import { Routes } from '@angular/router';
import { SorterComponent } from './sorter-component/sorter-component';
import { SorterResolver } from '../resolvers/sorter-resolver';

export const routes: Routes = [
  {
    path: ':prId/:voterId/:sheetId',
    component: SorterComponent,
    resolve: {
      sheet: SorterResolver,
    }
  }
];
