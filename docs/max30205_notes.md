# MAX30205 — Key Notes (for Rev B integration)

## What it is
- Digital temperature sensor designed for **human body temperature** applications.
- Measures **die temperature**, so PCB/mechanical thermal design strongly affects accuracy.

## Electrical (ESP32-friendly)
- Supply (VDD): **2.7V–3.3V** → compatible with ESP32 3.3V rail.
- Current:
  - Active: ~hundreds of µA (low power)
  - Shutdown: a few µA (great for wearables)
- Decoupling: **0.1µF** from VDD to GND placed *right at the pins* (mandatory).

## I2C interface
- I2C up to **400kHz**.
- SDA/SCL are **open-drain** → requires pull-up resistors on the bus (typical 4.7kΩ).
- Works naturally on the same SDA/SCL bus as OLED + MAX30102.

## Addressing (Rev B planning)
- Address pins: A0, A1, A2 allow multiple unique addresses (multi-sensor friendly).
- **Do not leave address pins floating**. Hard-tie to GND/VDD (or other allowed strap options).
- Typical base case: all straps to GND → common default address (plan this into Rev B).

## OS/INT output (optional)
- OS pin is **open-drain** alert/interrupt output (configurable behavior).
- Option for Rev B:
  - route OS to an ESP32 GPIO for event-driven sampling
  - or expose as test point / header if not used

## Firmware essentials (minimum viable driver)
- Registers you care about:
  - Temp register (read 16-bit)
  - Config register (modes)
  - THYST / TOS thresholds (if using alerts)
- Temp conversion:
  - read two bytes (MSB first), interpret signed, scale by LSB (datasheet format)

## Layout / thermal (CRITICAL)
- Accuracy depends heavily on thermal coupling:
  - Keep sensor away from ESP32 / regulators / hot copper.
  - Use “thermal island” strategy: minimal copper under/around sensor; narrow neck connection.
  - Keep ground connection correct but avoid large heat-sinking planes pulling it toward board temp.
