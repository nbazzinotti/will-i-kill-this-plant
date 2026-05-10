"use client";

import { useEffect, useState } from "react";

type Tier = "GO_AHEAD" | "CAUTION" | "RIP" | "BABE_NO";

type Verdict = {
  plantId: string;
  confidence: "high" | "medium" | "low" | "not-a-plant";
  killProbability: number;
  tier: Tier;
  category: string;
  verdict: string;
  alternative?: { name: string; reason: string };
  closingQuestion: string;
};

const lightOptions = [
  { value: "bright-direct", label: "Bright direct" },
  { value: "bright-indirect", label: "Bright indirect" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low / no window" },
];

const waterOptions = [
  { value: "weekly", label: "Weekly, on schedule" },
  { value: "sometimes", label: "Sometimes" },
  { value: "rarely", label: "Rarely" },
  { value: "forget", label: "Honestly, I forget" },
];

const petsOptions = [
  { value: "no", label: "No" },
  { value: "yes", label: "Yes — pet, toddler, or both" },
];

const vacationOptions = [
  { value: "rarely", label: "Rarely" },
  { value: "seasonal", label: "Once a season" },
  { value: "often", label: "Monthly or more" },
];

export default function Home() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [light, setLight] = useState("");
  const [water, setWater] = useState("");
  const [pets, setPets] = useState("");
  const [vacation, setVacation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasPlant = photo !== null || name.trim().length > 0;
  const allAnswered =
    hasPlant && light !== "" && water !== "" && pets !== "" && vacation !== "";

  async function readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Could not read image"));
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allAnswered) return;
    setSubmitting(true);
    setError(null);
    try {
      const photoBase64 = photo ? await readAsDataUrl(photo) : null;
      const res = await fetch("/api/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo: photoBase64,
          name: name.trim(),
          answers: { light, water, pets, vacation },
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server returned ${res.status}`);
      }
      const data: Verdict = await res.json();
      setVerdict(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setPhoto(null);
    setName("");
    setLight("");
    setWater("");
    setPets("");
    setVacation("");
    setVerdict(null);
    setError(null);
  }

  if (verdict) {
    return <VerdictView verdict={verdict} photo={photo} onReset={reset} />;
  }

  return (
    <main className="min-h-screen px-5 sm:px-6 py-14 md:py-24 w-full">
      <div className="max-w-2xl mx-auto w-full">
        <header className="mb-12 md:mb-16">
          <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-olive mb-5">
            ✿ 1,247 plants saved from bad owners
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95] text-forest mb-5">
            Will I Kill
            <br />
            This Plant?
          </h1>
          <p className="text-xl md:text-2xl text-forest font-medium leading-snug max-w-xl">
            We know your history.{" "}
            <span className="font-bold">The plants do, too.</span>
          </p>
          <p className="mt-3 text-base text-olive font-medium">
            Get the verdict before you waste $42… once again.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="bg-cream rounded-2xl border border-forest/10 shadow-[0_6px_32px_-16px_rgba(45,79,53,0.18)] p-6 md:p-8 space-y-8"
        >
          <div>
            <div className="text-[11px] tracking-[0.2em] uppercase font-bold text-olive mb-3">
              The Plant
            </div>
            <label className="flex flex-col items-start gap-3 border-2 border-dashed border-olive/60 rounded-xl p-5 cursor-pointer hover:bg-mint/30 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                className="sr-only"
              />
              <span className="inline-block px-4 py-2 rounded-full bg-forest text-cream text-sm font-semibold">
                {photo ? "Change photo" : "Choose photo"}
              </span>
              <span className="text-xs text-olive break-all">
                {photo
                  ? photo.name
                  : "PNG, JPG, or HEIC. We don’t save it."}
              </span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="…or type the plant name"
              className="mt-3 w-full px-4 py-3 rounded-lg bg-transparent border-2 border-forest/30 placeholder:text-olive/70 text-forest focus:outline-none focus:border-forest"
            />
          </div>

          <QuestionGroup
            label="Light situation"
            options={lightOptions}
            value={light}
            onChange={setLight}
          />
          <QuestionGroup
            label="Watering — honestly"
            options={waterOptions}
            value={water}
            onChange={setWater}
          />
          <QuestionGroup
            label="Pets or toddlers?"
            options={petsOptions}
            value={pets}
            onChange={setPets}
          />
          <QuestionGroup
            label="Away more than 5 days?"
            options={vacationOptions}
            value={vacation}
            onChange={setVacation}
          />

          {error && (
            <p className="text-sm text-terracotta font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={!allAnswered || submitting}
            className="w-full bg-terracotta text-cream font-semibold text-base py-4 rounded-full transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Consulting the plant gods…" : "Give me the verdict"}
          </button>
        </form>

        <footer className="mt-16 text-center text-xs text-olive">
          For entertainment. We are not liable for plant deaths.
        </footer>
      </div>
    </main>
  );
}

function QuestionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[11px] tracking-[0.2em] uppercase font-bold text-olive mb-3 block">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full text-[13px] sm:text-sm font-medium border-2 transition-colors whitespace-nowrap ${
              value === opt.value
                ? "bg-forest text-cream border-forest"
                : "bg-transparent text-forest border-forest/25 hover:border-forest hover:bg-mint/40"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function VerdictView({
  verdict,
  photo,
  onReset,
}: {
  verdict: Verdict;
  photo: File | null;
  onReset: () => void;
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [closed, setClosed] = useState<"saved" | "committed" | null>(null);

  useEffect(() => {
    if (!photo) return;
    const url = URL.createObjectURL(photo);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const isFallback =
    verdict.confidence === "low" || verdict.confidence === "not-a-plant";

  if (isFallback) {
    return (
      <main className="min-h-screen px-5 sm:px-6 py-14 md:py-24 w-full">
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-cream rounded-2xl border-2 border-dashed border-olive p-7 md:p-10">
            <div className="text-[11px] tracking-[0.2em] uppercase font-bold text-olive mb-4">
              Couldn’t identify
            </div>
            <p className="text-xl md:text-2xl font-medium text-forest leading-snug">
              {verdict.verdict}
            </p>
            <button
              onClick={onReset}
              className="mt-8 inline-block bg-terracotta text-cream font-semibold text-sm px-5 py-3 rounded-full hover:opacity-90"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const tierColorClass = verdict.tier === "GO_AHEAD" ? "text-forest" : "text-terracotta";
  const photoTreatment =
    verdict.tier === "GO_AHEAD"
      ? "saturate-110 brightness-105"
      : verdict.tier === "CAUTION"
        ? "saturate-90"
        : "saturate-50 brightness-95";

  return (
    <main className="min-h-screen px-5 sm:px-6 py-14 md:py-24 w-full">
      <div className="max-w-3xl mx-auto w-full">
        <header className="mb-8">
          <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-olive mb-2">
            The Verdict
          </div>
        </header>

        <div className="bg-cream rounded-2xl border border-forest/10 shadow-[0_6px_32px_-16px_rgba(45,79,53,0.18)] p-6 md:p-8 grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] gap-7 md:items-start">
          <div
            className={`relative aspect-square rounded-xl overflow-hidden ${photoTreatment}`}
            style={{
              background: photoUrl
                ? undefined
                : "radial-gradient(ellipse at 30% 25%, rgba(184,212,176,0.6), transparent 55%), radial-gradient(ellipse at 70% 75%, rgba(126,139,79,0.55), transparent 60%), linear-gradient(135deg, #B8D4B0 0%, #7E8B4F 70%, #2D4F35 100%)",
            }}
          >
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt={verdict.plantId}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl opacity-50">
                ✿
              </div>
            )}
            {(verdict.tier === "RIP" || verdict.tier === "BABE_NO") && (
              <div
                className="absolute inset-0 mix-blend-multiply"
                style={{ background: "rgba(217,82,44,0.18)" }}
              />
            )}
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <div className="text-[13px] tracking-[0.2em] uppercase font-bold text-olive mb-2">
                Kill Likelihood
              </div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <div
                  className={`font-extrabold text-[64px] leading-[0.9] tracking-tight ${tierColorClass}`}
                >
                  {verdict.killProbability.toFixed(1)}%
                </div>
                <div
                  className={`font-extrabold text-xl leading-none ${tierColorClass}`}
                >
                  {tierLabel(verdict.tier)}
                </div>
              </div>
              <span className="inline-block mt-3 bg-lilac text-forest text-[10px] tracking-[0.16em] uppercase font-bold px-3 py-1 rounded-full">
                {verdict.plantId} · {verdict.category}
              </span>
            </div>

            <p className="text-xl text-forest font-medium leading-snug">
              {verdict.verdict}
              {verdict.alternative && (
                <>
                  {" "}
                  <span className="text-terracotta underline underline-offset-2 decoration-2">
                    Try {verdict.alternative.name}
                  </span>
                  <span className="text-forest">
                    {" "}— {verdict.alternative.reason}.
                  </span>
                </>
              )}
            </p>

            {!closed && (
              <div className="border-t border-forest/15 pt-5 flex flex-col gap-3">
                <div className="font-bold text-[15px]">
                  {verdict.closingQuestion}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setClosed("committed")}
                    className="bg-terracotta text-cream font-semibold text-[13px] px-5 py-3 rounded-full hover:opacity-90"
                  >
                    {verdict.tier === "GO_AHEAD" ? "Yes" : "Yes, obviously"}
                  </button>
                  <button
                    onClick={() => setClosed("saved")}
                    className="bg-transparent text-forest border-2 border-forest font-semibold text-[13px] px-5 py-3 rounded-full hover:bg-mint/40"
                  >
                    {verdict.tier === "GO_AHEAD" ? "Not today" : "No, I listened"}
                  </button>
                </div>
              </div>
            )}

            {closed === "saved" && (
              <div className="bg-mint rounded-xl px-5 py-4">
                <div className="font-semibold text-forest">
                  ✿ You just saved a plant.
                </div>
                <div className="text-xs text-forest/80 mt-1">
                  1,248 plants saved from bad owners and counting.
                </div>
              </div>
            )}

            {closed === "committed" && (
              <div className="bg-forest text-cream rounded-xl px-5 py-4">
                <div className="font-semibold">
                  ✦ Good luck. We’ll be here when it dies.
                </div>
                <div className="text-xs opacity-85 mt-1">
                  The {verdict.plantId} has been added to your karmic record.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={onReset}
            className="text-sm text-olive font-semibold hover:text-forest transition-colors"
          >
            ← Try another plant
          </button>
        </div>
      </div>
    </main>
  );
}

function tierLabel(tier: Tier): string {
  switch (tier) {
    case "GO_AHEAD":
      return "GO AHEAD";
    case "CAUTION":
      return "PROCEED W/ CAUTION";
    case "RIP":
      return "RIP";
    case "BABE_NO":
      return "BABE, NOT A CHANCE";
  }
}
