#include "HealthMetrics.h"
#include "DisplayScreens.h"
#include <Arduino.h>
#include "MAX30105.h"
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <SparkFun_TMP117.h>
#include <MPU6050_light.h>
#include "OfflineBuffer.h"
#include <WiFi.h>
#include <time.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>

// -------------- Define buffer  --------------
OfflineBuffer offlineBuffer;
unsigned long lastRecord = 0;
const unsigned long recordInterval = 30000; // buffer a reading every 30s, connected or not

// -------------- Define display button constants --------------
#define BUTTON_PIN 19 // Pin for display button
bool lastButtonState = HIGH;
unsigned long lastPressTime = 0;

// -------------- Define SSD1306 OLED constants --------------
#define SCREEN_WIDTH 128    // OLED Display Width in pixels
#define SCREEN_HEIGHT 64    // OLED Display Height in pixels
#define OLED_RESET -1       // Reset Pin
#define SCREEN_ADDRESS 0x3C // I2C Screen Address

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET); // Initialize Display object
ScreenManager screens(display);                                           // Define Screen Manager using display object

// -------------- Define MPU6050 Sensor constants --------------
MPU6050 mpu6050(Wire); // Initialize sensor object

// -------------- Define MAX30501 Sensor constants --------------
MAX30105 max30105; // initialize sensor object

// -------------- Define TMP117 Sensor constants --------------
TMP117 tmp117; // Initalize sensor object

// -------------- Define HealthMetrics.h constants --------------
StepCounter steps;
HeartRateMonitor hrMonitor;
SpO2Estimator spo2;
HRVTracker hrv;
TempSmoother tempSmooth;

// -------------- Set up decoupling for optimization --------------

unsigned long lastDisplayUpdate = 0;
const unsigned long displayInterval = 200; // 5Hz — plenty for human-readable numbers

unsigned long lastTempRead = 0;
const unsigned long tempInterval = 1000; // temperature changes slowly, no need to poll fast

void setup()
{
    Serial.begin(115200);
    delay(1000);

    pinMode(BUTTON_PIN, INPUT_PULLUP); // initialize button
    // Set up TMP117
    Wire.begin();
    Wire.setClock(400000); // Used for the TMP117

    // Begin sensors
    tmp117.begin();
    Serial.println("TMP117 Begun");

    if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS))
    {
        Serial.println("Display init FAILED");
        while (1)
        {
        }
    }
    else
    {
        Serial.println("Display init OK");
    }

    max30105.begin();
    Serial.println("MAX30105 Begun");

    // Wait for SSD1306 display
    delay(500);

    // MPU6050 Calibration and Success-check
    byte status = mpu6050.begin();
    Serial.println(status);
    while (status != 0)
    {
    }
    mpu6050.calcOffsets();
    Serial.println("Setup complete");

    // Start offlinebuffer
    offlineBuffer.begin();
    WiFi.begin("your_ssid", "your_password"); // non-blocking attempt, don't stall setup() waiting
}

void syncBufferedReadings()
{
    if (WiFi.status() != WL_CONNECTED || !offlineBuffer.hasPending())
        return;

    // Sync real time via NTP now that we're actually connected
    configTime(0, 0, "pool.ntp.org");
    time_t now;
    time(&now);
    unsigned long realTimeNow = now; // seconds since epoch
    unsigned long millisNow = millis();

    const int MAX_BATCH = 50;
    String lines[MAX_BATCH];
    int count = offlineBuffer.readPending(lines, MAX_BATCH);

    bool allSucceeded = true;
    for (int i = 0; i < count; i++)
    {
        // Reconstruct real timestamp from the buffered millis() offset
        StaticJsonDocument<256> doc;
        deserializeJson(doc, lines[i]);
        unsigned long millisAtReading = doc["millis_at_reading"];
        unsigned long realTimestamp = realTimeNow - ((millisNow - millisAtReading) / 1000);
        doc["timestamp"] = realTimestamp;
        doc.remove("millis_at_reading");

        String payload;
        serializeJson(doc, payload);

        HTTPClient http;
        http.begin("https://your-project.supabase.co/rest/v1/readings");
        http.addHeader("Content-Type", "application/json");
        http.addHeader("apikey", "your_api_key");
        int code = http.POST(payload);
        http.end();

        if (code < 200 || code >= 300)
        {
            allSucceeded = false;
            break;
        }
    }

    if (allSucceeded)
        offlineBuffer.clearAll(); // only clear on confirmed full success
}

void loop()
{
    Serial.println(millis());

    // Read button state
    bool currentButtonState = digitalRead(BUTTON_PIN);
    const unsigned long debounceDelay = 50; // milliseconds

    if (currentButtonState == LOW && lastButtonState == HIGH && (millis() - lastPressTime > debounceDelay))
    {
        screens.nextScreen();
        lastPressTime = millis();
    }
    lastButtonState = currentButtonState;

    // feed raw sensor data in, same reads you're already doing
    if (hrMonitor.update(max30105.getIR()))
    {
        hrv.addBeat(hrMonitor.getLastBeatTimestamp());
    }
    spo2.addSample(max30105.getRed(), max30105.getIR());
    steps.update(mpu6050.getAccX(), mpu6050.getAccY(), mpu6050.getAccZ());

    if (millis() - lastTempRead > tempInterval)
    {
        lastTempRead = millis();
        tempSmooth.update(tmp117.readTempC()); 
    }

    HealthDataSnapshot snapshot;
    snapshot.bpm = hrMonitor.getAvgBPM();
    snapshot.bpmReady = hrMonitor.getAvgBPM() > 0;
    snapshot.spo2 = spo2.getSpO2();
    snapshot.spo2Ready = spo2.isReady();
    snapshot.steps = steps.getStepCount();
    snapshot.tempC = tempSmooth.getSmoothed();
    snapshot.kcalPerMin = estimateCaloriesPerMinute(snapshot.bpm, 19, 70, true);
    snapshot.hrvMs = hrv.getSDNN();
    snapshot.hrvReady = hrv.isReady();

    if (millis() - lastDisplayUpdate > displayInterval)
    {
        lastDisplayUpdate = millis();
        screens.draw(snapshot);
    }

    if (millis() - lastRecord > recordInterval)
    {
        lastRecord = millis();
        offlineBuffer.addReading(snapshot, millis());
    }
    syncBufferedReadings(); // cheap no-op if disconnected or nothing pending
}