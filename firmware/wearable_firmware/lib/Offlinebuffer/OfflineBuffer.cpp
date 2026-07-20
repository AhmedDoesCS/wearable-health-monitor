#include "OfflineBuffer.h"
#include <LittleFS.h>
#include <ArduinoJson.h>

bool OfflineBuffer::begin() {
  // 'true' tells LittleFS to format the partition automatically if it
  // can't be mounted (e.g. first boot ever, or a corrupted filesystem) —
  // convenient for a hobby project, though it does mean a corrupted
  // filesystem silently wipes itself rather than erroring loudly.
  if (!LittleFS.begin(true)) {
    Serial.println("OfflineBuffer: LittleFS mount failed");
    return false;
  }
  return true;
}

bool OfflineBuffer::addReading(const HealthDataSnapshot &data, unsigned long millisAtReading) {
  File f = LittleFS.open(filename, "a"); // "a" = append, creates file if missing
  if (!f) {
    Serial.println("OfflineBuffer: failed to open file for append");
    return false;
  }

  StaticJsonDocument<256> doc;
  doc["millis_at_reading"] = millisAtReading;
  doc["bpm"] = data.bpm;
  doc["spo2"] = data.spo2;
  doc["steps"] = data.steps;
  doc["temp_c"] = data.tempC;
  doc["kcal_per_min"] = data.kcalPerMin;
  doc["hrv_ms"] = data.hrvMs;

  String line;
  serializeJson(doc, line);
  f.println(line); // one JSON object per line
  f.close();
  return true;
}

bool OfflineBuffer::hasPending() {
  if (!LittleFS.exists(filename)) return false;
  File f = LittleFS.open(filename, "r");
  bool nonEmpty = f && f.size() > 0;
  if (f) f.close();
  return nonEmpty;
}

int OfflineBuffer::pendingCount() {
  if (!LittleFS.exists(filename)) return 0;
  File f = LittleFS.open(filename, "r");
  if (!f) return 0;

  int count = 0;
  while (f.available()) {
    f.readStringUntil('\n');
    count++;
  }
  f.close();
  return count;
}

int OfflineBuffer::readPending(String *outLines, int maxCount) {
  if (!LittleFS.exists(filename)) return 0;
  File f = LittleFS.open(filename, "r");
  if (!f) return 0;

  int count = 0;
  while (f.available() && count < maxCount) {
    String line = f.readStringUntil('\n');
    line.trim();
    if (line.length() > 0) {
      outLines[count] = line;
      count++;
    }
  }
  f.close();
  return count;
}

void OfflineBuffer::clearAll() {
  if (LittleFS.exists(filename)) {
    LittleFS.remove(filename);
  }
}
