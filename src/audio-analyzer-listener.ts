import { EventEmitter } from 'events';
import { AudioAnalyzer } from './audio-analyzer';

export type AudioAnalyzerListenerConfig = {
    gainThreshold?: number;
    audioPollInterval?: number;
};

const defaultConfig: AudioAnalyzerListenerConfig = {
    gainThreshold: 0.01,
    audioPollInterval: 50
};

/**
 * Gets audio data from an analyzer at a specific interval and sends the data
 * to listeners
 */
export class AudioAnalyzerListener extends EventEmitter {
    private config: AudioAnalyzerListenerConfig
    private intervalId = 0;
    private floatTTD?: Float32Array;
    private byteTTD?: Uint8Array;
    private floatFreq?: Float32Array;
    private byteFreq?: Uint8Array;

    constructor(readonly analyzer: AudioAnalyzer, config?: AudioAnalyzerListenerConfig) {
        super();

        this.config = Object.assign({}, defaultConfig, config);
    }

    get isRunning(): boolean {
        return this.intervalId > 0;
    }
    
    addFloatTimeDomainDataListener(cb: (data: Float32Array) => any): void {
        this.on("float-time-domain", cb);
    }

    removeFloatTimeDomainDataListener(cb: (data: Float32Array) => any): void {
        this.off("float-time-domain", cb);
    }

    addByteTimeDomainDataListener(cb: (data: Uint8Array) => any): void {
        this.on("byte-time-domain", cb);
    }

    removeByteTimeDomainDataListener(cb: (data: Uint8Array) => any): void {
        this.off("byte-time-domain", cb);
    }

    addFloatFrequencyDataListener(cb: (data: Float32Array) => any): void {
        this.on("float-frequency", cb);
    }

    removeFloatFrequencyDataListener(cb: (data: Float32Array) => any): void {
        this.off("float-frequency", cb);
    }

    addByteFrequencyDataListener(cb: (data: Uint8Array) => any): void {
        this.on("byte-frequency", cb);
    }

    removeByteFrequencyDataListener(cb: (data: Uint8Array) => any): void {
        this.off("byte-frequency", cb);
    }

    start(): void {
        if (this.intervalId === 0) {
            if (!this.analyzer.isConnected) {
                throw new Error("You must call AudioAnalyzer.connect() before starting")
            }

            this.intervalId = setInterval(() => this.handleAudioEvent(), this.config.audioPollInterval);
        }
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = 0;
        }
    }

    private handleAudioEvent(): void {
        if (this.listenerCount("float-time-domain") > 0) {
            this.floatTTD = this.analyzer.getFloatTimeDomainData(this.floatTTD);
            this.emit("float-time-domain", checkGain(this.floatTTD, this.config.gainThreshold!) ? this.floatTTD : undefined);
        }
        
        if (this.listenerCount("byte-time-domain") > 0) {
            this.byteTTD = this.analyzer.getByteTimeDomainData(this.byteTTD);
            this.emit("byte-time-domain", checkGain(this.byteTTD, this.config.gainThreshold! * 255) ? this.byteTTD : undefined);
        }

        if (this.listenerCount("float-frequency") > 0) {
            this.floatTTD = this.analyzer.getFloatFrequencyData(this.floatFreq);
            this.emit("float-frequency", this.floatFreq);
        }
        
        if (this.listenerCount("byte-frequency") > 0) {
            this.byteFreq = this.analyzer.getByteTimeDomainData(this.byteFreq);
            this.emit("byte-frequency", this.byteFreq);
        }
    }
}

function checkGain(array: Float32Array|Uint8Array, threshold: number): boolean {
    const len = array.length;
    for (let i = 0; i < len; i++) {
        if (array[i] > threshold) {
            return true;
        }
    }

    return false;
}