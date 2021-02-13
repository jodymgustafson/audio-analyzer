import * as PitchFinder from 'pitchfinder';
import { EventEmitter } from 'events';
import { AudioAnalyzerListener } from './audio-analyzer-listener';

const NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const MIDDLE_A = 440;
const SEMITONE = 69;

export type TunerEvent = {
    /** Name of the musical note */
    note: string;
    /** Number of the note where 0=A1 */
    noteNumber: number;
    /** Octave of the note */
    octave: number;
    /** Number of cents off from perfect for the note the frequency is */
    cents: number;
    /** Frequency of the audio data */
    frequency: number;
};

/**
 * Analyzes audio data and converts it into musical note info for tuning
 */
export class AudioTuner extends EventEmitter {
    private pitchFinder = PitchFinder.AMDF({ sampleRate: this.listener.analyzer.context.sampleRate });

    constructor(private listener: AudioAnalyzerListener) {
        super();
        listener.addFloatTimeDomainDataListener(data => this.handleEvent(data));
    }

    start(pollInterval?: number): void {
        this.listener.start(pollInterval);
        //console.log("started");
    }

    stop(): void {
        this.listener.stop();
        //console.log("stopped");
    }

    addTunerListener(cb: (ev: TunerEvent) => any): void {
        this.on("note", cb);
    }

    removeTunerListener(cb: (ev: TunerEvent) => any): void {
        this.off("note", cb);
    }

    private handleEvent(data: Float32Array): void {
        if (data) {
            const frequency = this.pitchFinder(data);

            if (frequency && this.listenerCount("tuner")) {
                const note = getNoteNumber(frequency);
                this.emit("tuner", {
                    noteNumber: note,
                    note: getNoteName(note),
                    cents: getCents(frequency, note),
                    octave: getOctave(note),
                    frequency
                } as TunerEvent);
            }
        }
        else {
            this.emit("tuner", {
                note: "",
                noteNumber: 0,
                cents: 0,
                octave: 0,
                frequency: 0
            } as TunerEvent);
        }
    }
}

function getNoteName(note: number): string {
    return NOTES[note % 12];
}

function getOctave(note: number): number {
    return Math.floor(note / 12) - 1;
}

// Gets musical note number from frequency
function getNoteNumber(frequency: number): number {
    return Math.round(12 * Math.log2(frequency / MIDDLE_A)) + SEMITONE;
}

// Get a musical note's standard frequency
function getNoteFrequency(note: number): number {
    return MIDDLE_A * Math.pow(2, (note - SEMITONE) / 12);
}

// Gets cents difference between a frequency and musical note's standard frequency
function getCents(frequency: number, note: number): number {
    return Math.floor(1200 * Math.log2(frequency / getNoteFrequency(note)));
}
