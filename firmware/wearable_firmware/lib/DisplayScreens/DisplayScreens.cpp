#include "DisplayScreens.h"

// ------------------------------ Bitmap Assets -----------------------------
// Blank 16x16 placeholders (32 bytes each — 16 rows x 2 bytes/row for a
// 16px-wide 1-bit bitmap). Replace the contents of each array with your
// real image2cpp output; leave the "PROGMEM" and array length matching
// what image2cpp generates for your chosen icon size.

const unsigned char PROGMEM icon_heart[] = {
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
};

const unsigned char PROGMEM icon_lungs[] = {
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
};

const unsigned char PROGMEM icon_footsteps[] = {
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
};

const unsigned char PROGMEM icon_thermometer[] = {
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
};

const unsigned char PROGMEM icon_flame[] = {
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
};

const unsigned char PROGMEM icon_pulse_wave[] = {
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
};


// ------------------------------ Screen Manager ----------------------------

ScreenManager::ScreenManager(Adafruit_SSD1306 &display)
  : _display(display), _current(SCREEN_HEART_RATE) {}

void ScreenManager::nextScreen() {
  _current = (ScreenID)((_current + 1) % SCREEN_COUNT);
}

void ScreenManager::previousScreen() {
  _current = (ScreenID)((_current + SCREEN_COUNT - 1) % SCREEN_COUNT);
}

void ScreenManager::draw(const HealthDataSnapshot &data) {
  _display.clearDisplay();

  switch (_current) {
    case SCREEN_HEART_RATE: drawHeartRateScreen(data); break;
    case SCREEN_SPO2:       drawSpO2Screen(data);       break;
    case SCREEN_STEPS:      drawStepsScreen(data);      break;
    case SCREEN_TEMP:       drawTempScreen(data);       break;
    case SCREEN_CALORIES:   drawCaloriesScreen(data);   break;
    case SCREEN_HRV:        drawHRVScreen(data);        break;
    default: break;
  }

  _display.display();
}

void ScreenManager::drawMetricLayout(const uint8_t *bitmap, int iconW, int iconH,
                                      const char *valueStr, const char *unitLabel) {
  // Icon, top-left
  _display.drawBitmap(4, 4, bitmap, iconW, iconH, SSD1306_WHITE);

  // Big value, next to the icon
  _display.setTextSize(2);
  _display.setCursor(iconW + 14, 8);
  _display.print(valueStr);

  // Small unit label, below
  _display.setTextSize(1);
  _display.setCursor(4, iconH + 12);
  _display.print(unitLabel);
}

void ScreenManager::drawHeartRateScreen(const HealthDataSnapshot &data) {
  char buf[8];
  if (data.bpmReady) {
    snprintf(buf, sizeof(buf), "%.0f", data.bpm);
  } else {
    snprintf(buf, sizeof(buf), "--");
  }
  drawMetricLayout(icon_heart, ICON_HEART_W, ICON_HEART_H, buf, "BPM");
}

void ScreenManager::drawSpO2Screen(const HealthDataSnapshot &data) {
  char buf[8];
  if (data.spo2Ready) {
    snprintf(buf, sizeof(buf), "%.0f", data.spo2);
  } else {
    snprintf(buf, sizeof(buf), "--");
  }
  drawMetricLayout(icon_lungs, ICON_LUNGS_W, ICON_LUNGS_H, buf, "SpO2 %");
}

void ScreenManager::drawStepsScreen(const HealthDataSnapshot &data) {
  char buf[12];
  snprintf(buf, sizeof(buf), "%lu", data.steps);
  drawMetricLayout(icon_footsteps, ICON_FOOTSTEPS_W, ICON_FOOTSTEPS_H, buf, "steps");
}

void ScreenManager::drawTempScreen(const HealthDataSnapshot &data) {
  char buf[8];
  snprintf(buf, sizeof(buf), "%.1f", data.tempC);
  drawMetricLayout(icon_thermometer, ICON_THERMOMETER_W, ICON_THERMOMETER_H, buf, "C skin");
}

void ScreenManager::drawCaloriesScreen(const HealthDataSnapshot &data) {
  char buf[8];
  snprintf(buf, sizeof(buf), "%.1f", data.kcalPerMin);
  drawMetricLayout(icon_flame, ICON_FLAME_W, ICON_FLAME_H, buf, "kcal/min");
}

void ScreenManager::drawHRVScreen(const HealthDataSnapshot &data) {
  char buf[8];
  if (data.hrvReady) {
    snprintf(buf, sizeof(buf), "%.0f", data.hrvMs);
  } else {
    snprintf(buf, sizeof(buf), "--");
  }
  drawMetricLayout(icon_pulse_wave, ICON_PULSE_WAVE_W, ICON_PULSE_WAVE_H, buf, "HRV ms");
}
