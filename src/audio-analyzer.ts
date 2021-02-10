export type AudioAnalyzerConfig = {
    context?: AudioContext;
    fftSize?: 32|64|128|256|512|1024|2048|4096|8192|16384|32768;
};

/**
 * Implements an audio analyzer that provides audio stream data.
 * You must call connect() before using.
 */
export class AudioAnalyzer {
    readonly context: AudioContext;
    readonly analyser: AnalyserNode;
    private audioStream?: MediaStreamAudioSourceNode;

    constructor(config?: AudioAnalyzerConfig) {
        this.context = config?.context || new AudioContext();
        this.analyser = this.context.createAnalyser();

        if (config?.fftSize) {
            this.analyser.fftSize = config.fftSize;
        }
    }

    get isConnected(): boolean {
        return this.audioStream !== undefined;
    }

    async connect(): Promise<void> {
        if (!this.audioStream) {
            const mediaStream = await getUserMedia();
            this.audioStream = this.context.createMediaStreamSource(mediaStream);
            this.audioStream.connect(this.analyser);
        }
    }

    disconnect(): void {
        if (this.audioStream) {
            this.audioStream.disconnect(this.analyser);
            this.audioStream = undefined;
        }
    }

    /**
     * Copies the current waveform, or time-domain, data into an array. If an array is not specified it will create a new one.
     * @param array Optional array to copy to
     */
    getFloatTimeDomainData(array?: Float32Array): Float32Array {
        this.analyser.getFloatTimeDomainData(array || (array = new Float32Array(this.analyser.frequencyBinCount)));
        return array;
    }

    /**
     * Copies the current waveform, or time-domain, data into an array. If an array is not specified it will create a new one.
     * @param array Optional array to copy to
     */
    getByteTimeDomainData(array?: Uint8Array): Uint8Array {
        this.analyser.getByteTimeDomainData(array || (array = new Uint8Array(this.analyser.frequencyBinCount)));
        return array;
    }

    /**
     * Copies the current frequency data into an array. If an array is not specified it will create a new one.
     * @param array Optional array to copy to
     */
    getFloatFrequencyData(array?: Float32Array): Float32Array {
        this.analyser.getFloatFrequencyData(array || (array = new Float32Array(this.analyser.frequencyBinCount)));
        return array;
    }

    /**
     * Copies the current frequency data into an array. If an array is not specified it will create a new one.
     * @param array Optional array to copy to
     */
    getByteFrequencyData(array?: Uint8Array): Uint8Array {
        this.analyser.getByteFrequencyData(array || (array = new Uint8Array(this.analyser.frequencyBinCount)));
        return array;
    }
}

async function getUserMedia(): Promise<MediaStream> {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return await navigator.mediaDevices.getUserMedia({ audio: true });
    }

    throw new Error('Audio recording not supported by your web browser');
}
