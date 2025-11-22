import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { SorterResolver } from './sorter-resolver';

describe('sorterResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => new SorterResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
