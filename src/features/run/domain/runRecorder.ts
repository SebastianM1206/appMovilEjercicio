export type RunSample = {
  ts: number;
  lat: number;
  lon: number;
  speed: number;
};

export const createRunRecorder = () => {
  const samples: RunSample[] = [];

  return {
    addSample(sample: RunSample) {
      samples.push(sample);
    },
    getSamples() {
      return [...samples];
    },
    reset() {
      samples.length = 0;
    }
  };
};
