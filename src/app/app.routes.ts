import { Routes } from '@angular/router';
import { SorterComponent } from './sorter-component/sorter-component';
import { SorterResolver } from '../resolvers/sorter-resolver';
import { IndexComponent } from './index-component/index-component';

export const routes: Routes = [
  {
    path: '',
    component: IndexComponent
  },
  {
    path: ':prId/:voterId/:sheetId',
    component: SorterComponent,
    resolve: {
      sheet: SorterResolver,
    }
  },
  {
    path: '**',
    component: IndexComponent
  }
];
