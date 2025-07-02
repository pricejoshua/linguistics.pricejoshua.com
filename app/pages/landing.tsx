import React from "react";
import { Link } from "react-router";

const pages = [
  { path: "/", label: "Home" },
  { path: "/phonology", label: "Phonology Helper" },
  // Add more pages here as needed
];

export default function Landing() {
  return (
    <main style={{ maxWidth: 600, margin: "2rem auto", padding: "1rem" }}>
      <h1>Welcome to My Site</h1>
      <p>This is the landing page. Here are all available pages:</p>
      <ul>
        {pages.map((page) => (
          <li key={page.path}>
            <Link to={page.path} style={{ textDecoration: "none", color: "blue" }}>
              {page.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}