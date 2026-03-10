import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  DeviceTelemetry,
  DeviceTransportState,
  DrumInstrument,
  DrumEvent,
  GeneratedTake,
  GenerationParameters,
  NoteEvent,
  ChordEvent,
  PartId,
  PartLevels,
} from '../models/jazz-device.types';
import { JazzGeneratorService } from './jazz-generator.service';
import { reduceTransportState } from '../utils/jazz-transport';

type ToneModule = typeof import('tone');

interface SampleManifest {
  readonly guitar: Record<string, string>;
  readonly woodwind: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class JazzAudioEngineService implements OnDestroy {
  private readonly stateSubject = new BehaviorSubject<DeviceTransportState>('idle');
  private readonly telemetrySubject = new BehaviorSubject<DeviceTelemetry>({
    enabled: false,
    state: 'idle',
    elapsedSeconds: 0,
    progress: 0,
    sectionLabel: 'Idle',
    activeParts: [],
    meterLeft: 0,
    meterRight: 0,
  });
  private readonly takeSubject = new BehaviorSubject<GeneratedTake | null>(null);

  readonly state$ = this.stateSubject.asObservable();
  readonly telemetry$ = this.telemetrySubject.asObservable();
  readonly take$ = this.takeSubject.asObservable();

  private tone: ToneModule | null = null;
  private initialized = false;
  private poweredOn = false;
  private updateTimer: number | null = null;
  private lastParameters: GenerationParameters | null = null;
  private partLevels: PartLevels = {
    rhodes: 0.9,
    pad: 0.62,
    comp: 0.54,
    bass: 0.82,
    lead: 0.74,
    drums: 0.7,
  };

  private masterBus: any;
  private meter: any;
  private reverb: any;
  private delay: any;
  private rhodesChorus: any;
  private rhodesFilter: any;
  private padFilter: any;
  private compFilter: any;
  private bassFilter: any;
  private leadFilter: any;
  private drumFilter: any;
  private rhodesBus: any;
  private padBus: any;
  private compBus: any;
  private bassBus: any;
  private leadBus: any;
  private drumBus: any;
  private rhodes: any;
  private pad: any;
  private comp: any;
  private bass: any;
  private leadVibrato: any;
  private woodwindLead: any;
  private trumpetLead: any;
  private guitarLead: any;
  private guitarComp: any;
  private kick: any;
  private snare: any;
  private hats: any;
  private openHats: any;
  private parts: any[] = [];

  constructor(private readonly generator: JazzGeneratorService) {}

  async initializeAudio(): Promise<void> {
    if (this.initialized && this.poweredOn) {
      return;
    }

    if (this.initialized && !this.poweredOn) {
      this.poweredOn = true;
      this.masterBus?.gain?.setValueAtTime?.(0.92, this.tone?.now?.() ?? 0);
      this.applyPartLevels();
      this.setState('initialize');
      this.patchTelemetry({
        enabled: true,
        sectionLabel: this.takeSubject.value?.sections[0]?.label ?? 'Ready',
        activeParts: this.takeSubject.value?.sections[0]?.activeParts ?? [],
        progress: 0,
        elapsedSeconds: 0,
      });

      if (this.lastParameters && this.takeSubject.value) {
        this.applyTake(this.takeSubject.value, this.lastParameters, false);
      }

      return;
    }

    try {
      this.tone = await import('tone');
      await this.tone.start();
      this.createAudioGraph();
      await this.upgradeSampledVoices();
      this.initialized = true;
      this.poweredOn = true;
      this.applyPartLevels();
      this.setState('initialize');
      this.patchTelemetry({ enabled: true, sectionLabel: 'Ready' });

      if (this.lastParameters) {
        await this.generateTake(this.lastParameters, false);
      }

      this.startTelemetryLoop();
    } catch {
      this.setState('error');
    }
  }

  powerOff(): void {
    if (!this.initialized || !this.tone) {
      return;
    }

    this.poweredOn = false;
    this.disposeParts();
    this.tone.Transport.stop();
    this.tone.Transport.cancel(0);
    this.tone.Transport.position = '0:0:0';
    this.silenceVoices();
    this.masterBus?.gain?.setValueAtTime?.(0, this.tone.now());
    this.stateSubject.next('idle');
    this.patchTelemetry({
      enabled: false,
      state: 'idle',
      elapsedSeconds: 0,
      progress: 0,
      sectionLabel: 'Powered off',
      activeParts: [],
      meterLeft: 0,
      meterRight: 0,
    });
  }

  async generateTake(params: GenerationParameters, preservePlayback: boolean): Promise<void> {
    this.lastParameters = params;
    this.setState('generate');

    const take = this.generator.createTake(params);
    this.applyTake(take, params, preservePlayback);
    this.setState('finish');
  }

  updateTake(take: GeneratedTake, preservePlayback: boolean): void {
    const params = this.lastParameters;
    if (!params) {
      this.takeSubject.next(take);
      return;
    }

    this.applyTake(take, params, preservePlayback);
  }

  play(): void {
    if (!this.tone || !this.takeSubject.value || !this.poweredOn) {
      return;
    }

    this.tone.Transport.start();
    this.setState('play');
  }

  pause(): void {
    if (!this.tone || !this.poweredOn) {
      return;
    }

    this.tone.Transport.pause();
    this.setState('pause');
  }

  stop(): void {
    if (!this.tone || !this.poweredOn) {
      return;
    }

    this.tone.Transport.stop();
    this.tone.Transport.position = '0:0:0';
    this.setState('stop');
    this.patchTelemetry({ progress: 0, elapsedSeconds: 0 });
  }

  setBpm(bpm: number): void {
    if (!this.tone || !this.poweredOn) {
      return;
    }

    this.tone.Transport.bpm.rampTo(bpm, 0.2);
  }

  setPartVolume(partId: PartId, level: number): void {
    this.partLevels = { ...this.partLevels, [partId]: clampLevel(level) };
    this.applyPartLevels();
  }

  setPartVolumes(levels: PartLevels): void {
    this.partLevels = {
      rhodes: clampLevel(levels.rhodes),
      pad: clampLevel(levels.pad),
      comp: clampLevel(levels.comp),
      bass: clampLevel(levels.bass),
      lead: clampLevel(levels.lead),
      drums: clampLevel(levels.drums),
    };
    this.applyPartLevels();
  }

  seekToProgress(progress: number): void {
    if (!this.tone || !this.takeSubject.value || !this.poweredOn) {
      return;
    }

    const clipped = Math.min(0.999, Math.max(0, progress));
    const totalBeats = this.takeSubject.value.totalBars * 4;
    const targetBeat = totalBeats * clipped;
    this.tone.Transport.position = beatToTransportTime(targetBeat);
    this.syncTelemetry();
  }

  ngOnDestroy(): void {
    this.disposeParts();
    if (this.updateTimer !== null) {
      window.clearInterval(this.updateTimer);
    }
  }

  private setState(action: Parameters<typeof reduceTransportState>[1]): void {
    const nextState = reduceTransportState(this.stateSubject.value, action);
    this.stateSubject.next(nextState);
    this.patchTelemetry({ state: nextState });
  }

  private patchTelemetry(partial: Partial<DeviceTelemetry>): void {
    this.telemetrySubject.next({ ...this.telemetrySubject.value, ...partial });
  }

  private createAudioGraph(): void {
    if (!this.tone) {
      return;
    }

    const Tone = this.tone;
    this.masterBus = new Tone.Gain(0.92);
    this.meter = new Tone.Meter();
    const limiter = new Tone.Limiter(-1);
    const compressor = new Tone.Compressor(-18, 3);

    this.masterBus.chain(compressor, limiter, this.meter, Tone.Destination);

    this.reverb = new Tone.Reverb({ decay: 5.6, wet: 0.38 }).connect(this.masterBus);
    this.delay = new Tone.FeedbackDelay('8n', 0.18).connect(this.masterBus);

    this.rhodesBus = new Tone.Gain(this.partLevels.rhodes).connect(this.masterBus);
    this.padBus = new Tone.Gain(this.partLevels.pad).connect(this.masterBus);
    this.compBus = new Tone.Gain(this.partLevels.comp).connect(this.masterBus);
    this.bassBus = new Tone.Gain(this.partLevels.bass).connect(this.masterBus);
    this.leadBus = new Tone.Gain(this.partLevels.lead).connect(this.masterBus);
    this.drumBus = new Tone.Gain(this.partLevels.drums).connect(this.masterBus);

    this.rhodesChorus = new Tone.Chorus(2.8, 2.2, 0.26).start().connect(this.rhodesBus);
    this.rhodesFilter = new Tone.Filter(2200, 'lowpass').connect(this.rhodesChorus);
    this.rhodesBus.connect(this.reverb);
    this.rhodes = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle4' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.45, release: 1.8 },
    }).connect(this.rhodesFilter);

    this.padFilter = new Tone.Filter(1100, 'lowpass').connect(this.padBus);
    this.padBus.connect(this.reverb);
    this.pad = new Tone.PolySynth(Tone.AMSynth, {
      harmonicity: 1.6,
      envelope: { attack: 0.4, decay: 0.8, sustain: 0.85, release: 3.6 },
      modulationEnvelope: { attack: 0.5, decay: 0.2, sustain: 0.5, release: 2.6 },
    }).connect(this.padFilter);

    this.compFilter = new Tone.Filter(1800, 'lowpass').connect(this.compBus);
    this.comp = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle2' },
      envelope: { attack: 0.01, decay: 0.18, sustain: 0.24, release: 0.6 },
    }).connect(this.compFilter);

    this.bassFilter = new Tone.Filter(440, 'lowpass').connect(this.bassBus);
    this.bass = new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.18, sustain: 0.7, release: 0.6 },
      filterEnvelope: { attack: 0.01, decay: 0.12, sustain: 0.25, release: 0.4, baseFrequency: 90, octaves: 2.2 },
    }).connect(this.bassFilter);

    this.leadFilter = new Tone.Filter(1400, 'lowpass').connect(this.leadBus);
    this.leadVibrato = new Tone.Vibrato(4.8, 0.08).connect(this.leadFilter);
    this.leadBus.connect(this.delay);
    this.leadBus.connect(this.reverb);
    this.woodwindLead = new Tone.MonoSynth({
      oscillator: { type: 'triangle3' },
      envelope: { attack: 0.08, decay: 0.22, sustain: 0.5, release: 1.35 },
      filterEnvelope: { attack: 0.04, decay: 0.24, sustain: 0.2, release: 0.8, baseFrequency: 240, octaves: 1.55 },
      portamento: 0.045,
    }).connect(this.leadVibrato);

    this.trumpetLead = new Tone.DuoSynth({
      harmonicity: 1.2,
      voice0: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.04, decay: 0.2, sustain: 0.38, release: 0.8 } },
      voice1: { oscillator: { type: 'triangle' }, envelope: { attack: 0.04, decay: 0.16, sustain: 0.24, release: 0.7 } },
      vibratoAmount: 0.18,
      vibratoRate: 6.2,
    }).connect(this.leadBus);

    this.guitarLead = new Tone.PluckSynth({
      attackNoise: 0.7,
      dampening: 3400,
      resonance: 0.84,
    }).connect(this.leadBus);

    this.kick = new Tone.MembraneSynth({
      pitchDecay: 0.06,
      octaves: 6,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.18 },
    }).connect(this.drumBus);

    this.drumFilter = new Tone.Filter(6200, 'highpass').connect(this.drumBus);
    this.snare = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.001, decay: 0.16, sustain: 0 },
    }).connect(this.drumFilter);
    this.hats = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0 },
    }).connect(this.drumFilter);
    this.openHats = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.22, sustain: 0 },
    }).connect(this.drumFilter);

    this.applyPartLevels();
  }

  private applyTake(take: GeneratedTake, params: GenerationParameters, preservePlayback: boolean): void {
    const resumeProgress = preservePlayback ? this.telemetrySubject.value.progress : 0;
    const preservePosition = preservePlayback && (this.stateSubject.value === 'playing' || this.stateSubject.value === 'paused');
    const shouldResume = preservePlayback && this.stateSubject.value === 'playing';

    this.takeSubject.next(take);

    if (!this.initialized || !this.tone || !this.poweredOn) {
      this.patchTelemetry({
        enabled: this.poweredOn,
        sectionLabel: this.poweredOn ? take.sections[0]?.label ?? 'Ready' : 'Powered off',
        activeParts: take.sections[0]?.activeParts ?? [],
        progress: 0,
        elapsedSeconds: 0,
      });
      return;
    }

    this.disposeParts();
    this.buildSequence(take, params);
    this.seekToProgress(resumeProgress);

    if (!preservePosition) {
      this.tone.Transport.stop();
      this.tone.Transport.position = '0:0:0';
      this.patchTelemetry({ progress: 0, elapsedSeconds: 0 });
      return;
    }

    if (shouldResume) {
      this.play();
    }
  }

  private silenceVoices(): void {
    this.rhodes?.releaseAll?.();
    this.pad?.releaseAll?.();
    this.comp?.releaseAll?.();
    this.bass?.triggerRelease?.();
    this.woodwindLead?.releaseAll?.();
    this.woodwindLead?.triggerRelease?.();
    this.trumpetLead?.triggerRelease?.();
    this.guitarLead?.triggerRelease?.();
    this.guitarComp?.releaseAll?.();
    this.kick?.triggerRelease?.();
    this.snare?.triggerRelease?.();
    this.hats?.triggerRelease?.();
    this.openHats?.triggerRelease?.();
  }

  private buildSequence(take: GeneratedTake, params: GenerationParameters): void {
    if (!this.tone) {
      return;
    }

    const Tone = this.tone;
    Tone.Transport.cancel(0);
    Tone.Transport.loop = true;
    Tone.Transport.loopStart = '0:0:0';
    Tone.Transport.loopEnd = beatToTransportTime(take.totalBars * 4);
    Tone.Transport.bpm.value = take.bpm;

    this.applySoundDesign(params);

    this.parts = [
      this.createChordPart(take.chords, this.rhodes),
      this.createChordPart(take.pad, this.pad),
      this.createChordPart(
        take.comp,
        params.focus === 'guitar-led' ? this.guitarComp : this.comp,
        params.focus === 'guitar-led' ? 0.028 : 0,
      ),
      this.createBassPart(take.bass),
      this.createLeadPart(take.lead, params.focus),
      this.createDrumPart(take.drums),
    ];

    this.parts.forEach((part) => part.start(0));
    this.patchTelemetry({
      progress: 0,
      elapsedSeconds: 0,
      sectionLabel: take.sections[0]?.label ?? 'Ready',
      activeParts: take.sections[0]?.activeParts ?? [],
    });
  }

  private createChordPart(events: readonly ChordEvent[], synth: any, noteSpreadSeconds = 0): any {
    return new this.tone!.Part((time: number, event: any) => {
      const chord = event as ChordEvent;
      const notes = chord.midi.map((note) => midiToNoteName(note));
      const duration = beatsToSeconds(this.tone!, chord.durationBeats);

      if (noteSpreadSeconds > 0) {
        notes.forEach((note, index) => {
          synth.triggerAttackRelease(note, duration, time + index * noteSpreadSeconds, chord.velocity);
        });
        return;
      }

      synth.triggerAttackRelease(notes, duration, time, chord.velocity);
    }, events.map((event) => [beatToTransportTime(event.beat), event]));
  }

  private createPianoChordPart(events: readonly ChordEvent[], synth: any): any {
    return new this.tone!.Part((time: number, event: any) => {
      const chord = event as ChordEvent;
      const notes = chord.midi.map((note) => midiToNoteName(note));
      const durationSeconds = beatsToSeconds(this.tone!, chord.durationBeats);

      buildPianoChordSequence(notes, durationSeconds).forEach((step, index) => {
        synth.triggerAttackRelease(
          step.note,
          step.durationSeconds,
          time + step.offsetSeconds,
          Math.min(1, chord.velocity * (index === 0 ? 1 : 0.92)),
        );
      });
    }, events.map((event) => [beatToTransportTime(event.beat), event]));
  }

  private createPianoNotePart(events: readonly NoteEvent[], synth: any, durationScale: number): any {
    return new this.tone!.Part((time: number, event: any) => {
      const note = event as NoteEvent;
      synth.triggerAttackRelease(
        midiToNoteName(note.midi),
        Math.max(0.08, beatsToSeconds(this.tone!, note.durationBeats) * durationScale),
        time,
        Math.min(1, note.velocity * 0.94),
      );
    }, events.map((event) => [beatToTransportTime(event.beat), event]));
  }

  private createBassPart(events: readonly NoteEvent[]): any {
    return new this.tone!.Part((time: number, event: any) => {
      const note = event as NoteEvent;
      this.bass.portamento = note.slide;
      this.bass.triggerAttackRelease(
        midiToNoteName(note.midi),
        beatsToSeconds(this.tone!, note.durationBeats),
        time,
        note.velocity,
      );
    }, events.map((event) => [beatToTransportTime(event.beat), event]));
  }

  private createPianoDrumPart(events: readonly DrumEvent[], synth: any): any {
    return new this.tone!.Part((time: number, event: any) => {
      const drum = event as DrumEvent;
      synth.triggerAttackRelease(
        midiToNoteName(drumInstrumentToPianoMidi(drum.instrument)),
        Math.max(0.05, beatsToSeconds(this.tone!, drum.durationBeats) * 0.42),
        time,
        Math.min(1, drum.velocity * 0.86),
      );
    }, events.map((event) => [beatToTransportTime(event.beat), event]));
  }

  private createLeadPart(events: readonly NoteEvent[], focus: GenerationParameters['focus']): any {
    const instrument = focus === 'muted-trumpet' ? this.trumpetLead : focus === 'guitar-led' ? this.guitarLead : this.woodwindLead;
    return new this.tone!.Part((time: number, event: any) => {
      const note = event as NoteEvent;
      if (focus === 'guitar-led') {
        if (typeof instrument.triggerAttackRelease === 'function') {
          instrument.triggerAttackRelease(
            midiToNoteName(note.midi),
            beatsToSeconds(this.tone!, note.durationBeats),
            time,
            note.velocity,
          );
        } else {
          instrument.triggerAttack(midiToNoteName(note.midi), time, note.velocity);
        }
        return;
      }

      instrument.portamento = note.slide;
      instrument.triggerAttackRelease(
        midiToNoteName(note.midi),
        beatsToSeconds(this.tone!, note.durationBeats),
        time,
        note.velocity,
      );
    }, events.map((event) => [beatToTransportTime(event.beat), event]));
  }

  private createDrumPart(events: readonly DrumEvent[]): any {
    return new this.tone!.Part((time: number, event: any) => {
      const drum = event as DrumEvent;
      switch (drum.instrument) {
        case 'kick':
          this.kick.triggerAttackRelease('C1', beatsToSeconds(this.tone!, drum.durationBeats), time, drum.velocity);
          break;
        case 'snare':
          this.snare.triggerAttackRelease(beatsToSeconds(this.tone!, drum.durationBeats), time, drum.velocity);
          break;
        case 'open-hat':
          this.openHats.triggerAttackRelease(beatsToSeconds(this.tone!, drum.durationBeats), time, drum.velocity);
          break;
        default:
          this.hats.triggerAttackRelease(beatsToSeconds(this.tone!, drum.durationBeats), time, drum.velocity);
          break;
      }
    }, events.map((event) => [beatToTransportTime(event.beat), event]));
  }

  private async upgradeSampledVoices(): Promise<void> {
    if (!this.tone) {
      return;
    }

    try {
      const manifest = await this.loadSampleManifest();
      const woodwindUrls = createSamplerUrls(manifest.woodwind);
      const guitarUrls = createSamplerUrls(manifest.guitar);

      const woodwindSampler = new this.tone.Sampler({
        urls: woodwindUrls,
        release: 1.2,
      }).connect(this.leadVibrato);

      const guitarLeadSampler = new this.tone.Sampler({
        urls: guitarUrls,
        release: 0.9,
      }).connect(this.leadBus);

      const guitarCompSampler = new this.tone.Sampler({
        urls: guitarUrls,
        release: 1.05,
      }).connect(this.compBus);

      await this.tone.loaded();

      this.woodwindLead?.dispose?.();
      this.guitarLead?.dispose?.();
      this.woodwindLead = woodwindSampler;
      this.guitarLead = guitarLeadSampler;
      this.guitarComp = guitarCompSampler;
    } catch {
      this.guitarComp = this.comp;
    }
  }

  private async loadSampleManifest(): Promise<SampleManifest> {
    const response = await fetch('/audio/samples/jazz-device/manifest.json');
    if (!response.ok) {
      throw new Error(`Sample manifest request failed: ${response.status}`);
    }

    const manifest = (await response.json()) as SampleManifest;
    return manifest;
  }

  private applySoundDesign(params: GenerationParameters): void {
    const sceneAmbience =
      params.scene === 'nightfall' ? 0.08 : params.scene === 'after-hours' ? 0.05 : 0.02;
    const focusLeadCutoff =
      params.focus === 'guitar-led' ? 2600 : params.focus === 'muted-trumpet' ? 1800 : 1300;
    const focusDelay =
      params.focus === 'guitar-led' ? 0.06 : params.focus === 'muted-trumpet' ? 0.12 : 0.18;

    this.reverb?.wet?.rampTo(0.08 + params.ambience * 0.58 + sceneAmbience, 0.2);
    this.delay?.wet?.rampTo(focusDelay + params.ambience * 0.18, 0.2);
    this.rhodesFilter?.frequency?.rampTo(1300 + params.warmth * 1800, 0.2);
    this.padFilter?.frequency?.rampTo(720 + params.warmth * 920 + params.ambience * 460, 0.2);
    this.compFilter?.frequency?.rampTo(
      (params.focus === 'guitar-led' ? 2200 : 1500) + params.chordRichness * 650,
      0.2,
    );
    this.bassFilter?.frequency?.rampTo(220 + params.warmth * 320 + params.bassActivity * 110, 0.2);
    this.leadFilter?.frequency?.rampTo(
      focusLeadCutoff + params.warmth * 420 + (params.octaveRange === 'high' ? 180 : params.octaveRange === 'low' ? -120 : 0),
      0.2,
    );
    this.drumFilter?.frequency?.rampTo(4200 + params.drumDensity * 2800 + params.warmth * 260, 0.2);
    this.rhodesChorus?.wet?.rampTo(0.08 + params.warmth * 0.22 + params.ambience * 0.08, 0.2);
    this.leadVibrato?.depth?.rampTo(params.focus === 'woodwind' ? 0.08 + params.leadAmount * 0.06 : 0.04, 0.2);
  }

  private startTelemetryLoop(): void {
    if (this.updateTimer !== null) {
      return;
    }

    this.updateTimer = window.setInterval(() => this.syncTelemetry(), 120);
  }

  private syncTelemetry(): void {
    if (!this.tone || !this.takeSubject.value || !this.poweredOn) {
      return;
    }

    const take = this.takeSubject.value;
    const bpm = this.tone.Transport.bpm.value;
    const totalSeconds = (take.totalBars * 4 * 60) / bpm;
    const elapsedSeconds = totalSeconds === 0 ? 0 : this.tone.Transport.seconds % totalSeconds;
    const progress = totalSeconds === 0 ? 0 : elapsedSeconds / totalSeconds;
    const currentBar = Math.floor((progress * take.totalBars * 4) / 4);
    const section = take.sections.find(
      (item) => currentBar >= item.startBar && currentBar < item.startBar + item.bars,
    ) ?? take.sections[take.sections.length - 1];

    const meterValue = this.meter.getValue();
    const [meterLeft, meterRight] = Array.isArray(meterValue)
      ? meterValue.map((value) => Number.isFinite(value) ? normalizeDb(value) : 0)
      : [normalizeDb(meterValue), normalizeDb(meterValue)];

    this.patchTelemetry({
      enabled: this.poweredOn,
      elapsedSeconds,
      progress,
      sectionLabel: section?.label ?? 'Ready',
      activeParts: section?.activeParts ?? [],
      meterLeft,
      meterRight,
    });
  }

  private disposeParts(): void {
    this.parts.forEach((part) => {
      part.stop?.();
      part.dispose?.();
    });
    this.parts = [];
  }

  private applyPartLevels(): void {
    if (!this.initialized) {
      return;
    }

    this.rhodesBus?.gain?.rampTo(this.partLevels.rhodes, 0.08);
    this.padBus?.gain?.rampTo(this.partLevels.pad, 0.08);
    this.compBus?.gain?.rampTo(this.partLevels.comp, 0.08);
    this.bassBus?.gain?.rampTo(this.partLevels.bass, 0.08);
    this.leadBus?.gain?.rampTo(this.partLevels.lead, 0.08);
    this.drumBus?.gain?.rampTo(this.partLevels.drums, 0.08);
  }
}

interface PianoChordStep {
  readonly note: string;
  readonly offsetSeconds: number;
  readonly durationSeconds: number;
}

export function buildPianoChordSequence(notes: readonly string[], durationSeconds: number): readonly PianoChordStep[] {
  if (notes.length === 0) {
    return [];
  }

  if (notes.length === 1) {
    return [
      {
        note: notes[0],
        offsetSeconds: 0,
        durationSeconds: Math.max(0.12, durationSeconds * 0.86),
      },
    ];
  }

  const pattern = [...notes, ...notes.slice(1, -1).reverse()];
  const safeDuration = Math.max(0.18, durationSeconds);
  const stepSeconds = Math.min(0.16, Math.max(0.045, safeDuration / (pattern.length + 2)));

  return pattern.map((note, index) => ({
    note,
    offsetSeconds: index * stepSeconds,
    durationSeconds: Math.max(0.1, Math.min(safeDuration * 0.82, safeDuration - index * stepSeconds * 0.3)),
  }));
}

export function drumInstrumentToPianoMidi(instrument: DrumInstrument): number {
  switch (instrument) {
    case 'kick':
      return 36;
    case 'snare':
      return 50;
    case 'open-hat':
      return 57;
    default:
      return 54;
  }
}

function beatToTransportTime(beat: number): string {
  const safeBeat = Math.max(0, beat);
  const bars = Math.floor(safeBeat / 4);
  const remaining = safeBeat - bars * 4;
  const quarters = Math.floor(remaining);
  const sixteenths = Math.round((remaining - quarters) * 4);
  return `${bars}:${quarters}:${sixteenths}`;
}

function beatsToSeconds(tone: ToneModule, beats: number): number {
  return tone.Time(`${beats} * 4n`).toSeconds();
}

function midiToNoteName(midi: number): string {
  const note = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
}

function normalizeDb(value: number): number {
  const clipped = Math.max(-48, Math.min(0, value));
  return (clipped + 48) / 48;
}

function clampLevel(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function createSamplerUrls(samples: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(samples).map(([note, base64]) => [note, `data:audio/wav;base64,${base64}`]),
  );
}
