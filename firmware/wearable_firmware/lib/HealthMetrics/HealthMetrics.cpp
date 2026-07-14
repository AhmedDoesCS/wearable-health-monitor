#include "HealthMetrics.h"

// --------------------------- Step Counter ------------------------------

StepCounter::StepCounter(float threshold, unsigned long minStepIntervalMs)
  : _threshold(threshold), _minInterval(minStepIntervalMs),
    _lastStepTime(0), _abovePrev(false), _stepCount(0) {}

bool StepCounter::update(float ax, float ay, float az) {
  // Magnitude of the acceleration vector. At rest this should read ~1g
  // regardless of orientation, since gravity is always acting on the sensor.
  float magnitude = sqrt(ax * ax + ay * ay + az * az);
  float deviation = fabs(magnitude - 1.0f);

  bool aboveNow = deviation > _threshold;
  bool stepDetected = false;
  unsigned long now = millis();

  // Only count on the rising edge (deviation just crossed the threshold),
  // and only if enough time has passed since the last counted step —
  // this is the debounce equivalent for accelerometer-based step detection.
  if (aboveNow && !_abovePrev && (now - _lastStepTime) > _minInterval) {
    _stepCount++;
    _lastStepTime = now;
    stepDetected = true;
  }

  _abovePrev = aboveNow;
  return stepDetected;
}

void StepCounter::reset() {
  _stepCount = 0;
  _lastStepTime = 0;
  _abovePrev = false;
}


// -------------------------- Heart Rate Monitor --------------------------

HeartRateMonitor::HeartRateMonitor()
  : _baseline(0), _prevIR(0), _rising(false), _lastBeatTime(0),
    _currentBPM(0), _avgBPM(0), _historyIndex(0), _historyFilled(0) {
  for (int i = 0; i < HISTORY_SIZE; i++) _beatHistory[i] = 0;
}

bool HeartRateMonitor::update(long irValue) {
  // Below this, treat as "no finger on sensor" rather than a real reading.
  // Tune this threshold against your own sensor's baseline no-finger value.
  if (irValue < 50000) {
    return false;
  }

  // Slow-moving exponential average acts as the signal's local baseline —
  // this lets the detector adapt to lighting/skin-contact drift over time
  // instead of using one fixed threshold for the whole session.
  const float alpha = 0.02f;
  if (_baseline == 0) {
    _baseline = irValue;
  } else {
    _baseline = alpha * irValue + (1 - alpha) * _baseline;
  }

  bool beatDetected = false;
  unsigned long now = millis();
  bool aboveBaseline = irValue > _baseline;

  if (aboveBaseline && !_rising) {
    _rising = true;
    unsigned long ibi = now - _lastBeatTime;

    // Reject intervals outside a plausible human heart-rate range
    // (roughly 40-220 BPM) — filters out noise spikes and double-counts.
    if (_lastBeatTime != 0 && ibi > 270 && ibi < 1500) {
      _currentBPM = 60000.0f / ibi;

      _beatHistory[_historyIndex] = _currentBPM;
      _historyIndex = (_historyIndex + 1) % HISTORY_SIZE;
      if (_historyFilled < HISTORY_SIZE) _historyFilled++;

      float sum = 0;
      for (int i = 0; i < _historyFilled; i++) sum += _beatHistory[i];
      _avgBPM = sum / _historyFilled;

      beatDetected = true;
    }
    _lastBeatTime = now;
  } else if (!aboveBaseline) {
    _rising = false;
  }

  _prevIR = irValue;
  return beatDetected;
}


// ----------------------------- SpO2 Estimator ----------------------------

SpO2Estimator::SpO2Estimator()
  : _idx(0), _count(0), _ready(false), _spo2(0) {}

void SpO2Estimator::addSample(long redValue, long irValue) {
  _redBuf[_idx] = redValue;
  _irBuf[_idx] = irValue;
  _idx = (_idx + 1) % WINDOW;
  if (_count < WINDOW) _count++;

  if (_count == WINDOW) {
    computeSpO2();
    _ready = true;
  }
}

void SpO2Estimator::computeSpO2() {
  long redMin = _redBuf[0], redMax = _redBuf[0];
  long irMin = _irBuf[0], irMax = _irBuf[0];
  long redSum = 0, irSum = 0;

  for (int i = 0; i < WINDOW; i++) {
    if (_redBuf[i] < redMin) redMin = _redBuf[i];
    if (_redBuf[i] > redMax) redMax = _redBuf[i];
    redSum += _redBuf[i];

    if (_irBuf[i] < irMin) irMin = _irBuf[i];
    if (_irBuf[i] > irMax) irMax = _irBuf[i];
    irSum += _irBuf[i];
  }

  float redDC = redSum / (float)WINDOW;
  float irDC = irSum / (float)WINDOW;
  float redAC = redMax - redMin;
  float irAC = irMax - irMin;

  if (redDC <= 0 || irDC <= 0 || irAC <= 0) {
    _spo2 = 0; // not enough signal to compute a valid ratio
    return;
  }

  // Ratio-of-ratios: standard PPG approach for estimating SpO2 without a
  // fully calibrated clinical lookup table.
  float R = (redAC / redDC) / (irAC / irDC);
  float spo2 = 110.0f - 25.0f * R;

  if (spo2 > 100) spo2 = 100;
  if (spo2 < 0) spo2 = 0;
  _spo2 = spo2;
}

void SpO2Estimator::reset() {
  _idx = 0;
  _count = 0;
  _ready = false;
  _spo2 = 0;
}


// ------------------------------ HRV Tracker ------------------------------

HRVTracker::HRVTracker()
  : _count(0), _lastBeatTime(0), _hasLastBeat(false) {}

void HRVTracker::addBeat(unsigned long timestampMs) {
  if (_hasLastBeat) {
    unsigned long ibi = timestampMs - _lastBeatTime;

    // Same plausibility filter as HeartRateMonitor, applied independently
    // here since this class doesn't assume it's fed only valid beats.
    if (ibi > 270 && ibi < 1500) {
      if (_count < MAX_INTERVALS) {
        _intervals[_count++] = ibi;
      } else {
        // Buffer full — drop the oldest interval, shift everything down.
        for (int i = 1; i < MAX_INTERVALS; i++) _intervals[i - 1] = _intervals[i];
        _intervals[MAX_INTERVALS - 1] = ibi;
      }
    }
  }
  _lastBeatTime = timestampMs;
  _hasLastBeat = true;
}

float HRVTracker::getSDNN() const {
  if (_count < 2) return 0;

  float mean = 0;
  for (int i = 0; i < _count; i++) mean += _intervals[i];
  mean /= _count;

  float sumSq = 0;
  for (int i = 0; i < _count; i++) {
    float diff = _intervals[i] - mean;
    sumSq += diff * diff;
  }
  return sqrt(sumSq / (_count - 1));
}

float HRVTracker::getRMSSD() const {
  if (_count < 2) return 0;

  float sumSq = 0;
  int pairs = 0;
  for (int i = 1; i < _count; i++) {
    float diff = (float)_intervals[i] - (float)_intervals[i - 1];
    sumSq += diff * diff;
    pairs++;
  }
  if (pairs == 0) return 0;
  return sqrt(sumSq / pairs);
}

void HRVTracker::reset() {
  _count = 0;
  _hasLastBeat = false;
}


// ---------------------------- Temp Smoother ------------------------------

TempSmoother::TempSmoother(float alpha) : _alpha(alpha), _smoothed(0), _initialized(false) {}

float TempSmoother::update(float newSample) {
  if (!_initialized) {
    _smoothed = newSample;
    _initialized = true;
  } else {
    _smoothed = _alpha * newSample + (1 - _alpha) * _smoothed;
  }
  return _smoothed;
}


// ------------------------- Calorie Estimate ------------------------------

float estimateCaloriesPerMinute(float heartRateBPM, float ageYears, float weightKg, bool isMale) {
  // Keytel et al. (2005) heart-rate based regression estimate, output in kJ/min.
  float kJPerMin;
  if (isMale) {
    kJPerMin = -55.0969f + (0.6309f * heartRateBPM) + (0.1988f * weightKg) + (0.2017f * ageYears);
  } else {
    kJPerMin = -20.4022f + (0.4472f * heartRateBPM) - (0.1263f * weightKg) + (0.074f * ageYears);
  }

  float kcalPerMin = kJPerMin / 4.184f;
  if (kcalPerMin < 0) kcalPerMin = 0; // formula can go negative near/at resting HR — clamp to zero
  return kcalPerMin;
}
