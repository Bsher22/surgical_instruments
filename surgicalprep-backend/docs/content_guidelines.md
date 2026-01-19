# Content Guidelines for SurgicalPrep

This document outlines the standards and best practices for creating instrument content in SurgicalPrep.

## General Principles

1. **Accuracy First**: All information must be clinically accurate and verifiable
2. **Educational Focus**: Content should help learners understand, not just memorize
3. **Practical Application**: Include real-world usage tips and handling notes
4. **Consistency**: Follow the same format and style across all entries

---

## Instrument Data Fields

### Name (Required)
- Use the official, most commonly accepted name
- Capitalize properly (e.g., "Kelly Hemostatic Forceps", not "kelly hemostatic forceps")
- Include the full name, not abbreviations
- Format: "[Eponym/Type] [Instrument Type]"

**Good Examples:**
- Kelly Hemostatic Forceps
- Metzenbaum Scissors
- Army-Navy Retractor

**Bad Examples:**
- Kelly (too abbreviated)
- kelly hemostat (improper capitalization)
- MAYO SCISSORS (all caps)

### Aliases (Recommended)
- Include common nicknames used in the OR
- Include abbreviations staff might use
- Include regional variations if known
- List from most to least common

**Examples:**
- Kelly Hemostatic Forceps → ["Kelly Clamp", "Kelly Hemostat", "Kelly"]
- Metzenbaum Scissors → ["Metz", "Metz Scissors"]
- Bovie Electrocautery → ["Bovie", "Cautery", "ESU"]

### Category (Required)
Must be one of:
- Cutting & Dissecting
- Clamps & Forceps
- Grasping & Holding
- Retractors
- Suturing
- Probes & Dilators
- Specialty
- Powered

### Description (Required)
- 2-4 sentences describing the instrument
- First sentence: What it is and primary function
- Second sentence: Key distinguishing features
- Third sentence (optional): Special characteristics or variations
- Write in present tense, active voice

**Good Example:**
> "A locking hemostatic forceps commonly used to clamp blood vessels and control bleeding. Features horizontal serrations that extend partially down the jaw length. Available in curved and straight varieties with sizes ranging from 5.5 to 6.25 inches."

**Bad Example:**
> "This is an instrument that is used to clamp things. It has a handle and jaws."

### Primary Uses (Required)
- List 3-5 primary uses
- Start each with an action verb (-ing form)
- Be specific but concise
- Order from most to least common use

**Good Example:**
```json
[
  "Clamping blood vessels",
  "Controlling hemorrhage",
  "Grasping tissue",
  "Holding sutures during tying"
]
```

**Bad Example:**
```json
[
  "Used for clamping",
  "Can be used for tissue",
  "Helps with bleeding"
]
```

### Common Procedures (Required)
- List 3-6 procedure types or specialties
- Use standardized specialty/procedure names
- Order from most to least common

**Standardized Specialty Names:**
- General Surgery
- Orthopedic Surgery (not "Ortho")
- Cardiovascular Surgery
- Neurosurgery
- Plastic Surgery
- OB/GYN (or Gynecologic Surgery)
- Urology
- ENT Surgery
- Ophthalmology
- Thoracic Surgery
- Vascular Surgery
- Pediatric Surgery
- Trauma Surgery

### Handling Notes (Recommended)
- Practical tips for OR staff
- Safety considerations
- Size/variation information
- Passing techniques if specific
- Common issues to watch for

**Good Example:**
> "Available in curved and straight varieties. Check ratchet mechanism before use. Pass with rings toward surgeon. Standard sizes 5.5 and 6.25 inches."

### is_premium (Required)
- Boolean value (true/false)
- Set to `true` for:
  - Specialty instruments used in advanced procedures
  - Microsurgical instruments
  - Expensive single-use devices
  - Instruments primarily of interest to advanced learners
- Set to `false` for:
  - Common instruments every student should know
  - Basic instruments across all specialties

---

## Writing Style Guide

### Tone
- Professional but approachable
- Educational, not condescending
- Confident but not absolute

### Terminology
- Use standard medical terminology
- Define abbreviations on first use in descriptions
- Use common OR vernacular in aliases

### Sentence Structure
- Keep sentences concise (under 25 words when possible)
- Use active voice
- Avoid jargon without explanation

### Consistency Checklist
- [ ] Name follows "[Eponym/Type] [Instrument Type]" format
- [ ] Description is 2-4 sentences
- [ ] Primary uses start with -ing verbs
- [ ] Common procedures use standardized names
- [ ] Handling notes include practical tips
- [ ] Category matches instrument function

---

## Quality Standards

### Minimum Requirements
- All required fields must be populated
- Description minimum 50 characters
- At least 3 primary uses
- At least 3 common procedures

### Quality Indicators
- Aliases include at least one common nickname
- Handling notes include size/variation information
- Description mentions distinguishing features
- Primary uses are specific and actionable

### Review Checklist
Before submitting new instruments:

1. **Accuracy Check**
   - [ ] Verify name spelling against medical references
   - [ ] Confirm category is appropriate
   - [ ] Validate uses against clinical sources

2. **Completeness Check**
   - [ ] All required fields populated
   - [ ] Aliases include common variations
   - [ ] Description is comprehensive

3. **Style Check**
   - [ ] Follows capitalization standards
   - [ ] Uses standardized procedure names
   - [ ] Maintains consistent tone

4. **Educational Value**
   - [ ] Handling notes are practical
   - [ ] Information helps learners understand usage
   - [ ] Content distinguishes from similar instruments

---

## Template Card Guidelines

### Title
- Use the standard procedure name
- Be specific (e.g., "Laparoscopic Cholecystectomy" not just "Cholecystectomy")

### General Notes
- Overview of the procedure
- Patient positioning
- Key surgical principles
- Critical safety points

### Setup Notes
- Mayo stand organization
- Back table setup
- Special equipment needs
- Pre-procedure checks

### Items
- Include realistic quantities
- Specify sizes where relevant
- Add helpful notes for each item
- Order logically (order of use or by category)

### Item Categories
- `instruments`: Reusable surgical instruments
- `supplies`: Disposable items
- `sutures`: Suture materials
- `implants`: Implantable devices
- `specialty`: Procedure-specific equipment

---

## Sources and References

### Acceptable Sources
- Surgical technology textbooks (Berry & Kohn's, Fuller's)
- Medical equipment manufacturer catalogs
- Hospital instrument count sheets
- Peer-reviewed surgical literature
- Professional organization resources (AST, AORN)

### Citation Not Required But Recommended
- Keep a reference list for fact-checking
- Note sources for unusual or specialized instruments
- Document sources for controversial information

---

## Common Mistakes to Avoid

1. **Vague Descriptions**
   - ❌ "Used in surgery"
   - ✅ "Used to clamp blood vessels during vascular procedures"

2. **Inconsistent Naming**
   - ❌ "mayo scissors" / "MAYO SCISSORS"
   - ✅ "Mayo Scissors"

3. **Missing Context**
   - ❌ Primary use: "Clamping"
   - ✅ Primary use: "Clamping small blood vessels"

4. **Unhelpful Handling Notes**
   - ❌ "Use carefully"
   - ✅ "Pass with rings toward surgeon. Available in 5.5 and 6.25 inch lengths."

5. **Wrong Category**
   - ❌ Needle holder in "Grasping & Holding"
   - ✅ Needle holder in "Suturing"
