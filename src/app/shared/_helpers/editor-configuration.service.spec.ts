import { TestBed } from '@angular/core/testing';

import { EditorConfigurationService } from './editor-configuration.service';

describe('EditorConfigurationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EditorConfigurationService = TestBed.get(EditorConfigurationService);
    expect(service).toBeTruthy();
  });
});
