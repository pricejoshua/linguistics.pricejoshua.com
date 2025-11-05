import type { Route } from "./+types/anki";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Anki GPA Helpers" },
    { name: "description", content: "Anki GPA conversion helpers" },
  ];
}

export default function Anki() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      minHeight: "calc(100vh - 40px)"
    }}>
      <div style={{
        width: "100%",
        border: "1px solid #e0e0e0",
        borderRadius: "4px",
        overflow: "hidden"
      }}>
        <iframe
          src="https://pricejoshua-anki-gpa-helpers.hf.space"
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Anki GPA Helpers"
        />
      </div>
    </div>
  );
}
