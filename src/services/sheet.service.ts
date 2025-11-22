import { Injectable } from "@angular/core";
import { Response } from "@interfaces/api.interface";
import { SorterSheet } from "@interfaces/sheet.interface";
import { ApiService } from "./api.service";

@Injectable()
export class SheetService {
  private apiService = new ApiService();
  private apiEndpoint = 'sheet';

  public async getSorterSheet(prId: string, voterId: string, sheetId: string): Promise<Response<SorterSheet>> {
    return await this.apiService.getNoCred(`${this.apiEndpoint}/sorter/${prId}/${voterId}/${sheetId}`);
  }
}
