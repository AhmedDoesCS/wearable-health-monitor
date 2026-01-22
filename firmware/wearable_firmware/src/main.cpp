#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

void setup() {
  Serial.begin(115200);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("This operation has failed.");
    for(;;);
  }

  delay(2000);

  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);

  display.setCursor(0, 0);
  display.println("HOLY SHIT LOIS IT WORKS!!!!");
  display.display();
}

void loop() {
  if (Serial.available() > 0) {
    String userInput = Serial.readStringUntil('\n');

    display.clearDisplay();
    display.setCursor(0,0);
    display.println(userInput);
    display.display();
  }
}
