#pragma once
#include <Arduino.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// =======================================================================
// DisplayScreens — OLED screen layout + cycling for the wearable's six
// health metric screens. Pairs with HealthMetrics.h, which does the actual
// sensor math; this file only cares about drawing numbers/icons to the OLED.
// =======================================================================


// ------------------------------ Bitmap Assets -----------------------------
// Currently blank placeholders (all-zero arrays) so the project compiles
// and runs before your real assets exist — a blank icon just draws nothing,
// it won't crash the display. Replace the array contents with image2cpp
// output once you've designed each icon. Keep the W/H #defines in sync with
// whatever size you actually export at — drawBitmap() will render garbage
// if the declared size doesn't match the real bitmap dimensions.

extern const unsigned char PROGMEM icon_heart[];
#define ICON_HEART_W 16
#define ICON_HEART_H 16

extern const unsigned char PROGMEM icon_lungs[];
#define ICON_LUNGS_W 16
#define ICON_LUNGS_H 16

extern const unsigned char PROGMEM icon_footsteps[];
#define ICON_FOOTSTEPS_W 16
#define ICON_FOOTSTEPS_H 16

extern const unsigned char PROGMEM icon_thermometer[];
#define ICON_THERMOMETER_W 16
#define ICON_THERMOMETER_H 16

extern const unsigned char PROGMEM icon_flame[];
#define ICON_FLAME_W 16
#define ICON_FLAME_H 16

extern const unsigned char PROGMEM icon_pulse_wave[];
#define ICON_PULSE_WAVE_W 16
#define ICON_PULSE_WAVE_H 16


// ------------------------------ Data Snapshot -----------------------------
// One frame's worth of health data. Deliberately decoupled from the sensor
// library objects themselves (MAX30105, TMP117, etc.) — ScreenManager only
// ever sees plain numbers, so your display code doesn't need to know
// anything about I2C, sensor libraries, or HealthMetrics internals.
struct HealthDataSnapshot {
  float bpm;
  bool bpmReady;        // false until HeartRateMonitor has enough beats

  float spo2;
  bool spo2Ready;        // false until SpO2Estimator's window is full

  unsigned long steps;

  float tempC;

  float kcalPerMin;

  float hrvMs;
  bool hrvReady;          // false until HRVTracker has at least 2 beats
};


// -------------------------------- Screen IDs ------------------------------
enum ScreenID {
  SCREEN_HEART_RATE = 0,
  SCREEN_SPO2,
  SCREEN_STEPS,
  SCREEN_TEMP,
  SCREEN_CALORIES,
  SCREEN_HRV,
  SCREEN_COUNT   // keep last — used for wraparound math, not a real screen
};


// ------------------------------ Screen Manager ----------------------------
// Owns which screen is currently showing and how to draw each one. Call
// nextScreen()/previousScreen() from your button-press logic, and draw()
// once per loop with a fresh HealthDataSnapshot.
class ScreenManager {
public:
  ScreenManager(Adafruit_SSD1306 &display);

  void nextScreen();
  void previousScreen();
  ScreenID getCurrentScreen() const { return _current; }

  void draw(const HealthDataSnapshot &data);

private:
  Adafruit_SSD1306 &_display;
  ScreenID _current;

  void drawHeartRateScreen(const HealthDataSnapshot &data);
  void drawSpO2Screen(const HealthDataSnapshot &data);
  void drawStepsScreen(const HealthDataSnapshot &data);
  void drawTempScreen(const HealthDataSnapshot &data);
  void drawCaloriesScreen(const HealthDataSnapshot &data);
  void drawHRVScreen(const HealthDataSnapshot &data);

  // Shared layout: icon on the left, big value next to it, small unit
  // label underneath. All six screens use this so they feel like one
  // consistent design system rather than six separately designed screens.
  void drawMetricLayout(const uint8_t *bitmap, int iconW, int iconH,
                         const char *valueStr, const char *unitLabel);
};
