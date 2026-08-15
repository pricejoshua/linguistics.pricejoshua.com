import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("phonology", "routes/phonology.layout.tsx", [
    index("routes/phonology.tsx"),
    route("geometry", "routes/phonology.geometry.tsx"),
  ]),
  route("hw-tools", "routes/hw-tools.layout.tsx", [
    index("routes/hw-tools.overview.tsx"),
    route("feature-geometry", "routes/hw-tools.feature-geometry.tsx"),
    route("rule-notation", "routes/hw-tools.rule-notation.tsx"),
  ]),
  route("flashcards", "routes/flashcards.tsx"),
  route("anki", "routes/anki.tsx"),
  route("glossary", "routes/glossary.tsx"),
  route("glossary/abbreviations", "routes/glossary.abbreviations.tsx"),
  route("glossary/:slug", "routes/glossary.$slug.tsx"),
] satisfies RouteConfig;
