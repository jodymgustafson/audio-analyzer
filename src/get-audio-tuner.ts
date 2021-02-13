import { AudioAnalyzer } from "./audio-analyzer";
import { AudioAnalyzerListener } from "./audio-analyzer-listener";
import { AudioTuner } from "./audio-tuner";

/**
 * Gets an audio tuner instance connected and ready to start
 */
export async function getAudioTuner(): Promise<AudioTuner>;
/**
 * Gets an audio tuner instance using the listener
 */
export async function getAudioTuner(listener?: AudioAnalyzerListener): Promise<AudioTuner>;
/**
 * Gets an audio tuner instance using the analyzer
 */
export async function getAudioTuner(analyzer?: AudioAnalyzer): Promise<AudioTuner>;
export async function getAudioTuner(deps?: AudioAnalyzer|AudioAnalyzerListener): Promise<AudioTuner> {
    let listener: AudioAnalyzerListener;

    if (!deps) {
        const analyzer = new AudioAnalyzer();
        await analyzer.connect();
        listener = new AudioAnalyzerListener(analyzer);
    }
    else if (deps instanceof AudioAnalyzer) {
        listener = new AudioAnalyzerListener(deps);
    }
    else {
        listener = deps;
    }

    return new AudioTuner(listener);
}

/**
 * Gets an audio tuner instance that is not connected to audio source
 */
export function getAudioTunerSync(): AudioTuner;
/**
 * Gets an audio tuner instance using the listener
 */
export function getAudioTunerSync(listener?: AudioAnalyzerListener): AudioTuner;
/**
 * Gets an audio tuner instance using the analyzer
 */
export function getAudioTunerSync(analyzer?: AudioAnalyzer): AudioTuner;
export function getAudioTunerSync(deps?: AudioAnalyzer|AudioAnalyzerListener): AudioTuner {
    let listener: AudioAnalyzerListener;

    if (!deps) {
        const analyzer = new AudioAnalyzer();
        listener = new AudioAnalyzerListener(analyzer);
    }
    else if (deps instanceof AudioAnalyzer) {
        listener = new AudioAnalyzerListener(deps);
    }
    else {
        listener = deps;
    }

    return new AudioTuner(listener);
}