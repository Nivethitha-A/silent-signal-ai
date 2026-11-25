# SilentSignal AI — Bridging the 168-Hour Clinical Care Gap in Mental Health

> **“AI That Understands More Than Words.”**  
> *Continuous multimodal behavioral telemetry connecting patients, trusted guardians, and psychologists between weekly therapy sessions.*

🔗 **Live Application:** [https://silent-signal-ai.lovable.app](https://silent-signal-ai.lovable.app)  
🎥 **Video Demonstration:** [Watch Demo](https://drive.google.com/file/d/1AmOifBxhLubQCZCofExFTmS8eEEjsjkZ/view?usp=sharing)  

---

## 1. Problem Statement: The 168-Hour Clinical Blind Spot

In outpatient mental healthcare, a patient typically spends **1 hour per week** with a psychologist and **167 hours alone** navigating daily stressors. This creates a dangerous clinical and behavioral gap between sessions:

1. **Recall Bias During Therapy:** When patients attend their weekly session, they summarize 7 days of complex emotional fluctuations based on how they feel in that single moment, unintentionally omitting critical mid-week triggers or acute dips.
2. **The "Masked Distress" Phenomenon:** Patients experiencing burnout, anxiety, or depressive fatigue often minimize their struggles in text diaries ("I'm fine today"), while subconscious non-verbal cues—vocal tension, facial fatigue, eye strain, and slumped posture—reveal silent deterioration.
3. **Delayed Crisis Escalation:** Trusted family members, caregivers, or clinicians have no objective, privacy-respecting early-warning signal when a patient's baseline wellness trends downward over consecutive days, resulting in reactive crisis intervention rather than timely support.

**Core Problem Objective:**  
Design an accessible, non-intrusive AI wellness companion that continuously captures objective multimodal behavioral signals between weekly psychologist visits, empowers patients with immediate self-regulation protocols, and alerts designated guardians when sustained high-risk trends emerge.

---

## 2. Solution Alignment: How SilentSignal AI Solves the Gap

SilentSignal AI transforms passive daily check-ins into an **inter-session clinical intelligence bridge**, uniting **Regular Mode** for daily patient self-care and **Guardian Mode** for proactive safety oversight.

| Clinical Gap / User Need | SilentSignal AI Feature | Direct Impact on Patient & Care Outcome |
| :--- | :--- | :--- |
| **Overcoming text-only recall bias** | **Multimodal Check-In (Text + Voice + Vision)** | Captures *what* the patient writes, *how* their voice sounds, and *how* they physically appear in under 60 seconds. |
| **Objective inter-session tracking** | **6-Axis Wellness Telemetry & AI Health Memory** | Logs longitudinal scores (**Stress, Mental Fatigue, Focus, Emotional Wellness, Eye Strain, Posture Risk**) across the entire 7-day cycle so psychologists see true behavioral trajectories. |
| **Immediate support between visits** | **Regular Mode & Personalized Recovery Protocols** | Delivers targeted micro-interventions (guided breathing, 20-20-20 eye relaxation, posture reset, hydration, stress cooldown) immediately when strain is detected. |
| **Silent deterioration & safety net** | **Guardian Mode (Escalation & Care Alerts)** | Monitors consecutive negative wellness trends and notifies a consented guardian or support contact when sustained distress thresholds are crossed—without exposing private journal transcripts. |

---

## 3. Dual-Mode Architecture & System Workflow

### Dual Operational Modes
- **Regular Mode (Patient Companion):** Daily multimodal journaling, live wellness scoring, AI Health Memory trend charts for weekly therapist review, and interactive Recovery Protocols.
- **Guardian Mode (Caregiver & Safety Layer):** Consented threshold monitoring that tracks cumulative burnout/stress trajectories across the week and triggers proactive check-in alerts if high-risk patterns persist.

### Multimodal Intelligence Pipeline

```text
┌──────────────────────────────────────────────────────────────────────┐
│                   DAILY PATIENT CHECK-IN (REGULAR MODE)              │
│     [Journal Text]      +      [Voice Audio]      +    [Webcam]      │
└───────────┬──────────────────────────┬─────────────────────┬─────────┘
            ▼                          ▼                     ▼
  ┌───────────────────┐    ┌─────────────────────┐   ┌───────────────┐
  │  NLP & Sentiment  │    │  Speech Prosody &   │   │ Computer      │
  │  Analysis         │    │  Whisper Acoustics  │   │ Vision (Face, │
  │                   │    │                     │   │ Eyes, Posture)│
  └─────────┬─────────┘    └──────────┬──────────┘   └───────┬───────┘
            └─────────────────────────┼──────────────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │  MULTIMODAL FUSION ENGINE │
                        └─────────────┬─────────────┘
                                      ▼
        ┌───────────────────────────────────────────────────────────┐
        │             6-AXIS WELLNESS TELEMETRY & MEMORY            │
        │  Stress • Fatigue • Focus • Mood • Eye Strain • Posture   │
        └──────────────┬──────────────────────────────┬─────────────┘
                       ▼                              ▼
    ┌─────────────────────────────────┐  ┌─────────────────────────────┐
    │      PATIENT SELF-CARE          │  │        GUARDIAN MODE        │
    │ • Personalized Recovery Protocol│  │ • Consecutive Trend Monitor │
    │ • 7-Day Psychologist Summary    │  │ • Consented Risk Alerts     │
    └─────────────────────────────────┘  └─────────────────────────────┘
```
### Technology Stack
- **Frontend & Visualization:** React.js, TypeScript, Tailwind CSS, Recharts (7-day inter-session telemetry charts)
- **AI & Multimodal Processing:** Python, FastAPI, TensorFlow, OpenCV, MediaPipe (Facial & Pose Landmarks), Whisper (Speech Analysis), NLP Sentiment Engine

---

## 4. Key Features
1. **Multimodal Signal Fusion:** Combines natural language sentiment, vocal acoustic stress markers, and computer-vision facial/posture metrics into a unified wellness profile.
2. **AI Health Memory (7-Day Therapy Bridge):** Stores longitudinal check-in trends so patients and psychologists can review objective daily patterns during weekly consultations.
3. **Regular Mode Recovery Engine:** Dynamically prescribes actionable cooldowns (breathing exercises, eye relaxation, posture correction, focus resets) matched to the user's highest-strain metric.
4. **Guardian Mode Safety Net:** Allows users to designate a trusted guardian who receives automated wellness threshold alerts during sustained high-stress streaks while preserving raw journal privacy.
5. **Privacy-First Edge Processing:** Webcam landmark extraction runs client-side with explicit user opt-in; zero raw video frames are persisted.

---

## 5. Local Setup & Installation

```bash
# 1. Clone the repository
git clone [https://github.com/Nivethitha-A/silent-signal-ai.git](https://github.com/Nivethitha-A/silent-signal-ai.git)
cd silent-signal-ai

# 2. Install dependencies
npm install

# 3. Start the local development server
npm run dev
```
## 6. Running Automated Tests

```bash
# Execute unit and component test suite
npm test
```
## 7. Accessibility & Inclusive Design
- **WCAG 2.1 AA Contrast:** High-contrast UI tokens across dashboards, telemetry cards, and recovery timers.
- **Full Keyboard & Screen-Reader Support:** Semantic HTML5 landmarks (`<main>`, `<nav>`, `<section>`), explicit `aria-label` attributes on audio/video controls, and keyboard-accessible modal workflows.
- **Graceful Multimodal Fallback:** Full functionality in text-only or audio-only mode for users without webcams or in low-bandwidth environments.
