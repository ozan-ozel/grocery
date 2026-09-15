# Goal Classification — MVP

## Purpose

Capture one clear primary goal before calculating energy and macro targets.

## MVP scope

The user must choose one of three supported goals:

- **Maintain weight** (`maintain`)
- **Lose weight** (`loss`)
- **Gain weight** (`gain`)

The selected value is the single source of truth for downstream energy and macro calculations. Goal selection is required and can be changed later in the personal-plan settings.

## Vague goals

The MVP does not accept free-text goals. Statements such as “get healthier” or “feel better” must not be silently converted into a numeric target. The UI should ask the user to choose the closest supported outcome and briefly explain what each option changes.

## Product rules

- Do not infer a goal from weight, BMI, age, or sex.
- Do not create a calorie target until a supported goal is selected.
- Treat muscle gain as `gain` for MVP and explain that this is a simplified classification.
- Keep performance, body recomposition, and general-health goals out of MVP calculations.

## Done when

- Onboarding requires exactly one supported goal.
- The saved goal is visible and editable.
- Energy and macro outputs consistently use the saved goal.
- No vague or unsupported goal is automatically mapped without user confirmation.

## Later

Add dedicated muscle/lean-mass, performance, body-composition, and health-oriented goals, plus clarification and goal-conflict flows.
