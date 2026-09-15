# Monitoring — MVP Scope

Domain N is `DEC-076` through `DEC-080`. One is covered, four are blocked on a single missing
subsystem.

| DEC | What | Readiness |
|---|---|---|
| `DEC-076` | What the user logs routinely, and at what cadence | `COVERED` |
| `DEC-077` | Logging and measurement quality | `BLOCKED` |
| `DEC-078` | Logging adherence as a data-quality signal | `BLOCKED` |
| `DEC-079` | Handling missing or incomplete logs | `BLOCKED` |
| `DEC-080` | Which signals trigger a check-in or escalation | `BLOCKED` |

## The roadmap item is DEC-076, and it is half done

`DEC-076` is exactly the roadmap's line. It is `COVERED`, but only on one half:

- **Food logging exists.** `logConsumption` and `undoConsumption` cover per-item consumption.
- **Weight logging does not.** That half is scoped in `body-composition-mvp.md` and needs no separate
  decision here.
- **Cadence is currently nothing.** The user logs when they want, with no prompting. That is also the
  MVP default recorded in `body-composition-mvp.md`, so the two documents agree.

So there is nothing new to design in this section. Build the weight log, and `DEC-076` is covered on
both halves.

## Why the other four stay blocked

`DEC-077` through `DEC-080` are blocked on one bundle: data-quality rating, adherence tracking,
missing-log handling, and check-in escalation. That is the monitoring and adherence subsystem named in
the energy individualization work, and it is a prerequisite there rather than here.

One of them is a tripwire worth knowing about early. **`DEC-079` exists to forbid the obvious wrong
answer**: a gap in the log must never be treated as equivalent to "no change," because a silent
zero-fill invents a data point. That rule does not bite while logs are only displayed. It bites the
moment anything reads them to draw a conclusion.

## MVP scope

In:

- Food logging, already present.
- Weight logging, per `body-composition-mvp.md`.
- Display only. Show what was logged, and nothing inferred from what was not.

Out:

- Adherence scoring and data-quality ratings, `DEC-077` and `DEC-078`.
- Any interpretation of missing logs, `DEC-079`.
- Check-in prompts and escalation, `DEC-080`.
