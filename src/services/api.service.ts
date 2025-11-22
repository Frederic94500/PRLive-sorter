import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { Response } from "@interfaces/api.interface";

@Injectable()
export class ApiService {
  private apiUrl = environment.apiUrl;
  private apiEndpoint = 'api';

  public async getNoCred<T>(endpoint: string): Promise<Response<T>> {
    const response = await fetch(`${this.apiUrl}/${this.apiEndpoint}/${endpoint}`, {});
    return response.json();
  }
}
