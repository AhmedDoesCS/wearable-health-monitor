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

## 2026-01-15
Goal:
- Start Rev B design

What I did:
- Made notes on MAX30205 datasheet

What I learned:
- 

Next step:
- 
