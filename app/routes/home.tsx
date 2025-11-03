import type { Route } from "./+types/home";
import Landing from "~/pages/landing";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Linguistics Apps" },
    { name: "description", content: "Landing Page" },
  ];
}

export default function Home() {
  return <Landing />;
}
