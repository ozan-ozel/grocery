# Version 2 North Star Design

**Date:** 2026-09-13  
**Status:** Product direction and UI structure for the next iteration

## Objective

Create a version 2 UI that makes meal planning the clear center of the product without breaking the current app's established functionality. The current app remains the operating baseline; the V2 UI is a visual redesign and information-priority shift.

## Design principle

The product should feel like a daily planning tool for meals and macros, not a shopping list utility with secondary nutrition features.

### The primary goal

Help the user answer three questions quickly:

1. What should I eat today?
2. What is the macro gap right now?
3. What do I need to buy or prep to make that happen?

## Core visual direction

### One clear product story

- meal plan leads
- nutrition sits beside it as live feedback
- shopping list is an execution layer
- settings remain available but visually secondary

### Two-color palette

Keep the palette minimal and strong:

- Base background: warm off-white or soft neutral
- Primary surface: white or slightly elevated neutral
- Accent color: one focused product color for actions, progress, and emphasis
- Text: near-black or deep dark neutral for clarity

The palette should feel premium and calm, without visual clutter or too many semantic colors.

## Layout direction

### 1. Header

Keep the header compact but intentional:

- current day or selected date
- household or tenant context
- quick secondary controls

The header should not fight the meal-planning content.

### 2. Primary planner zone

The most important block should be the daily plan summary:

- breakfast / lunch / dinner / snack segments
- macro totals for the day
- progress toward target
- quick add button to insert food or recipe

This becomes the visual anchor of the app.

### 3. Macro summary strip

Use a compact but high-clarity summary:

- calories remaining
- protein
- carbs
- fats
- optional progress ring or pill indicators

This should read instantly and support decision-making.

### 4. Food rows

Each food item should feel lightweight and scannable:

- food name
- gram amount
- macro totals for that item
- quick actions: edit, add/remove from shopping list

### 5. Shopping action

Shopping should feel like a downstream outcome:

- one-tap add all planned foods to list
- one-tap remove all
- confirm flow before action when needed

## Interaction model

### Decision-friendly

The experience should make planning faster by reducing friction:

- quick add path for food and recipe
- clear edit path for grams
- visible macro impact before confirming
- low cognitive load in the daily flow

### Close to the real task

Users should not need to navigate into many layers to answer: "What should I eat and how much?"

## Recommended screen priorities

1. Today / meal plan
2. Macro progress
3. Quick add food or meal
4. Shopping list derivation
5. Settings and personalization as secondary surfaces

## V2 rollout

### Phase 1

Apply the V2 shell and palette to the meal planner only.

### Phase 2

Validate the stronger hierarchy and interaction language.

### Phase 3

Extend V2 styling to the supporting sections, while preserving V1 logic.

## Design constraints

- keep the app functionally stable
- avoid major state or logic churn
- do not add too many colors or competing accents
- maintain mobile clarity and one-handed usability
- prioritize progress and planning over list management

## Status

This document sets the direction for the next V2 UI iteration. The current app remains the source of truth for the production experience while the V2 visual system is introduced in a layered, low-risk way.
