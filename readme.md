# Audio Analyzer

This library contains tools for making it easier to work with WebAudio analyzer
including an audio tuner class.

## Audio Analyzer
Provides audio stream data.
It takes care of connecting to an audio stream and provides methods to get data from the stream.

```
const analyzer = new AudioAnalyzer();
await analyzer.connect();
const data = analyzer.getByteFrequencyData();
```

## Audio Analyzer Listener
Gets audio data from an analyzer at a specific interval and sends the data to listeners.
If not specified it will poll for audio data every 50ms.
You must call start() to start receiving events and stop() when done.

```
const listener = new AudioAnalyzerListener(analyzer);
listener.addByteFrequencyDataListener(data => { /* process data */ });
listener.start();
```

## Audio Tuner
Analyzes audio data and converts it into musical note info for tuning
and sends events to listeners.
You must call start() to start receiving events and stop() when done.
This calls start and stop on the underlying Audio Analyzer Listener.

```
const tuner = new AudioTuner(listener);
tuner.addTunerListener(ev => { /* handle event */ });
tuner.start();
```

You can also get an audio tuner using the factory function getAudioTuner().
It will create and connect to an audio analyzer.

```
const tuner = await getAudioTuner();
```

## Build Process
Follow these steps to build the package.

### Initialize
Run `npm init` to install dependencies.

### Build
This library is written in TypeScript.
Run `tsc` to compile.

### Package
Run `npm pack` or `npm run package` from the command line.
