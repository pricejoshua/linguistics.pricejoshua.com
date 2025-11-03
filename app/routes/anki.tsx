import type { Route } from "./+types/anki";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Anki GPA Helpers" },
    { name: "description", content: "Anki GPA conversion helpers" },
  ];
}

export default function Anki() {
  return (
    <div style={{ padding: "20px" }}>
      <iframe
        src="https://pricejoshua-anki-gpa-helpers.hf.space"
        frameBorder="0"
        width="850"
        height="450"
      />
    </div>
  );
}
