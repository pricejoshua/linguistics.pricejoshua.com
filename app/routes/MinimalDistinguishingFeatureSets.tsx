import React from 'react';

// Helper to get all combinations of features of a given length
function getCombinations<T>(array: T[], length: number): T[][] {
  if (length === 1) return array.map((item) => [item]);
  const combos: T[][] = [];
  array.forEach((item, idx) => {
    getCombinations(array.slice(idx + 1), length - 1).forEach((rest) => {
      combos.push([item, ...rest]);
    });
  });
  return combos;
}

function MinimalDistinguishingFeatureSets({
  selectedPhones,
  validImportedPhones,
  phoneData,
  features,
  limitToImported,
}: {
  selectedPhones: string[];
  validImportedPhones: string[];
  phoneData: Record<string, any>;
  features: string[];
  limitToImported: boolean;
}) {
  if (selectedPhones.length === 0) return null;
  const complementPhones = validImportedPhones.filter((p) => !selectedPhones.includes(p));
  if (complementPhones.length === 0) return null;

  // Only consider features that are defined for all selected phones
  const usableFeatures = features.filter((f) => selectedPhones.every((p) => phoneData[p]?.[f] !== undefined));

  // For each feature, get the value for all selected phones (must be the same)
  const featureValues: Record<string, any> = {};
  usableFeatures.forEach((f) => {
    const val = phoneData[selectedPhones[0]]?.[f];
    if (selectedPhones.every((p) => phoneData[p]?.[f] === val)) {
      featureValues[f] = val;
    }
  });

  // Try all pairs and triples of features
  let minimalSets: { features: string[]; values: any[] }[] = [];
  for (let k = 2; k <= 3; ++k) {
    getCombinations(Object.keys(featureValues), k).forEach((combo) => {
      const values = combo.map((f) => featureValues[f]);
      // All selected phones must match these values
      const allSelectedMatch = selectedPhones.every((p) =>
        combo.every((f, i) => phoneData[p]?.[f] === values[i])
      );
      // No complement phone can match all these values
      const anyComplementMatch = complementPhones.some((p) =>
        combo.every((f, i) => phoneData[p]?.[f] === values[i])
      );
      if (allSelectedMatch && !anyComplementMatch) {
        minimalSets.push({ features: combo, values });
      }
    });
    if (minimalSets.length > 0) break; // Prefer smallest sets
  }

  // Only surface the most general (smallest) set
  let bestSet = null;
  if (minimalSets.length > 0) {
    // Sort by number of features, then alphabetically for consistency
    minimalSets.sort((a, b) => a.features.length - b.features.length || a.features.join().localeCompare(b.features.join()));
    bestSet = minimalSets[0];
  }

  if (!bestSet) return (
    <div className="mb-3">
      <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Minimal Distinguishing Feature Set</h4>
      <div className="text-sm text-gray-600 dark:text-gray-300">No minimal feature set found (try selecting a different set).</div>
    </div>
  );

  return (
    <div className="mb-3">
      <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Minimal Distinguishing Feature Set</h4>
      <div className="text-sm font-mono">
        {bestSet.features.map((f, j) => (
          <span key={f}>
            <span className="font-medium">{f}</span>: {String(bestSet.values[j])}{j < bestSet.features.length - 1 ? ', ' : ''}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This is the smallest set of features that together uniquely distinguish the selected phones from the rest of the imported set.</p>
    </div>
  );
}

export default MinimalDistinguishingFeatureSets;
