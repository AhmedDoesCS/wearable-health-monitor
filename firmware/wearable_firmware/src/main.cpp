#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#include "MAX30105.h"   // SparkFun MAX3010x library
#include "heartRate.h"  // SparkFun heart rate algorithm helper (optional)

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
MAX30105 particleSensor;

uint32_t lastDisplayMs = 0;
const uint32_t displayPeriodMs = 200; // 5 Hz display refresh

const byte RATE_SIZE = 4;  //Increase this for more averaging. 4 is good.
byte rates[RATE_SIZE];     //Array of heart rates
byte rateSpot = 0;
long lastBeat = 0;  //Time at which the last beat occurred

float beatsPerMinute;  //Current BPM value
int beatAvg;           //Average BPM value

void setup() {
  Serial.begin(115200);
  Wire.begin();  // ESP32 can use Wire.begin(SDA, SCL);

  // ---- OLED init ----
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {  // try 0x3D if needed
    Serial.println("SSD1306 allocation failed");
    while (1) {}
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("Booting...");
  display.display();

  // ---- MAX30102 init ----
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {  // 400kHz
    Serial.println("MAX30102 not found. Check wiring.");
    while (1) {}
  }

  // Basic sensor config (good starting point)
  // brightness (0-255), sampleAverage, ledMode, sampleRate, pulseWidth, adcRange
  particleSensor.setup();                     //Configure sensor with default settings
  particleSensor.setPulseAmplitudeRed(0x0A);  //Turn Red LED to low to indicate sensor is running
  particleSensor.setPulseAmplitudeGreen(0);   //Turn off Green LED

  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("MAX30102 + OLED OK");
  display.display();
  delay(500);
}

void loop() {
  // Read raw samples
  long irValue = particleSensor.getIR();

  if (checkForBeat(irValue) == true) {
    //Calculate beatsPerMinute
    long delta = millis() - lastBeat;
    lastBeat = millis();
    beatsPerMinute = 60 / (delta / 1000.0);

    if (beatsPerMinute < 255 && beatsPerMinute > 20) {  //Check if the BPM value is within a valid range
      rates[rateSpot++] = (byte)beatsPerMinute;         //Store this reading in the array
      rateSpot %= RATE_SIZE;                            //Wrap variable

      //Take average of readings
      beatAvg = 0;
      for (byte x = 0; x < RATE_SIZE; x++)
        beatAvg += rates[x];
      beatAvg /= RATE_SIZE;
    }
  }

  // Update OLED at a slower rate
  if (millis() - lastDisplayMs >= displayPeriodMs) {
    lastDisplayMs = millis();

    display.clearDisplay();
    display.setCursor(0, 0);
    display.print("IR : ");
    display.println(irValue);
    display.print("BPM: ");
    display.println(beatsPerMinute);
    display.print("Avg BPM: ");
    display.println(beatAvg);

    display.display();
  }

  // Also echo to serial if you want
  // Serial.print("IR="); Serial.print(irValue);
  // Serial.print(" RED="); Serial.println(redValue);
}
