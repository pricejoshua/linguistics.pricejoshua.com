// Types for feature values and phone data
// A feature value is either '+' | '-' | undefined (for missing features)
export type FeatureValue = '+' | '-' | undefined;

// All possible feature names
export type Feature =
  | 'syllabic' | 'consonantal' | 'sonorant' | 'continuant' | 'delayed_release'
  | 'strident' | 'distributed' | 'lateral' | 'anterior' | 'coronal' | 'nasal'
  | 'voice' | 'aspirated' | 'glottal' | 'high' | 'low' | 'back' | 'round' | 'ATR';

// The data for a single phone
export interface PhoneFeatures {
  [feature: string]: FeatureValue;
}

// The phoneData object
export const phoneData: Record<string, PhoneFeatures> = {
  // Consonants from Classical Distinctive Features table
  'p': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '-', delayed_release: '-', strident: '-', distributed: '+', lateral: '-', anterior: '+', coronal: '-', nasal: '-', voice: '-', aspirated: '-', glottal: '-', high: '-', low: '-', back: '-', round: '-' },
  'pʰ': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '-', delayed_release: '-', strident: '-', distributed: '+', lateral: '-', anterior: '+', coronal: '-', nasal: '-', voice: '-', aspirated: '+', glottal: '-', high: '-', low: '-', back: '-', round: '-' },
  'p\'': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '-', delayed_release: '-', strident: '-', distributed: '+', lateral: '-', anterior: '+', coronal: '-', nasal: '-', voice: '-', aspirated: '-', glottal: '+', high: '-', low: '-', back: '-', round: '-' },
  'b': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '-', delayed_release: '-', strident: '-', distributed: '+', lateral: '-', anterior: '+', coronal: '-', nasal: '-', voice: '+', aspirated: '-', glottal: '-', high: '-', low: '-', back: '-', round: '-' },
  't': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '-', delayed_release: '-', strident: '-', distributed: '-', lateral: '-', anterior: '+', coronal: '+', nasal: '-', voice: '-', aspirated: '-', glottal: '-', high: '-', low: '-', back: '-', round: '-' },
  'd': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '-', delayed_release: '-', strident: '-', distributed: '-', lateral: '-', anterior: '+', coronal: '+', nasal: '-', voice: '+', aspirated: '-', glottal: '-', high: '-', low: '-', back: '-', round: '-' },
  'k': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '-', delayed_release: '-', strident: '-', distributed: '-', lateral: '-', anterior: '-', coronal: '-', nasal: '-', voice: '-', aspirated: '-', glottal: '-', high: '+', low: '-', back: '+', round: '-' },
  'g': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '-', delayed_release: '-', strident: '-', distributed: '-', lateral: '-', anterior: '-', coronal: '-', nasal: '-', voice: '+', aspirated: '-', glottal: '-', high: '+', low: '-', back: '+', round: '-' },
  'q': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '-', delayed_release: '-', strident: '-', distributed: '-', lateral: '-', anterior: '-', coronal: '-', nasal: '-', voice: '-', aspirated: '-', glottal: '-', high: '-', low: '-', back: '+', round: '-' },
  'ɸ': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '+', delayed_release: '+', strident: '-', distributed: '+', lateral: '-', anterior: '+', coronal: '-', nasal: '-', voice: '-', aspirated: '-', glottal: '-', high: '-', low: '-', back: '-', round: '-' },
  'β': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '+', delayed_release: '+', strident: '-', distributed: '+', lateral: '-', anterior: '+', coronal: '-', nasal: '-', voice: '+', aspirated: '-', glottal: '-', high: '-', low: '-', back: '-', round: '-' },
  'f': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '+', delayed_release: '+', strident: '+', distributed: '-', lateral: '-', anterior: '+', coronal: '-', nasal: '-', voice: '-', aspirated: '-', glottal: '-', high: '-', low: '-', back: '-', round: '-' },
  'v': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '+', delayed_release: '+', strident: '+', distributed: '-', lateral: '-', anterior: '+', coronal: '-', nasal: '-', voice: '+', aspirated: '-', glottal: '-', high: '-', low: '-', back: '-', round: '-' },
  'θ': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '+', delayed_release: '+', strident: '-', distributed: '+', lateral: '-', anterior: '+', coronal: '+', nasal: '-', voice: '-', aspirated: '-', glottal: '-', high: '-', low: '-', back: '-', round: '-' },
  'ð': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '+', delayed_release: '+', strident: '-', distributed: '+', lateral: '-', anterior: '+', coronal: '+', nasal: '-', voice: '+', aspirated: '-', glottal: '-', high: '-', low: '-', back: '-', round: '-' },
  's': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '+', delayed_release: '+', strident: '+', distributed: '-', lateral: '-', anterior: '+', coronal: '+', nasal: '-', voice: '-', aspirated: '-', glottal: '-', high: '-', low: '-', back: '-', round: '-' },
  'z': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '+', delayed_release: '+', strident: '+', distributed: '-', lateral: '-', anterior: '+', coronal: '+', nasal: '-', voice: '+', aspirated: '-', glottal: '-', high: '-', low: '-', back: '-', round: '-' },
  'ʃ': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '+', delayed_release: '+', strident: '+', distributed: '+', lateral: '-', anterior: '-', coronal: '+', nasal: '-', voice: '-', aspirated: '-', glottal: '-', high: '+', low: '-', back: '-', round: '-' },
  'ʒ': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '+', delayed_release: '+', strident: '+', distributed: '+', lateral: '-', anterior: '-', coronal: '+', nasal: '-', voice: '+', aspirated: '-', glottal: '-', high: '+', low: '-', back: '-', round: '-' },
  'x': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '+', delayed_release: '+', strident: '-', distributed: '-', lateral: '-', anterior: '-', coronal: '-', nasal: '-', voice: '-', aspirated: '-', glottal: '-', high: '+', low: '-', back: '+', round: '-' },
  'ɣ': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '+', delayed_release: '+', strident: '-', distributed: '-', lateral: '-', anterior: '-', coronal: '-', nasal: '-', voice: '+', aspirated: '-', glottal: '-', high: '+', low: '-', back: '+', round: '-' },
  'ts': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '-', delayed_release: '+', strident: '+', distributed: '-', lateral: '-', anterior: '+', coronal: '+', nasal: '-', voice: '-', aspirated: '-', glottal: '-', high: '-', low: '-', back: '-', round: '-' },
  'tʃ': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '-', delayed_release: '+', strident: '+', distributed: '+', lateral: '-', anterior: '-', coronal: '+', nasal: '-', voice: '-', aspirated: '-', glottal: '-', high: '+', low: '-', back: '-', round: '-' },
  'dʒ': { syllabic: '-', consonantal: '+', sonorant: '-', continuant: '-', delayed_release: '+', strident: '+', distributed: '+', lateral: '-', anterior: '-', coronal: '+', nasal: '-', voice: '+', aspirated: '-', glottal: '-', high: '+', low: '-', back: '-', round: '-' },
  
  // Sonorant consonants
  'm': { syllabic: '-', consonantal: '+', sonorant: '+', continuant: '-', delayed_release: '-', strident: '-', distributed: '+', lateral: '-', anterior: '+', coronal: '-', nasal: '+', voice: '+', aspirated: '-', glottal: '-', high: '-', low: '-', back: '-', round: '-' },
  'ɱ': { syllabic: '-', consonantal: '+', sonorant: '+', continuant: '-', delayed_release: '-', strident: '-', distributed: '-', lateral: '-', anterior: '+', coronal: '-', nasal: '+', voice: '+', aspirated: '-', glottal: '-', high: '-', low: '-', back: '-', round: '-' },
  'n': { syllabic: '-', consonantal: '+', sonorant: '+', continuant: '-', delayed_release: '-', strident: '-', distributed: '-', lateral: '-', anterior: '+', coronal: '+', nasal: '+', voice: '+', aspirated: '-', glottal: '-', high: '-', low: '-', back: '-', round: '-' },
  'ñ': { syllabic: '-', consonantal: '+', sonorant: '+', continuant: '-', delayed_release: '-', strident: '-', distributed: '+', lateral: '-', anterior: '-', coronal: '+', nasal: '+', voice: '+', aspirated: '-', glottal: '-', high: '+', low: '-', back: '-', round: '-' },
  'ŋ': { syllabic: '-', consonantal: '+', sonorant: '+', continuant: '-', delayed_release: '-', strident: '-', distributed: '-', lateral: '-', anterior: '-', coronal: '-', nasal: '+', voice: '+', aspirated: '-', glottal: '-', high: '+', low: '-', back: '+', round: '-' },
  'l': { syllabic: '-', consonantal: '+', sonorant: '+', continuant: '+', delayed_release: '+', strident: '-', distributed: '-', lateral: '+', anterior: '+', coronal: '+', nasal: '-', voice: '+', aspirated: '-', glottal: '-', high: '-', low: '-', back: '-', round: '-' },
  'ɬ': { syllabic: '-', consonantal: '+', sonorant: '+', continuant: '+', delayed_release: '+', strident: '-', distributed: '-', lateral: '+', anterior: '+', coronal: '+', nasal: '-', voice: '-', aspirated: '-', glottal: '-', high: '-', low: '-', back: '-', round: '-' },
  'ɾ': { syllabic: '-', consonantal: '+', sonorant: '+', continuant: '+', delayed_release: '+', strident: '-', distributed: '-', lateral: '-', anterior: '+', coronal: '+', nasal: '-', voice: '+', aspirated: '-', glottal: '-', high: '-', low: '-', back: '-', round: '-' },
  
  // Glides
  'j': { syllabic: '-', consonantal: '-', sonorant: '+', continuant: '+', delayed_release: '+', strident: '-', distributed: '-', lateral: '-', anterior: '-', coronal: '-', nasal: '-', voice: '+', aspirated: '-', glottal: '-', high: '+', low: '-', back: '-', round: '-' },
  'w': { syllabic: '-', consonantal: '-', sonorant: '+', continuant: '+', delayed_release: '+', strident: '-', distributed: '+', lateral: '-', anterior: '-', coronal: '-', nasal: '-', voice: '+', aspirated: '-', glottal: '-', high: '+', low: '-', back: '+', round: '+' },
  'ʔ': { syllabic: '-', consonantal: '-', sonorant: '+', continuant: '-', delayed_release: '-', strident: '-', distributed: '-', lateral: '-', anterior: '-', coronal: '-', nasal: '-', voice: '-', aspirated: '-', glottal: '+', high: '-', low: '-', back: '-', round: '-' },
  'h': { syllabic: '-', consonantal: '-', sonorant: '+', continuant: '+', delayed_release: '+', strident: '-', distributed: '-', lateral: '-', anterior: '-', coronal: '-', nasal: '-', voice: '-', aspirated: '-', glottal: '+', high: '-', low: '-', back: '-', round: '-' },
  
  // Vowels from the feature chart
  'i': { syllabic: '+', consonantal: '-', sonorant: '+', continuant: '+', high: '+', low: '-', back: '-', round: '-', ATR: '+' },
  'ɪ': { syllabic: '+', consonantal: '-', sonorant: '+', continuant: '+', high: '+', low: '-', back: '-', round: '-', ATR: '-' },
  'e': { syllabic: '+', consonantal: '-', sonorant: '+', continuant: '+', high: '-', low: '-', back: '-', round: '-', ATR: '+' },
  'ε': { syllabic: '+', consonantal: '-', sonorant: '+', continuant: '+', high: '-', low: '-', back: '-', round: '-', ATR: '-' },
  'æ': { syllabic: '+', consonantal: '-', sonorant: '+', continuant: '+', high: '-', low: '+', back: '-', round: '-', ATR: '+' },
  'ə': { syllabic: '+', consonantal: '-', sonorant: '+', continuant: '+', high: '-', low: '-', back: '+', round: '-', ATR: '+' },
  'a': { syllabic: '+', consonantal: '-', sonorant: '+', continuant: '+', high: '-', low: '+', back: '+', round: '-', ATR: '-' },
  'ɨ': { syllabic: '+', consonantal: '-', sonorant: '+', continuant: '+', high: '+', low: '-', back: '+', round: '-', ATR: '+' },
  'ɯ': { syllabic: '+', consonantal: '-', sonorant: '+', continuant: '+', high: '+', low: '-', back: '+', round: '-', ATR: '+' },
  'u': { syllabic: '+', consonantal: '-', sonorant: '+', continuant: '+', high: '+', low: '-', back: '+', round: '+', ATR: '+' },
  'ʊ': { syllabic: '+', consonantal: '-', sonorant: '+', continuant: '+', high: '+', low: '-', back: '+', round: '+', ATR: '-' },
  'o': { syllabic: '+', consonantal: '-', sonorant: '+', continuant: '+', high: '-', low: '-', back: '+', round: '+', ATR: '+' },
  'ɔ': { syllabic: '+', consonantal: '-', sonorant: '+', continuant: '+', high: '-', low: '-', back: '+', round: '+', ATR: '-' },
  
  // Additional vowels from vowel chart
  'y': { syllabic: '+', consonantal: '-', sonorant: '+', continuant: '+', high: '+', low: '-', back: '-', round: '+', ATR: '+' },
  'ʏ': { syllabic: '+', consonantal: '-', sonorant: '+', continuant: '+', high: '+', low: '-', back: '-', round: '+', ATR: '-' },
  'ø': { syllabic: '+', consonantal: '-', sonorant: '+', continuant: '+', high: '-', low: '-', back: '-', round: '+', ATR: '+' },
  'œ': { syllabic: '+', consonantal: '-', sonorant: '+', continuant: '+', high: '-', low: '-', back: '-', round: '+', ATR: '-' },
  'ʌ': { syllabic: '+', consonantal: '-', sonorant: '+', continuant: '+', high: '-', low: '-', back: '+', round: '-', ATR: '-' },
  'ɒ': { syllabic: '+', consonantal: '-', sonorant: '+', continuant: '+', high: '-', low: '+', back: '+', round: '+', ATR: '-' },
};

export const features: Feature[] = [
  'syllabic', 'consonantal', 'sonorant', 'continuant', 'delayed_release', 
  'strident', 'distributed', 'lateral', 'anterior', 'coronal', 'nasal', 
  'voice', 'aspirated', 'glottal', 'high', 'low', 'back', 'round', 'ATR'
];

// Major class definitions
export type MajorClassName =
  | 'Obstruents' | 'Stops' | 'Fricatives' | 'Affricates' | 'Sonorants' | 'Nasals'
  | 'Liquids' | 'Glides' | 'Vowels' | 'Sibilants' | 'Voiced' | 'Voiceless';

export const majorClasses: Record<MajorClassName, Partial<PhoneFeatures>> = {
  'Obstruents': { sonorant: '-' },
  'Stops': { sonorant: '-', continuant: '-' },
  'Fricatives': { sonorant: '-', continuant: '+' },
  'Affricates': { sonorant: '-', continuant: '-', delayed_release: '+' },
  'Sonorants': { sonorant: '+' },
  'Nasals': { sonorant: '+', nasal: '+' },
  'Liquids': { sonorant: '+', consonantal: '+', nasal: '-' },
  'Glides': { syllabic: '-', consonantal: '-' },
  'Vowels': { syllabic: '+' },
  'Sibilants': { strident: '+' },
  'Voiced': { voice: '+' },
  'Voiceless': { voice: '-' }
};

export type PhoneCategory = 'vowel' | 'sonorant' | 'obstruent';

export function getPhoneCategory(phone: string): PhoneCategory {
  const data = phoneData[phone];
  if (!data) return 'obstruent'; // fallback for safety
  if (data.syllabic === '+') return 'vowel';
  if (data.sonorant === '+') return 'sonorant';
  return 'obstruent';
}
