import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("phonology", "routes/phonology.tsx"),
  route("flashcards", "routes/flashcards.tsx"),
] satisfies RouteConfig;
