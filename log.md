# Wearable Health Monitor — Engineering Log

## 2026-01-12
Goal:
- Learn I2C protocols using Arduino basics.
- Extract relevant data from datasheets.

What I did:
- Initialized platformio project.
- Successfully ran I2C communication between LCD and Arduino Mega.

What failed:
- Did not go through datasheets.

What I learned:
- I2C communication through Arduino interfaces uses the Wire.h library as a prerequisite library for other derivative libraries like LiquidCrystal_I2C.h.
- I was able to program LCD control through the Arduino IDE's console using the aforementioned libraries.

Next step:
- Go through datasheets and extract relevant data.

## 2026-01-13
Goal:
- Extract relevant data from datasheets.
- Make note of essential Arduino-based functions.

What I did:
- Extracted information from MAX30102 datasheet into notes in max30102_notes.md file.
- Began work on schematic for revision A PCB.

What I learned:
- KiCad:
    - Placing socket connections
    - Using net labels

Next step:
- Finalize Rev A v1 schematic design.

## 2026-01-14
Goal:
- Finish Rev A v1 schematic design.

What I did:
- Made progress on Rev A v1 schematic

What I learned:
- KiCad:
    - Using No Connection "X" marks
    - Decoupling capacitor positioning
    - Using test points in circuit boards
    - Using Electrical Rule Checker

Next step:
- Design v1 PCB of Rev A 

## 2026-01-15
Goal:
- Start Rev A v1 PCB design.

What I did:
- Assigned footprints to schematic symbols.
- Completed Rev A v1 PCB design.

What I learned:
- KiCad:
    - How to assign footprints to schematic symbols
    - Working with Edge.Cuts layer
    - Modifying corners using fillet
    - Adding custom widths for traces
    - Routing components

Next step:
- Modify Rev A and read datasheets for all sensors.

## 2026-01-21
Goal:
- Test and learn to use new components.

What I did:
- Tested and made notes on the SSD1306.
- Properly set up PlatformIO.
- Set up test circuit on breadboard to run ESP32 and SSD1306 OLED display.

What I learned:
- How to initialize platformIO projects.
- How to program SSD1306 using Adafruit Graphics libraries.
- How to program ESP32 using Arduino framework.

Next step:
- Solder MAX30102 and learn how to display information on OLED screen.

## 2026-01-22
Goal:
- Represent MAX30102 data on OLED

What I did:
- Soldered headers to MAX30102.
- Soldered headers to MPU6050.
- Connected both peripherals to ESP32 I2C bus.
- Wrote code utilizing both devices together.
- Initialized software project folder to start database app development.

What I learned:
- Controlling multiple peripherals through one I2C bus.
- Connecting peripherals in parallel to one master.

Next step:
- Test MPU6050 sensor and connect it to the current system.
- Develop a voltage divider to convert 9V source to 3.3V.


## 2026-02-08
Goal:
- Initialize activity software architecture.

What I did:
- Initialized frontend and backend systems for activity monitor.

What I learned:
- Server design and application
- Using mysql2 to retrieve and store data through relational databases
- Requesting and sending commands through HTTP requests.

Next step:
- Continue software architecture.
- Progress in Rev B PCB
