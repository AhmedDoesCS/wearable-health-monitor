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

void setup()
{
    pinMode(BUTTON_PIN, INPUT_PULLUP); // initialize button

    // Begin sensors
    tmp117.begin();
    display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS);
    max30105.begin();

    // Set up TMP117
    Wire.begin();
    Wire.setClock(400000); // Used for the TMP117

    // Wait for SSD1306 display
    delay(500);

    // MPU6050 Calibration and Success-check
    byte status = mpu6050.begin();
    while (status != 0)
    {
    }
    mpu6050.calcOffsets();
}

void loop()
{
    // Read button state
    bool currentButtonState = digitalRead(BUTTON_PIN);
    if (currentButtonState == LOW && lastButtonState == HIGH)
    {
        // this is the exact moment the button was just pressed
    }
    lastButtonState = currentButtonState;

    const unsigned long debounceDelay = 50; // milliseconds

    if (currentButtonState == LOW && lastButtonState == HIGH)
    {
        if (millis() - lastPressTime > debounceDelay)
        {
            // valid press — do the thing
            lastPressTime = millis();
        }
    }

    // feed raw sensor data in, same reads you're already doing
    if (hrMonitor.update(max30105.getIR()))
    {
        hrv.addBeat(hrMonitor.getLastBeatTimestamp());
    }
    spo2.addSample(max30105.getRed(), max30105.getIR());
    steps.update(mpu6050.getAccX(), mpu6050.getAccY(), mpu6050.getAccZ());
    float smoothTemp = tempSmooth.update(tmp117.readTempC());

    // pull values whenever you're ready to display them
    float bpm = hrMonitor.getAvgBPM();
    float o2 = spo2.isReady() ? spo2.getSpO2() : -1; // -1 = not enough data yet
    float hrvMs = hrv.isReady() ? hrv.getSDNN() : -1;
    float kcal = estimateCaloriesPerMinute(bpm, /*age*/ 19, /*weight kg*/ 70, /*isMale*/ true);

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

    screens.draw(snapshot);
}