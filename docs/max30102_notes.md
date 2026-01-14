# MAX30102 — Integration Notes (v1)

## Purpose
Integrated optical heart-rate / SpO₂ sensor with Red + IR LEDs, photodiode, ADC, FIFO, and I²C interface. Designed for wrist-worn wearables.

---

## Power
- **VDD (logic/analog):** ~1.8 V (1.7–2.0 V)
- **VLED+:** 3.1–5.0 V
- **Shutdown current:** ~0.7 µA
- Breakout boards usually include 1.8 V regulation + level shifting → safe with ESP32 3.3 V I²C

---

## Interface
- **Protocol:** I²C
- **Max clock:** 400 kHz
- **7-bit address:** `0x57`
- **SDA / INT:** open-drain → requires pull-up (~4.7 kΩ)
- One set of pull-ups per I²C bus

---

## Pins (v1)
**Required**
- VDD
- GND
- SDA
- SCL
- VLED+
- PGND

**Optional**
- INT (active-low interrupt)

**Ignore**
- N.C. pins

---

## Measurement
- **ADC:** up to 18-bit
- **Sample rate:** 50–3200 sps
- **FIFO depth:** 32 samples
- **SpO₂ mode:** 6 bytes/sample (Red[3] + IR[3])

---

## FIFO
- First-In-First-Out buffer
- Sensor samples continuously → MCU reads in bursts
- FIFO must be cleared at startup
- Prevents data loss and reduces MCU load

---

## Modes
- Heart Rate (Red only)
- SpO₂ (Red + IR)
- Mode set via `MODE_CONFIG` register
- **V1 choice:** SpO₂ mode

---

## Initialization (minimum)
1. Power applied
2. Reset device
3. Clear FIFO pointers
4. Configure mode, sample rate, pulse width
5. Set LED current
6. Read interrupt status to clear flags

---

## Data Format
- Each channel stored as 24-bit value
- Valid data is **18 bits**
- Mask after read: `value & 0x3FFFF`

---

## Optical / Mechanical Notes
- Reflective PPG → sensitive to motion & ambient light
- Requires:
  - good skin contact
  - light-blocking gasket
  - stable pressure
- Mechanical design strongly affects signal quality

---

## Gotchas
- Two internal supply rails
- Poor decoupling = noisy signal
- FIFO overflow if not serviced
- INT pin needs pull-up
- LED current affects noise and power draw

---

## V1 Configuration (initial)
- I²C speed: 100 kHz
- Mode: SpO₂
- Sample rate: 100–200 sps
- Pulse width: 118–215 µs
- LED current: start low, increase as needed
- FIFO averaging enabled
- Poll FIFO (interrupt optional later)

---

## Key Insight
PPG signal quality depends as much on **power integrity and mechanics** as on firmware.
