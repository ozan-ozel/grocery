# 2026-09-12: Version 2 North Star UI

**Date:** 2026-09-12  
**Branch:** `task/version-2-north-star-ui`  
**Status:** Ready to begin; current production app remains the baseline

## Current state

The app remains functionally stable in its current production flow. The meal planner has the item-level edit affordance in place, and the current app shell, state model, and data contracts stay as the source of truth. This checkpoint starts the dedicated redesign task for a Version 2 North Star experience that preserves the existing product behavior while changing the visual direction and information hierarchy.

## Objective

Create a second-generation UI direction that centers the app around meal planning and macro progress while keeping the current application fully functional. The goals are:

- preserve all existing app functionality and flows
- keep V1 as the baseline path
- introduce a cleaner two-color visual system for V2
- make the meal-planning experience feel like the primary product
- avoid breaking current auth, list, tenant, and meal-plan logic

## Scope

This work is intentionally visual and product-directional, not a behavioral rewrite. It should be layered on top of the current app rather than replacing the underlying mechanics.

### In scope

- new V2 shell styling, with a focused two-color palette
- updated meal-planning emphasis and hierarchy
- North Star layout patterns inspired by the approved mockup direction
- visual treatment for daily targets, meal cards, and shopping-list actions
- safe, staged rollout behind a version-switch mechanism

### Out of scope

- changing the current app's logic, storage model, or backend contracts
- removing or reworking existing non-meal paths during the first V2 pass
- introducing a new theme system that requires rewiring the entire app in one step

## Recommended implementation approach

1. Keep the current app as V1 baseline.
2. Add a V2 visual layer that can be enabled via a flag or URL toggle.
3. Start with the meal-planning shell and the macro summary, since that is the strongest product narrative.
4. Reuse the existing data flow and hooks instead of creating parallel logic.
5. Keep the current features under the hood while the UI feels more focused and premium.

## Key design direction

The V2 experience should read as a planner-first system:

- meal plan is leading
- shopping list is downstream
- nutrition is a live feedback layer
- settings remain available but not dominant

The pacing and hierarchy should feel calmer and more intentional than the current utility-first shell.

## Validation

- Current code remains build-safe from the last verified `npm run build` pass.
- No new runtime behavior should be introduced without a follow-up validation pass.
- The app must still work in V1 mode while V2 is being introduced.

## Next action

Implement the V2 shell and color system behind a safe version toggle, then apply the North Star meal-planning visual treatment to the primary planning view before expanding the rest of the app shell.
