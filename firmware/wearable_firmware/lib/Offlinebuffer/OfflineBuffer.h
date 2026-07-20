#pragma once
#include <Arduino.h>
#include "HealthMetrics.h"
#include "DisplayScreens.h" // for HealthDataSnapshot

// =======================================================================
// OfflineBuffer — stores readings locally (LittleFS) when WiFi is
// unavailable, and hands back everything buffered for a batch upload once
// a connection exists. One JSON object per line (JSONL format) — simple to
// append, simple to read back line by line, simple to clear.
// =======================================================================

class OfflineBuffer {
public:
  // Mounts the filesystem. Call once in setup(). Returns false if the
  // filesystem couldn't be mounted or formatted — treat as non-fatal,
  // but readings won't persist across reboots if this fails.
  bool begin();

  // Appends one reading, tagged with the millis() timestamp it was taken
  // at (NOT real time yet — that gets resolved later, see class comment).
  bool addReading(const HealthDataSnapshot &data, unsigned long millisAtReading);

  // True if there's at least one buffered reading waiting to sync.
  bool hasPending();

  // How many readings are currently buffered — useful for a debug print
  // or an on-screen "X readings queued" indicator.
  int pendingCount();

  // Reads every buffered line into the provided array of Strings (each a
  // JSON object) up to maxCount. Returns how many were actually read.
  // Does NOT clear the buffer — call clearAll() only after a confirmed
  // successful upload.
  int readPending(String *outLines, int maxCount);

  // Wipes the buffer. Call this only after the batch upload has actually
  // succeeded — clearing before confirming success would silently lose
  // data on a failed upload.
  void clearAll();

private:
  const char *filename = "/readings.jsonl";
};
