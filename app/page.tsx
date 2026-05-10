"use client";

import { useState } from "react";

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

  const hasPlant = photo !== null || name.trim().length > 0;
  const allAnswered =
    hasPlant && light !== "" && water !== "" && pets !== "" && vacation !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allAnswered) return;
    setSubmitting(true);
    // TODO: POST to /api/verdict in next iteration
    await new Promise((r) => setTimeout(r, 600));
    alert(
      "Verdict route coming next. We see your habits — there will be thoughts.",
    );
    setSubmitting(false);
  }

  return (
    <main className="min-h-screen px-6 py-16 md:py-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-cream rounded-2xl border border-forest/10 shadow-[0_6px_32px_-16px_rgba(45,79,53,0.18)] p-6 md:p-8 space-y-8"
        >
          {/* Plant identifier */}
          <div>
            <label className="text-[11px] tracking-[0.2em] uppercase font-bold text-olive mb-3 block">
              The Plant
            </label>
            <div className="border-2 border-dashed border-olive/60 rounded-xl p-5 hover:bg-mint/30 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-forest file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-forest file:text-cream hover:file:opacity-90 file:cursor-pointer"
              />
              {photo && (
                <p className="mt-2 text-xs text-olive">
                  Selected: {photo.name}
                </p>
              )}
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="…or type the plant name"
              className="mt-3 w-full px-4 py-3 rounded-lg bg-transparent border-2 border-forest/30 placeholder:text-olive/70 text-forest focus:outline-none focus:border-forest"
            />
            <p className="mt-2 text-xs text-olive">
              We don&apos;t save your photo. Pinky promise.
            </p>
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
            label="Pet or toddler in the chaos zone?"
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

          <button
            type="submit"
            disabled={!allAnswered || submitting}
            className="w-full bg-terracotta text-cream font-semibold text-base py-4 rounded-full transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Consulting the plant gods…" : "Give me the verdict"}
          </button>
        </form>

        {/* Footer */}
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
            className={`px-4 py-2.5 rounded-full text-sm font-medium border-2 transition-colors ${
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
