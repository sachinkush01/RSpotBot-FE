import { TestBed } from '@angular/core/testing';

import { VoiceRecorderService } from './voice-recorder.service';

describe('VoiceRecorderService', () => {
  let service: VoiceRecorderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoiceRecorderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
