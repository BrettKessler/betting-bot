import { TestBed } from '@angular/core/testing';

import { SportsDataService } from './sports-data.service';

describe('SportsDataService', () => {
  let service: SportsDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SportsDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
