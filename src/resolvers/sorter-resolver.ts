import { ActivatedRouteSnapshot, Resolve, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { SheetService } from '@services/sheet.service';
import { from, Observable } from 'rxjs';
import { SorterSheet } from '@interfaces/sheet.interface';
import { Response } from '@interfaces/api.interface';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SorterResolver implements Resolve<Response<SorterSheet>> {
  constructor(private sheetService: SheetService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Response<SorterSheet>> {
    const prId = route.paramMap.get('prId')!;
    const voterId = route.paramMap.get('voterId')!;
    const sheetId = route.paramMap.get('sheetId')!;

    return from(this.sheetService.getSorterSheet(prId, voterId, sheetId));
  }
}
