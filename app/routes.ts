import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("phonology", "routes/phonology.tsx"),
  route("flashcards", "routes/flashcards.tsx"),
  route("anki", "routes/anki.tsx"),
  route("glossary", "routes/glossary.tsx"),
  route("glossary/:slug", "routes/glossary.$slug.tsx"),
] satisfies RouteConfig;
