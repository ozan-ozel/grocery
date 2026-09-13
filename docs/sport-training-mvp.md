# Sport and Training Data — MVP Scope

Domain P is `DEC-092` through `DEC-095`. All four are `BLOCKED`, and all four give the same reason: no
structured training-data capture surface exists.

So this section has the same shape as body composition. **Build the capture surface and the whole
domain unblocks.** Do not build the interpretation on top of it yet.

## One correction to the framing

The roadmap describes "mapping activities to macro values." Route it through energy instead:

```
activity  ->  activity energy cost  ->  PAL refinement (DEC-019)  ->  energy  ->  macros
```

`DEC-092`'s specification is explicit that training data is "a single intake hook, not a parallel
decision system," and that it **refines** the activity term rather than replacing the method. Mapping
an activity straight onto macros would skip the energy layer and recreate the independent macro loop
that Gate 5 barred.

## The expandable structure

Seven activities is not too many, but hardcoding them is the wrong shape regardless. Use a registry so
activities are added as **data, not code**:

```
{ id, label,
  category:      steady | interval | resistance | mixed,
  unit:          minutes | sessions,
  energy_cost:   { low, high },   // a band, never a point
  source }                        // required; the row is inert without it
```

Then: sessions per week, times minutes per session, times the cost band, gives a weekly increment and
from it a daily contribution to the PAL band.

Two rules that keep this honest:

- **A row without a source does nothing.** It can exist in the UI as a label, but it contributes no
  energy until someone transcribes a value from a real reference.
- **Bands, not points**, for the same reason as everywhere else in the energy work.

## On the seven

`walking`, `cycling`, `swimming`, `running` are steady-state and reasonably characterized in the
standard references. `HIIT`, `fitness` and `crossfit` are labels whose intensity varies enormously
between two people using the same word, so their bands will be wide and should stay wide.

Start with the four that source cleanly. The registry makes adding the rest a data task.

## Also cheap, also useful

`DEC-093`, recreational versus structured athlete, is described in the specification as
"classification logic, no numeric threshold." It needs no invented numbers, only the capture surface
above, so it is a low-cost addition once the registry exists.

## Out of scope

- `DEC-094`, competition and event-date windows. Needs a disclosed event date.
- `DEC-095`, relative energy deficiency and overtraining detection. It is a safety decision resting on
  a contested threshold, and it stays out until that is ratified.
- Per-session logging. The MVP captures a typical week, not a training diary.
- Wearable or device import, which is a separate open question.
