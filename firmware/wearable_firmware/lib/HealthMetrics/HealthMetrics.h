#pragma once
#include <Arduino.h>

// =======================================================================
// HealthMetrics - signal processing helpers for MAX30102 / TMP117 / MPU6050
//
// Each class owns its own rolling state (baselines, buffers, timers) so you
// can just feed it raw sensor readings every loop() and ask it for results
// when you need them. Nothing here talks to I2C directly — you still own
// reading the sensors in your main sketch; these just process the numbers.
// =======================================================================


// --------------------------- Step Counter ------------------------------
// Feed raw MPU6050 accelerometer readings (in g's) every loop. Detects a
// step whenever the acceleration magnitude deviates from 1g (gravity at
// rest) by more than `threshold`, with a refractory period so a single
// footfall isn't counted multiple times.
class StepCounter {
public:
  StepCounter(float threshold = 1.2f, unsigned long minStepIntervalMs = 300);
  bool update(float ax, float ay, float az);   // returns true exactly on the loop a step is counted
  unsigned long getStepCount() const { return _stepCount; }
  void reset();

private:
  float _threshold;
  unsigned long _minInterval;
  unsigned long _lastStepTime;
  bool _abovePrev;
  unsigned long _stepCount;
};


// -------------------------- Heart Rate Monitor --------------------------
// Feed raw MAX30102 IR readings every loop. Uses an adaptive (slow-moving)
// baseline and detects upward crossings above it as heartbeats, filtering
// out intervals outside a plausible human heart-rate range.
class HeartRateMonitor {
public:
  HeartRateMonitor();
  bool update(long irValue);                  // returns true exactly on the loop a new beat is detected
  float getBPM() const { return _currentBPM; }       // most recent single-beat BPM
  float getAvgBPM() const { return _avgBPM; }         // rolling average of last few beats (more stable)
  unsigned long getLastBeatTimestamp() const { return _lastBeatTime; } // feed this into HRVTracker::addBeat()

private:
  static const int HISTORY_SIZE = 4;
  float _baseline;
  long _prevIR;
  bool _rising;
  unsigned long _lastBeatTime;
  float _currentBPM;
  float _avgBPM;
  float _beatHistory[HISTORY_SIZE];
  int _historyIndex;
  int _historyFilled;
};


// ----------------------------- SpO2 Estimator ----------------------------
// Feed raw (red, IR) sample pairs every loop. Buffers a window of samples,
// then computes an estimate using the standard AC/DC ratio-of-ratios
// approximation. This is the same category of estimate most consumer
// pulse oximeters use as a baseline, not a clinically calibrated result.
class SpO2Estimator {
public:
  SpO2Estimator();
  void addSample(long redValue, long irValue);
  bool isReady() const { return _ready; }      // true once enough samples are buffered for an estimate
  float getSpO2() const { return _spo2; }      // percentage, 0-100
  void reset();

private:
  static const int WINDOW = 50;
  long _redBuf[WINDOW];
  long _irBuf[WINDOW];
  int _idx;
  int _count;
  bool _ready;
  float _spo2;
  void computeSpO2();
};


// ------------------------------ HRV Tracker ------------------------------
// Call addBeat() with a timestamp every time HeartRateMonitor reports a new
// beat (use getLastBeatTimestamp() from the monitor). Tracks a rolling
// window of beat-to-beat intervals and computes two standard HRV metrics:
//   SDNN  — standard deviation of intervals (overall variability)
//   RMSSD — root mean square of successive differences (short-term variability)
class HRVTracker {
public:
  HRVTracker();
  void addBeat(unsigned long timestampMs);
  bool isReady() const { return _count >= 2; }
  float getSDNN() const;   // milliseconds
  float getRMSSD() const;  // milliseconds
  void reset();

private:
  static const int MAX_INTERVALS = 20;
  unsigned long _intervals[MAX_INTERVALS];
  int _count;
  unsigned long _lastBeatTime;
  bool _hasLastBeat;
};


// ---------------------------- Temp Smoother ------------------------------
// Simple exponential moving average for TMP117 readings, so displayed skin
// temperature doesn't jitter reading-to-reading. `alpha` closer to 1 =
// more responsive/less smoothing; closer to 0 = smoother/slower to react.
class TempSmoother {
public:
  TempSmoother(float alpha = 0.1f);
  float update(float newSample);
  float getSmoothed() const { return _smoothed; }

private:
  float _alpha;
  float _smoothed;
  bool _initialized;
};


// ------------------------- Calorie Estimate ------------------------------
// Heart-rate based regression estimate (Keytel et al., 2005), the same
// general approach most consumer wearables use. Returns kcal burned per
// minute at the given heart rate — multiply by elapsed minutes for a
// session total. Approximate, not a metabolic measurement.
float estimateCaloriesPerMinute(float heartRateBPM, float ageYears, float weightKg, bool isMale);
