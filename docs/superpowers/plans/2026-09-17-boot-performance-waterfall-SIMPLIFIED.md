# Boot Performance: Make the App Load Faster
**Date:** 2026-09-17  
**Goal:** Speed up how fast the app loads and shows your shopping list

---

## The Problem (In Plain English)

When you reload the app, it has to ask the server for 6 pieces of information before it can show you your shopping list. Right now, it's asking for them one at a time, like waiting in a line at the bank:

1. "Who are you?" (1.76 seconds)
2. Then it asks for your household, meal plan, and nutrition info (2.2 seconds each)
3. Then it asks for your shopping list and category settings (2.2 seconds each)

**Total wait time: ~8 seconds**

The issue is that the app is waiting for each answer before asking the next question, even though it *could* ask all 6 at the same time.

---

## What We're Changing

We want to ask all 6 questions at once instead of waiting for each answer. If we do this right:
- **Old way:** 8 seconds to load
- **New way:** 1 second to load
- **Plus:** The app will show your cached shopping list instantly while it checks the server

---

## The Work (4 Phases)

Each phase can be shipped separately. Here's what each one does:

### Phase 0: Bug Fix (Must happen first)
**Problem:** If the server has a glitch, the app thinks you have no households and creates a fake one.  
**Fix:** Make sure the app can tell the difference between "no households" and "server is broken."

### Phase 1: Remove the Household Gate (~2 seconds faster)
**What it does:** Right now the app waits to know which household you're in before it starts other requests. We can figure this out from the URL instantly instead.  
**Risk:** Low. No login/auth stuff involved.  
**How:** Read the household ID from the URL and remember the last one you used, so it's available instantly.

### Phase 2: Remember You're Logged In (~1.8 seconds faster)
**What it does:** Right now, if you reload, the app has to ask the server "is this person still logged in?" before showing anything. Instead, we remember that you were logged in so we can show the app immediately while we check with the server in the background.  
**Risk:** Medium. This affects the login/logout flow.  
**Security note:** This is just a hint that you were logged in — not an actual token. Every API call still proves you're logged in with your real cookie. If the server says "no," you get logged out immediately.

### Phase 3: Show Your Old Data First (~2 seconds faster for regular users)
**What it does:** Save your shopping list and settings to your browser so we can show it instantly when you reload. Then we check the server to see if anything changed.  
**Risk:** Medium. The app might show stale data for a moment before updating.  
**Bonus:** If you edit items offline and reload, your edits don't disappear.

### Phase 4: Optimize Server Speed (~1-2 seconds faster)
**What it does:** Fix the server so each request is faster by:
- Asking the server for multiple pieces of info at the same time instead of waiting
- Caching your nutrition data for 5 minutes

**Risk:** None — these are safe optimizations.

---

## How to Check It Works

After each phase, we'll:
1. Reload the app and time how long it takes
2. Make sure the list loads
3. Switch between households to confirm it still works
4. Log out and back in
5. Test going offline and back online

---

## What We're NOT Doing

We're skipping a few things that would be nice but risky:
- Asking the server for nutrition data at boot (we can load it when you actually view that section)
- Self-hosting fonts to make the page render faster (separate small project)

---

## Summary

**Before:** 8 seconds of waiting while API calls happen one-by-one  
**After:** 1 second, plus your old data showing instantly  
**How long:** 4 independent pieces of work, each shippable separately  
**Risk level:** Low to medium, with no security shortcuts
