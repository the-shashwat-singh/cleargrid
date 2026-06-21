# ClearGrid — Agentic AI Build Prompt
## Flipkart Gridlock Hackathon 2.0 | Prototype Showcase Website

---

## PROJECT IDENTITY

**Project Name:** ClearGrid  
**Tagline:** *"From Gridlock to Greenlight."*  
**Sub-tagline:** *Bengaluru's AI-Powered Parking Enforcement Intelligence System*  
**Audience:** Judges of Flipkart Gridlock Hackathon + Bengaluru Traffic Police + City Planners  
**Vibe:** Command center meets consumer product. Feels like something Apple would build if they ran a city's traffic ops.

---

## WHAT YOU ARE BUILDING

A **single-page marketing + showcase website** for ClearGrid — an AI system that uses 298,000 historical parking violation records from Bengaluru to predict illegal parking, quantify congestion impact, and give traffic enforcement officers real-time intelligent dispatch recommendations.

This is NOT a generic SaaS landing page. This is a **mission-critical civic intelligence platform** that needs to feel like it could actually run a city. Every design decision must reinforce that.

The website must include:
- A stunning hero section
- A problem statement section
- A features showcase section (10 distinct AI features)
- A dual-audience section (Officers vs Commuters)
- A pipeline / how-it-works section
- A dashboard preview section (mocked up)
- A closing CTA section

---

## TECH STACK

- **Framework:** React (Vite) OR pure HTML/CSS/JS — choose whichever allows richer animations
- **Animations:** GSAP (ScrollTrigger) + Framer Motion OR CSS custom animations. Use scroll-triggered reveals heavily.
- **Map:** Use a static SVG city-grid illustration OR a placeholder canvas map for the hero — do NOT make live API calls for the demo
- **Icons:** Lucide React or custom SVG icons
- **Fonts:** Load from Google Fonts
- **No external UI libraries** (no Chakra, MUI, shadcn) — build everything custom

---

## DESIGN SYSTEM

### Color Palette

```
--bg-base:        #060C1A   /* deep space navy — page background */
--bg-surface:     #0D1628   /* slightly lighter surface */
--glass-bg:       rgba(255, 255, 255, 0.055)   /* frosted glass cards */
--glass-border:   rgba(255, 255, 255, 0.10)    /* glass card borders */
--glass-hover:    rgba(255, 255, 255, 0.09)    /* hover state for glass */

--accent-blue:    #4F8CF7   /* primary — data, trust, technology */
--accent-green:   #10D48E   /* cleared roads, safe zones, success */
--accent-amber:   #F5A623   /* medium risk, warnings */
--accent-red:     #F04E4E   /* high risk, violations, danger */
--accent-purple:  #A78BFA   /* cascade prediction, behavioral AI */

--text-primary:   #EDF2FF   /* main text */
--text-secondary: rgba(237, 242, 255, 0.55)  /* supporting text */
--text-muted:     rgba(237, 242, 255, 0.30)  /* labels, captions */

--glow-blue:      rgba(79, 140, 247, 0.25)
--glow-green:     rgba(16, 212, 142, 0.20)
--glow-red:       rgba(240, 78, 78, 0.20)
```

### Typography

```
Display / Hero:   "Syne" — weights 700, 800. Used for big hero text only.
                  Tracking: -0.03em. Line-height: 1.05.
                  
Heading:          "Space Grotesk" — weights 500, 600, 700.
                  Used for section titles, feature names, card headers.
                  
Body:             "Inter" — weights 400, 450, 500.
                  Used for all body copy, descriptions.
                  
Data / Mono:      "JetBrains Mono" — weights 400, 500.
                  Used ONLY for numbers, stats, percentages, code snippets, alert outputs.
```

Load all from Google Fonts. Import at top of CSS.

### Glassmorphism Rules (apply consistently)

```css
.glass-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255,255,255,0.08);
}

/* Hover state for interactive glass cards */
.glass-card:hover {
  background: var(--glass-hover);
  border-color: rgba(255, 255, 255, 0.16);
  transform: translateY(-2px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Corner Radius Scale
```
--radius-sm:   10px   /* tags, badges, small elements */
--radius-md:   16px   /* inputs, buttons */
--radius-lg:   20px   /* cards */
--radius-xl:   28px   /* large panels */
--radius-2xl:  36px   /* hero containers, big sections */
--radius-full: 9999px /* pills, toggle switches */
```

### Spacing
Use 8px base grid. Common spacings: 8, 16, 24, 32, 48, 64, 96, 128px.

---

## SIGNATURE DESIGN ELEMENT

The single most memorable visual: **animated violation pulse rings** — whenever a hotspot or alert appears on a map-like grid anywhere on the page, it emits soft concentric rings outward (like sonar pings), colored red for high-risk, amber for medium, green for cleared. These appear in the hero, in feature cards, and in the dashboard preview. This visual language must be consistent and recognizable.

---

## PAGE STRUCTURE — SECTION BY SECTION

---

### SECTION 0: NAVBAR

Fixed position, full width.

```
[ClearGrid logo — grid icon + wordmark in Space Grotesk 600]    [Features]  [How It Works]  [For Officers]  [For Commuters]    [View Demo →]
```

- Background: `rgba(6, 12, 26, 0.75)` with `backdrop-filter: blur(20px)`
- Border bottom: `1px solid rgba(255,255,255,0.07)`
- Logo: Small 5x5 animated grid icon (dots that pulse) + "ClearGrid" in Space Grotesk 700
- Nav links: Inter 450, text-secondary, hover reveals accent-blue underline that slides in from left
- CTA button: Glass button with accent-blue border, glows faintly on hover
- Scroll behavior: On scroll down, navbar compresses height slightly (padding reduces)
- On mobile: Hamburger menu

---

### SECTION 1: HERO

**Full viewport height (100vh minimum).** This is the most important section.

**Layout: Split screen**
- Left half (55%): Text content, floating stat cards
- Right half (45%): Animated city grid map visualization

**Left side content:**

Top label: Small pill badge — `[🏙️ Flipkart Gridlock Hackathon 2.0]` — glass pill, accent-blue text, subtle glow

Headline (Syne 800, ~72-80px on desktop):
```
The City
Doesn't Need
More Cops.
It Needs
Smarter Ones.
```
The word "Smarter" should be in gradient text: left-to-right gradient from accent-blue (#4F8CF7) to accent-green (#10D48E).

Sub-headline (Inter 450, 18px, text-secondary, max-width 520px):
```
ClearGrid uses 298,000 historical parking violations to predict 
illegal parking before it happens, score its congestion impact, 
and tell officers exactly where to go — and when.
```

Below that: animated word cycle (typewriter/morph effect) — cycling through:
`"Predict violations."` → `"Prevent congestion."` → `"Clear Bengaluru."` → repeat
Each word fades/morphs smoothly. The changing word should be accent-green colored.

**Floating glass stat cards** (3 cards, positioned absolutely around the left content, slight rotation on each):
```
Card 1 (top-left area):
[ 📊 ] 
298,450
Violations Analyzed
(slight amber glow behind)

Card 2 (bottom-left, rotated -3deg):
[ ⚡ ]
<8 min
Avg. Response Time Improvement
(accent-blue glow)

Card 3 (top, rotated 2deg):
[ 🎯 ]
10 AI Features
One Platform
(accent-green glow)
```
Cards animate in with staggered fade+slide from below on page load. They have a very subtle continuous floating animation (keyframe up-down, slow, ~4s cycle).

**Right side — Animated Map Visualization:**

Build a custom SVG or Canvas element — a stylized dark city grid representing Bengaluru:
- Dark background (#0A1020)
- Thin grid lines in rgba(79,140,247,0.15) — suggests city road network
- Curved irregular lines suggesting ring roads, ORR, major corridors
- 8-12 animated pulse nodes scattered across the grid:
  - 4-5 nodes in RED — active violation hotspots, large pulse rings
  - 2-3 nodes in AMBER — medium risk zones
  - 2-3 nodes in GREEN — cleared/safe zones, smaller rings
- Nodes pulse outward with concentric rings (the signature element)
- Small animated dots moving along the grid lines — enforcement units in motion
- One node should be highlighted/selected with a glass tooltip appearing:
  ```
  ⚠️ MG Road Junction
  Risk Level: CRITICAL
  Violations (last 2h): 47
  Cascade Probability: 78%
  → Dispatch Officer 3 NOW
  ```
  This tooltip is a mini glass card that auto-appears with a slide-in animation.

**Bottom of hero:** Thin separator line with scroll indicator — animated chevron pointing down, with text "Explore ClearGrid" in text-muted.

---

### SECTION 2: THE PROBLEM

**"Bengaluru Is Losing."**

Dark, serious, high-contrast section. No glass cards here — stark, direct.

Section label (Space Grotesk 500, accent-red, small caps): `THE COST OF CHAOS`

Headline (Syne 800, 56px): 
```
One badly parked car.
500 metres of congestion.
Zero warning.
```

Below headline — 3 animated counter stats in a horizontal row. Numbers count up on scroll entry:

```
[Counter 1]            [Counter 2]            [Counter 3]
243                    ₹1.5L Cr               0
hours/year lost        annual economic loss    predictive systems exist
to congestion          to Bengaluru traffic    in the city today
```
Numbers use JetBrains Mono. Labels use Inter. The "0" in counter 3 should flash red briefly.

Below stats — 3 problem cards (glass cards, slight red glow on border):

```
Card 1 — "Enforcement is Blind"
Icon: 👁️ with strike-through
Patrol-based enforcement only finds violations after they've already created congestion. By the time a cop responds, the damage is done.

Card 2 — "Not All Violations Are Equal"
Icon: ⚖️
A bike on a footpath vs a truck at a junction. Current systems treat them identically. Congestion impact varies by 47x.

Card 3 — "No One Predicts. Everyone Reacts."
Icon: 🔥
No system exists today that tells an officer where to be before a violation hotspot forms. ClearGrid changes that.
```

Each card reveals on scroll with a slide-up + fade animation, staggered 150ms apart.

---

### SECTION 3: FEATURES

**"10 Ways ClearGrid Sees What Others Can't"**

Section label: `INTELLIGENCE LAYERS`
Section headline (Syne 700, 52px): 
```
Not a heatmap.
An operating system
for enforcement.
```

Beneath, small body text (Inter 450, text-secondary):
```
Most systems show you where violations happened yesterday. 
ClearGrid tells you where they'll happen in the next two hours — 
and sends the right officer there before the car even parks.
```

**Feature Layout:** Alternating left/right bento-style layout. Not a simple grid. Mix large and small cards.

**Feature 1 — THE BIG ONE (Full width card)**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE 01                    [CORE]
Topological Chokepoint Scoring

Left side: Description text
Right side: Mini visualization — two nodes on a simplified road map:
  - Node A: 200 violations, 6 bypass routes → LOW impact score (shown in green)
  - Node B: 80 violations, 1 bypass route → CRITICAL score (shown in red)
  With a visual showing roads branching out

"Most teams show you where violations happen. We show you which 
ones actually choke the city — by scoring every hotspot against 
its road network topology via MapMyIndia's Routes API.

A junction with 5 bypass routes and 200 violations is less 
dangerous than a single-corridor road with 30. ClearGrid knows 
the difference."

Bottom tag: [MapMyIndia Roads API] [Spatial Analysis] [Network Topology]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Features 2 & 3 — Side by side (equal width)**

```
FEATURE 02                          FEATURE 03
Vehicle Archetype Fingerprinting    Perishable Alert Scoring

Using vehicle_number + type +       "Will the car still be 
location + time patterns, ClearGrid there by the time I arrive?"
clusters violation behavior into    
archetypes:                         Every alert is scored with a 
                                    "still there" probability based
[Archetype Card — glass pill]:      on historical dwell time:
🚚 Delivery 4-wheelers              
   Commercial zones, 10am-2pm       ┌─────────────────────────────┐
   Weekdays only                    │ Alert: Indiranagar 12th Main│
                                    │ Time since report: 6 min    │
🏍️ 2-wheelers                       │ Your ETA: 9 min             │
   Metro adjacents, 8-10am          │ Dwell probability: 91%      │
   Daily                            │ → DISPATCH NOW ✅           │
                                    └─────────────────────────────┘
🚗 Private cars                     
   Mall zones, weekend evenings     vs. low-priority alerts that 
                                    would waste the trip.
"Not who. But what type of          
vehicle parks where — and when."    Saves 2-3 wasted officer 
                                    trips per shift.

Tags: [vehicle_number] [ML Clustering]   Tags: [dwell time model] [dispatch]
```

**Feature 4 — Full width, dramatic**

```
FEATURE 04                              [⚡ NOVEL]
Parking Violations as Stealth Traffic Sensors

Background: Subtle animated wave/pulse across the card

"Bengaluru has almost no traffic sensors. ClearGrid turns 
your enforcement database into one."

When traffic gets congested, illegal parking spikes — 
people can't access legal parking, so they park on the road.
This means violation density is a real-time proxy for traffic stress.

Mini diagram:
[Violation spike detected on ORR Marathahalli]
      ↓ ClearGrid infers ↓
[Traffic Level of Service: Grade D — Near Breakdown]
[No official sensor needed]

"We infer congestion levels on sensor-blind roads using 
violation patterns alone. A 298,000-row database becomes 
a city-wide sensing network."

Tags: [LOS Inference] [Sensor Proxy] [Real-time] [No hardware needed]
```

**Features 5, 6, 7 — Three column grid**

```
FEATURE 05              FEATURE 06              FEATURE 07
Cascade Prediction      Emerging Hotspot        Legal Parking
                        Early Warning           Gap Analysis

"The first illegal      "A chronic hotspot      Every violation 
parker is a             doesn't appear          hotspot falls into 
trigger. Others         overnight. ClearGrid    one of three 
follow within           detects one forming     categories:
20 minutes."            7-14 days early."       
                                                🔴 Defiance Zone
We detect seed          Using CUSUM             No alternatives,
violations — the        statistical process     people just don't 
first car that          control on rolling      care. → Enforce.
"opens the door"        violation frequency     
for a cascade.          per junction:           🟡 Awareness Zone
                                                Legal parking
Intervene at            "⚠️ Bellandur            exists 200m away.
the seed before         Signal: 340% of         People don't know.
4-5 more follow.        baseline this week.     → Better signage.
                        Pre-deploy now."        
                                                🟢 Infrastructure
Stats: Average          Proactive, not          Zone. No legal
cascade: 5.3            reactive city           parking exists.
vehicles in 20          management.             → Policy fix.
minutes.                

[behavioral ML]         [CUSUM]                 [MapMyIndia POI]
```

**Features 8, 9, 10 — Bento style**

Feature 8 — "Route Risk Score for Commuters" (wider card, left)
```
FEATURE 08                                [FOR YOU]
Route Risk Score

You're driving from Whitefield to MG Road at 8:45am.
ClearGrid checks your corridor against live violation patterns.

┌─────────────────────────────────────────────┐
│ 🗺️ Your Route — Whitefield → MG Road       │
│                                             │
│ ⚠️ 3 high-risk parking zones on route      │
│    ├── Silk Board Junction → CRITICAL       │
│    ├── Koramangala 4th Block → HIGH         │
│    └── Richmond Circle → MEDIUM             │
│                                             │
│ Congestion probability: 78%                 │
│ → Alternate via Domlur: +4 min, 0 zones    │
└─────────────────────────────────────────────┘

Not just traffic. Parking-induced congestion risk, before you leave.
```

Feature 9 — "Enforcement Blind Spot Detector" (medium card, right)
```
FEATURE 09                              [FOR OPS]
Enforcement Blind Spots

Zones with high historical violations 
but systematically low enforcement activity.

These are not random gaps.
They're structural blind spots.

Map showing: 🔴 dots = high violations, faint coverage
             📍 bright spots = enforcement activity

ClearGrid surfaces them for resource reallocation.
```

Feature 10 — "VRP Enforcement Scheduler" (full width bottom)
```
FEATURE 10                                          [OPERATIONAL AI]
Vehicle Routing Problem — Optimal Patrol Scheduling

Given: Predicted high-risk windows per junction (time-series model)
       N officers available per police station
       Travel times between junctions (MapMyIndia Distance Matrix)

Output:
┌────────────────────────────────────────────────────────────┐
│ TODAY'S OPTIMAL DISPATCH — Koramangala Zone — 8:00am       │
│                                                            │
│ Officer Ravi  → Junction 12 at 8:45am                      │
│                → Junction 7 at 9:30am                      │
│                → Junction 14 at 10:15am                    │
│                                                            │
│ Officer Meena → Junction 3 at 8:00am  (SEED VIOLATION ETA) │
│                → Junction 9 at 9:00am                      │
│                                                            │
│ Predicted violation coverage: 83% of high-risk windows     │
└────────────────────────────────────────────────────────────┘

Not just where to go. Who goes where, in what order, at what time.
```

---

### SECTION 4: DUAL AUDIENCE

**"Built for Two. Useful for Everyone."**

Horizontal split with a glowing divider in the center.

**Left panel — For Officers** (accent-blue tint)
```
ENFORCEMENT OFFICER
─────────────────────────────────────
"I used to drive to a violation and 
find an empty spot half the time."

Now with ClearGrid:
✓ Know if the vehicle will still be there before you go
✓ Get ranked dispatch list by shift, not gut feeling
✓ See cascade alerts before the crowd forms
✓ Optimal patrol route calculated automatically
✓ Enforcement blind spots highlighted for your zone

"My first two hours of the shift now clear 
3x as many violations as before."
— Hypothetical Officer Quote
```

**Right panel — For Commuters** (accent-green tint)
```
DAILY COMMUTER
─────────────────────────────────────
"I never know when Silk Board will 
be a nightmare because of one truck."

Now with ClearGrid:
✓ Route risk score before you leave home
✓ Parking-induced congestion warnings (not just accidents)
✓ Know which roads are structurally choke-prone
✓ Real-time alternate route if violations spike

"Finally something that explains why my 
Tuesday commute is always worse than Monday."
```

---

### SECTION 5: HOW IT WORKS

**"5 Layers of Intelligence"**

Section label: `THE PIPELINE`
Headline (Syne 700, 48px): `One dataset. Five layers of AI.`

Horizontal scrolling pipeline visualization (on desktop: left to right flow diagram, on mobile: vertical):

```
[Raw Data]         →    [Detect]          →    [Score]
298K violations         Vehicle archetypes      Chokepoint × Dwell Time  
Historical logs         Hotspot clusters        Impact per zone
Timestamps              Enforcement gaps        Cascade probability

      →    [Predict]             →    [Dispatch]
           Time-series per zone       VRP patrol scheduler
           Emerging hotspot alert     Perishable alert score
           Cascade seed detection     Optimal officer routing
```

Each node is a glass card. Connecting them are animated flowing lines (gradient from blue to green, dashes moving forward, suggesting data flow). On scroll, nodes reveal left to right with stagger.

Below the pipeline, a closing line (Inter 450, 20px, text-secondary, centered):
```
"Every layer uses only what was given — 
the 298,000-row violation dataset and the MapMyIndia API. 
No additional sensors. No extra hardware. 
Just the data Bengaluru already has."
```

---

### SECTION 6: DASHBOARD PREVIEW

**"What It Looks Like in Action"**

Section label: `LIVE PREVIEW`
Headline: `The Dashboard Officers Actually Use`

A large browser/app frame mockup (simulate a browser window with the dots + URL bar at top, rounded corners 20px, subtle shadow, inner content is a mocked dashboard).

**Inside the mock dashboard — 4 tabs, first tab active by default:**

Tab 1 — "Hotspot Map" (default):
```
[MapMyIndia-style dark map of Bengaluru]
[Pulse rings at hotspot locations — red/amber/green]
[Left sidebar: ranked junction list by impact score]
[Top bar: "High Risk Zones: 12 | Medium: 28 | Clear: 147"]
[Hovering over a hotspot shows a tooltip card]
```

Tab 2 — "Officer Dispatch":
```
[Shift: Morning 6am-2pm]
[3 officer route cards with timeline]
[Each card shows: Officer name, junctions to visit, times, predicted violation yield]
```

Tab 3 — "Route Risk" (commuter view):
```
[Origin → Destination input]
[Risk score bar for route]
[Corridor breakdown with color coding]
[Alternate route suggestion]
```

Tab 4 — "Alerts":
```
[Live feed style — newest at top]
[Each alert: Perishable score badge + location + vehicle type + action]
[Color-coded: RED = dispatch now, AMBER = monitor, GREEN = resolved]
```

Below the mockup, two buttons:
- `[🎯 View Full Demo →]` (glass, accent-blue border)
- `[📄 Read the Paper →]` (glass, text-secondary)

---

### SECTION 7: CTA / CLOSING

**Full viewport section. Dramatic.**

Large centered text (Syne 800, 72px):
```
Bengaluru
doesn't need more
red lights.
It needs
green ones.
```

The word "green" in a sweeping gradient — dark red fading to bright accent-green, animated left to right sweep like a headlight passing.

Below (Inter 450, 20px, text-secondary):
```
Built for Bengaluru. Designed for every city.
Powered by 298,000 data points and one idea:
what if enforcement was intelligent?
```

Two final CTA buttons:
```
[🏆 View Prototype]        [👋 Meet the Team]
```

Bottom of page — small footer:
```
ClearGrid — From Gridlock to Greenlight
Built for Flipkart Gridlock Hackathon 2.0 — Prototype Phase
MapMyIndia API | HackerEarth Dataset | React + AI
```

---

## ANIMATIONS & INTERACTIONS — COMPLETE SPEC

### On Page Load (orchestrated sequence, not scattered)
1. Navbar fades in from top — 0.3s ease-out
2. Hero headline reveals word by word, each word slides up from below (like Apple product launches) — 0.6s stagger
3. Sub-headline fades in — 0.4s delay
4. Floating stat cards stagger in from below — 150ms between each
5. Map visualization fades in with pulse rings beginning — 0.8s delay

### Scroll Animations (ScrollTrigger or IntersectionObserver)
- **Section entrance:** Every section slides up 40px and fades in on scroll entry. Trigger at 80% viewport.
- **Feature cards:** Stagger reveal — each card enters 120ms after previous. Subtle scale from 0.97 to 1.
- **Counter numbers:** Count from 0 to final value over 1.5s when scrolled into view (easeOut)
- **Pipeline nodes:** Reveal left to right, 200ms stagger. Connecting lines draw themselves.
- **Dashboard preview:** Frame slides up and scales from 0.95 to 1.0 on entry.

### Continuous Ambient Animations (subtle, not distracting)
- **Map pulse rings:** Continuous radial expand-fade on all hotspot nodes. Red rings: 2s cycle. Amber: 3s. Green: 4s. Use CSS `@keyframes`.
- **Floating stat cards:** Gentle up-down bob, 4s sine wave, 0.5px amplitude. Different phase for each card.
- **Background:** Very subtle radial gradient that very slowly shifts position (like a breathing light) — extremely subtle, background-only.
- **Navbar glow on CTA:** Soft pulsing border glow on the top-right CTA button.

### Hover Micro-interactions
- Feature cards: lift up 4px, glass-bg brightens slightly, border becomes more visible
- Nav links: colored underline slides in from left on hover
- Buttons: scale to 1.02, glow intensifies
- Dashboard tabs: active tab gets glass underline + color; switching tabs has a 0.2s fade crossfade
- Hotspot map nodes: hovering a node pauses its pulse ring and shows the tooltip

### Parallax
- Hero map visualization scrolls at 0.7x speed vs page (creates depth as you scroll past hero)
- Floating stat cards: subtle parallax, each at different rates (0.9x, 0.85x, 0.95x)
- Section background gradient shifts subtly on mouse move (max 20px displacement)

### Typography Treatments
- Hero headline "Smarter": gradient text with an animated shimmer sweep every 4s
- The morphing text line under headline: smooth character morph/fade between phrases
- Counter numbers: use JetBrains Mono, they should have an odometer-style roll animation
- Feature labels like [NOVEL] and [CORE]: glowing pill badges with matching accent color

---

## SPECIFIC COMPONENT SPECS

### Glass Card
```css
background: rgba(255, 255, 255, 0.055);
border: 1px solid rgba(255, 255, 255, 0.10);
backdrop-filter: blur(20px) saturate(180%);
border-radius: 20px;
box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08);
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Pulse Ring Animation
```css
@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.5); opacity: 0; }
}

.pulse-ring {
  position: absolute;
  border-radius: 50%;
  animation: pulse-ring 2s ease-out infinite;
}
/* Stagger multiple rings with animation-delay: 0.5s, 1s, 1.5s */
```

### Gradient Text
```css
.gradient-text {
  background: linear-gradient(135deg, #4F8CF7, #10D48E);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Flowing Pipeline Lines
SVG path with stroke-dasharray + animated stroke-dashoffset to create "data flowing through pipe" effect. Gradient stroke from accent-blue to accent-green.

### Alert Card (Perishable Alert)
```
┌─ glass card, 16px radius, left border 4px solid color-coded ─────┐
│ [🔴 CRITICAL] Indiranagar 12th Main    [JetBrains Mono badge: 91%]│
│ 2-Wheeler • Reported 6 min ago • Officer ETA: 9 min               │
│ ████████████████░░░░░  Dispatch probability: 91%                   │
│ → DISPATCH NOW                              [Assign Officer ▾]    │
└───────────────────────────────────────────────────────────────────┘
```

---

## COPY / TONE GUIDE

- Never use generic SaaS language ("powerful", "seamless", "innovative", "next-generation")
- Write like an engineer explaining something they're proud of to another smart person
- Use real numbers from the dataset (298,450 rows, 24 columns, etc.)
- Be specific: "saves 2-3 wasted officer trips per shift" not "improves efficiency"
- Use second person for officer/commuter sections ("You're driving from...", "Your shift now...")
- Feature names should be factual, not marketing-speak

---

## RESPONSIVE BEHAVIOR

- **Desktop (1280px+):** Full split layouts, 3-column feature grids, horizontal pipeline
- **Tablet (768-1280px):** 2-column feature grid, map goes to hero background (not side panel)
- **Mobile (<768px):** Single column, pipeline becomes vertical, glass cards full width, map is small decorative element

---

## WHAT TO AVOID

- ❌ Generic stock illustration style
- ❌ Bright white backgrounds anywhere
- ❌ Any shade of cream/warm white
- ❌ Gradient "blob" backgrounds (overused in 2023 AI sites)
- ❌ Floating isometric 3D icons
- ❌ Numbered section markers (01, 02, 03) unless they carry real meaning
- ❌ Excessive animation on every element simultaneously
- ❌ Dark background + single acid-green accent (too generic)
- ❌ Any Lorem Ipsum — write real copy based on this brief
- ❌ Cards that are all the same size in a boring equal grid

---

## FINAL CHECKLIST BEFORE DELIVERY

- [ ] All 10 features present with real descriptions and examples
- [ ] Pulse ring animation working on all hotspot nodes
- [ ] Scroll animations trigger correctly without stutter
- [ ] Floating stat cards bob subtly
- [ ] Dashboard preview tabs are interactive (client-side tab switch)
- [ ] Counter animations trigger on scroll
- [ ] Navbar collapses correctly and stays readable over all sections
- [ ] Mobile layout tested at 375px width
- [ ] Fonts loaded: Syne, Space Grotesk, Inter, JetBrains Mono
- [ ] No placeholder "lorem ipsum" text anywhere
- [ ] Colors exactly match the palette defined above
- [ ] All corner radii following the defined scale (never sharp corners)
- [ ] Pipeline connecting lines animate (data-flow effect)
- [ ] Hero gradient text shimmer working

---

*This is ClearGrid. From Gridlock to Greenlight.*
