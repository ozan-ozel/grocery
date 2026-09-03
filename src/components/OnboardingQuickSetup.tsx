import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, NumberInput } from "@/components/PersonalPlanView";
import {
  ACTIVITY_OPTIONS,
  type PersonalProfile,
} from "@/lib/mealPersonalization";

export type QuickAnswers = Pick<
  PersonalProfile,
  "ageYears" | "heightCm" | "weightKg" | "equationSex" | "activity" | "goal"
>;

type Props = {
  initialProfile: PersonalProfile;
  onFinish: (answers: QuickAnswers) => void;
  onSkip: () => void;
};

const STEP_COUNT = 4;

export function OnboardingQuickSetup({ initialProfile, onFinish, onSkip }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuickAnswers>({
    ageYears: initialProfile.ageYears,
    heightCm: initialProfile.heightCm,
    weightKg: initialProfile.weightKg,
    equationSex: initialProfile.equationSex,
    activity: initialProfile.activity,
    goal: initialProfile.goal,
  });

  function update<K extends keyof QuickAnswers>(key: K, value: QuickAnswers[K]) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  const isLastStep = step === STEP_COUNT - 1;

  function next() {
    if (isLastStep) {
      onFinish(answers);
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <div className="flex min-h-[70dvh] flex-col justify-between py-6">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: STEP_COUNT }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full ${
                  i <= step ? "bg-signal" : "bg-border"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground">
            Atla
          </button>
        </div>

        <div className="mt-8">
          {step === 0 && (
            <StepBody
              title="Birkaç bilgi, hemen başlayalım"
              subtitle="Günlük hedefini hesaplamak için — istersen varsayılanları değiştirmeden devam et.">
              <div className="grid grid-cols-3 gap-3">
                <Field label="Yaş">
                  <NumberInput
                    value={answers.ageYears}
                    onChange={(value) => update("ageYears", value)}
                  />
                </Field>
                <Field label="Boy (cm)">
                  <NumberInput
                    value={answers.heightCm}
                    onChange={(value) => update("heightCm", value)}
                  />
                </Field>
                <Field label="Kilo (kg)">
                  <NumberInput
                    value={answers.weightKg}
                    onChange={(value) => update("weightKg", value)}
                  />
                </Field>
              </div>
            </StepBody>
          )}

          {step === 1 && (
            <StepBody
              title="Denklem seçimi"
              subtitle="Enerji tahminindeki biyolojik katsayıyı belirtir; cinsiyet kimliğinden otomatik çıkarılmaz.">
              <div className="grid grid-cols-2 gap-2">
                <ChoiceButton
                  label="Kadın katsayısı"
                  selected={answers.equationSex === "female"}
                  onClick={() => update("equationSex", "female")}
                />
                <ChoiceButton
                  label="Erkek katsayısı"
                  selected={answers.equationSex === "male"}
                  onClick={() => update("equationSex", "male")}
                />
              </div>
            </StepBody>
          )}

          {step === 2 && (
            <StepBody
              title="Günlük aktivite"
              subtitle="Çoğu günün nasıl geçtiğine en yakın olanı seç.">
              <div className="space-y-2">
                {ACTIVITY_OPTIONS.map((option) => (
                  <ChoiceButton
                    key={option.value}
                    label={option.label}
                    selected={answers.activity === option.value}
                    onClick={() => update("activity", option.value)}
                    fullWidth
                  />
                ))}
              </div>
            </StepBody>
          )}

          {step === 3 && (
            <StepBody
              title="Hedefin ne?"
              subtitle="İstediğin zaman Kişisel Plan'dan değiştirebilirsin.">
              <div className="space-y-2">
                <ChoiceButton
                  label="Kilomu korumak"
                  selected={answers.goal === "maintain"}
                  onClick={() => update("goal", "maintain")}
                  fullWidth
                />
                <ChoiceButton
                  label="Kademeli kilo kaybı"
                  selected={answers.goal === "loss"}
                  onClick={() => update("goal", "loss")}
                  fullWidth
                />
                <ChoiceButton
                  label="Kilo almak / performans"
                  selected={answers.goal === "gain"}
                  onClick={() => update("goal", "gain")}
                  fullWidth
                />
              </div>
            </StepBody>
          )}
        </div>
      </div>

      <Button type="button" size="lg" className="w-full" onClick={next}>
        {isLastStep ? "Bitir" : "İleri"}
      </Button>
    </div>
  );
}

function StepBody({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function ChoiceButton({
  label,
  selected,
  onClick,
  fullWidth,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  fullWidth?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-md border px-3 py-2.5 text-sm transition-colors ${
        fullWidth ? "w-full text-left" : ""
      } ${
        selected
          ? "border-signal/70 bg-signal/10 text-signal"
          : "border-border hover:bg-accent"
      }`}>
      {label}
    </button>
  );
}
