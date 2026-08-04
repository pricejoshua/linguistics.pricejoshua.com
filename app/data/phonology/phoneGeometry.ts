import { phoneData } from './phoneData';
import type { FeatureValue } from './phoneData';
import { EMPTY_LEAVES } from './featureGeometry';
import type { GeometryLeafName, GeometryNodeName, PhoneGeometry } from './featureGeometry';

export interface GeometrySpec {
  /** Privative nodes present in this phone's representation. */
  nodes: GeometryNodeName[];
  /** Leaf values the mechanical mapping cannot produce or gets wrong. */
  leafOverrides?: Partial<Record<GeometryLeafName, FeatureValue>>;
}

/**
 * Vowels carry laryngeal and manner values that the flat table omits: every
 * vowel here is modal-voiced, oral, and neither glottalised nor aspirated.
 */
function vowelSpec(nodes: GeometryNodeName[]): GeometrySpec {
  return {
    nodes,
    leafOverrides: {
      voice: '+',
      nasal: '-',
      constrictedGlottis: '-',
      spreadGlottis: '-',
    },
  };
}

const VOWEL_UNROUNDED: GeometryNodeName[] = ['Dorsal', 'TongueRoot'];
const VOWEL_ROUNDED: GeometryNodeName[] = ['Labial', 'Dorsal', 'TongueRoot'];

/**
 * Privative node presence per phone. Place nodes cannot be recovered from the
 * flat feature table (`coronal: '-'` covers labials and dorsals alike), so
 * they are assigned here from the articulation each symbol denotes.
 */
export const PHONE_GEOMETRY_SPECS: Record<string, GeometrySpec> = {
  // Labial obstruents
  'p': { nodes: ['Labial'] },
  'pʰ': { nodes: ['Labial'] },
  "p'": { nodes: ['Labial'] },
  'b': { nodes: ['Labial'] },
  'ɸ': { nodes: ['Labial'] },
  'β': { nodes: ['Labial'] },
  'f': { nodes: ['Labial'] },
  'v': { nodes: ['Labial'] },

  // Coronal obstruents
  't': { nodes: ['Coronal'] },
  'd': { nodes: ['Coronal'] },
  'θ': { nodes: ['Coronal'] },
  'ð': { nodes: ['Coronal'] },
  's': { nodes: ['Coronal'] },
  'z': { nodes: ['Coronal'] },
  'ʃ': { nodes: ['Coronal'] },
  'ʒ': { nodes: ['Coronal'] },
  'ts': { nodes: ['Coronal'] },
  'tʃ': { nodes: ['Coronal'] },
  'dʒ': { nodes: ['Coronal'] },

  // Dorsal obstruents
  'k': { nodes: ['Dorsal'] },
  'g': { nodes: ['Dorsal'] },
  'q': { nodes: ['Dorsal'] },
  'x': { nodes: ['Dorsal'] },
  'ɣ': { nodes: ['Dorsal'] },

  // Sonorant consonants
  'm': { nodes: ['Labial'] },
  'ɱ': { nodes: ['Labial'] },
  'n': { nodes: ['Coronal'] },
  'ñ': { nodes: ['Coronal'] },
  'ŋ': { nodes: ['Dorsal'] },
  'l': { nodes: ['Coronal'] },
  'ɬ': { nodes: ['Coronal'] },
  'ɾ': { nodes: ['Coronal'] },

  // Glides and laryngeals
  'j': { nodes: ['Dorsal'] },
  'w': { nodes: ['Labial', 'Dorsal'] },
  'ʔ': { nodes: [] },
  'h': { nodes: [], leafOverrides: { constrictedGlottis: '-', spreadGlottis: '+' } },

  // Vowels
  'i': vowelSpec(VOWEL_UNROUNDED),
  'ɪ': vowelSpec(VOWEL_UNROUNDED),
  'e': vowelSpec(VOWEL_UNROUNDED),
  'ε': vowelSpec(VOWEL_UNROUNDED),
  'æ': vowelSpec(VOWEL_UNROUNDED),
  'ə': vowelSpec(VOWEL_UNROUNDED),
  'a': vowelSpec(VOWEL_UNROUNDED),
  'ɨ': vowelSpec(VOWEL_UNROUNDED),
  'ɯ': vowelSpec(VOWEL_UNROUNDED),
  'ʌ': vowelSpec(VOWEL_UNROUNDED),
  'u': vowelSpec(VOWEL_ROUNDED),
  'ʊ': vowelSpec(VOWEL_ROUNDED),
  'o': vowelSpec(VOWEL_ROUNDED),
  'ɔ': vowelSpec(VOWEL_ROUNDED),
  'y': vowelSpec(VOWEL_ROUNDED),
  'ʏ': vowelSpec(VOWEL_ROUNDED),
  'ø': vowelSpec(VOWEL_ROUNDED),
  'œ': vowelSpec(VOWEL_ROUNDED),
  'ɒ': vowelSpec(VOWEL_ROUNDED),
};

/**
 * Phones whose geometry involved a genuine analytical choice worth surfacing.
 *
 * Only choices belong here — not the mechanical consequences of the framework.
 * A labial having no [anterior], or a labiodental no [strident], is simply what
 * feature geometry does with dependents of a Place node the segment lacks; the
 * flat table is classical generative phonology and is expected to differ.
 */
export const GEOMETRY_REVIEW_NOTES: Record<string, string> = {
  'ʃ': 'Analysed as Coronal only, [−anterior, +distributed], with no Dorsal node.',
  'ʒ': 'Analysed as Coronal only, [−anterior, +distributed], with no Dorsal node.',
  'tʃ': 'Analysed as Coronal only, [−anterior, +distributed], with no Dorsal node.',
  'dʒ': 'Analysed as Coronal only, [−anterior, +distributed], with no Dorsal node.',
  'ñ': 'Palatal nasal analysed as Coronal [−anterior, +distributed], with no Dorsal node.',
  'j': 'Placed under Dorsal [+high, −back], unlike the Coronal-only palato-alveolars ʃ ʒ tʃ dʒ ñ.',
  'w': 'Both Labial and Dorsal (labio-velar), so it carries [round] and [back, low, high].',
  'h': 'The flat table’s glottal: + is read as [+spread glottis], not [+constricted glottis].',
  'ʔ': 'No Place node — a plain glottal stop, [+constricted glottis] only.',
};

/**
 * Maps the flat feature table onto the geometry. Leaves under a Place node the
 * phone lacks stay unspecified — [anterior] on a labial, for instance, is not
 * "minus", it is absent from the representation.
 */
export function derivePhoneGeometry(phone: string): PhoneGeometry | null {
  const spec = PHONE_GEOMETRY_SPECS[phone];
  const flat = phoneData[phone];
  if (!spec || !flat) return null;

  const nodes = new Set<GeometryNodeName>(spec.nodes);
  const leaves = { ...EMPTY_LEAVES };

  // Laryngeal. `aspirated` is [spread glottis]; `glottal` is [constricted glottis].
  leaves.voice = flat.voice;
  leaves.spreadGlottis = flat.aspirated;
  leaves.constrictedGlottis = flat.glottal;

  // Supralaryngeal daughters. `delayed_release` has no home in this geometry.
  leaves.sonorant = flat.sonorant;
  leaves.consonantal = flat.consonantal;
  leaves.continuant = flat.continuant;
  leaves.nasal = flat.nasal;

  if (nodes.has('Labial')) {
    leaves.round = flat.round;
  }

  if (nodes.has('Coronal')) {
    leaves.strident = flat.strident;
    leaves.anterior = flat.anterior;
    leaves.distributed = flat.distributed;
    leaves.lateral = flat.lateral;
  }

  if (nodes.has('Dorsal')) {
    leaves.back = flat.back;
    leaves.low = flat.low;
    leaves.high = flat.high;
  }

  if (nodes.has('TongueRoot')) {
    // The flat table has one ±ATR feature; the geometry has two privative-ish
    // leaves. −ATR is retracted, so it surfaces as [+RTR] with [ATR] cleared.
    if (flat.ATR === '+') {
      leaves.ATR = '+';
      leaves.RTR = '-';
    } else if (flat.ATR === '-') {
      leaves.RTR = '+';
    }
  }

  // Tonal leaves stay unspecified: no segment here carries tone data.

  for (const [name, value] of Object.entries(spec.leafOverrides ?? {})) {
    leaves[name as GeometryLeafName] = value;
  }

  return { nodes, leaves };
}

export const PHONE_GEOMETRIES: Record<string, PhoneGeometry> = Object.fromEntries(
  Object.keys(phoneData).flatMap((phone) => {
    const geometry = derivePhoneGeometry(phone);
    return geometry ? [[phone, geometry] as const] : [];
  }),
);

/** Phones in the inventory with no geometry spec — surfaced in the UI for manual work. */
export const PHONES_NEEDING_REVIEW: string[] = Object.keys(phoneData).filter(
  (phone) => !PHONE_GEOMETRIES[phone],
);
