import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { extractPhonesFromHtml } from '../utils/parser';
import MinimalDistinguishingFeatureSets from './MinimalDistinguishingFeatureSets';

// Types for feature values and phone data
// A feature value is either '+' | '-' | undefined (for missing features)
type FeatureValue = '+' | '-' | undefined;

// All possible feature names
type Feature =
  | 'syllabic' | 'consonantal' | 'sonorant' | 'continuant' | 'delayed_release'
  | 'strident' | 'distributed' | 'lateral' | 'anterior' | 'coronal' | 'nasal'
  | 'voice' | 'aspirated' | 'glottal' | 'high' | 'low' | 'back' | 'round' | 'ATR';

// The data for a single phone
interface PhoneFeatures {
  [feature: string]: FeatureValue;
}

// The phoneData object
const phoneData: Record<string, PhoneFeatures> = {
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

const features: Feature[] = [
  'syllabic', 'consonantal', 'sonorant', 'continuant', 'delayed_release', 
  'strident', 'distributed', 'lateral', 'anterior', 'coronal', 'nasal', 
  'voice', 'aspirated', 'glottal', 'high', 'low', 'back', 'round', 'ATR'
];

// Major class definitions
type MajorClassName =
  | 'Obstruents' | 'Stops' | 'Fricatives' | 'Affricates' | 'Sonorants' | 'Nasals'
  | 'Liquids' | 'Glides' | 'Vowels' | 'Sibilants' | 'Voiced' | 'Voiceless';

const majorClasses: Record<MajorClassName, Partial<PhoneFeatures>> = {
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

const PhoneticsFeaturesApp: React.FC = () => {
  // State types
  const [selectedPhones, setSelectedPhones] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<MajorClassName | ''>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showOnlySelected, setShowOnlySelected] = useState<boolean>(false);
  const [importedConsonants, setImportedConsonants] = useState<string[] | null>(null);
  const [importedVowels, setImportedVowels] = useState<string[] | null>(null);
  const [limitToImported, setLimitToImported] = useState(false);

  // Function parameter types
  const togglePhone = (phone: string) => {
    setSelectedPhones(prev => 
      prev.includes(phone) 
        ? prev.filter(p => p !== phone)
        : [...prev, phone]
    );
  };

  const selectMajorClass = (className: MajorClassName) => {
    const classFeatures = majorClasses[className];
    let phonePool: string[];
    if (limitToImported && validImportedPhones && validImportedPhones.length > 0) {
      phonePool = validImportedPhones;
    } else {
      phonePool = Object.keys(phoneData);
    }
    const matchingPhones = phonePool.filter(phone => {
      return Object.entries(classFeatures).every(([feature, value]) => 
        phoneData[phone][feature] === value
      );
    });
    setSelectedPhones(matchingPhones);
    setSelectedClass(className);
  };

  const clearSelection = () => {
    setSelectedPhones([]);
    setSelectedClass('');
  };

  const commonFeatures = useMemo<Record<string, FeatureValue>>(() => {
    if (selectedPhones.length === 0) return {};
    const common: Record<string, FeatureValue> = {};
    features.forEach(feature => {
      const values = selectedPhones.map(phone => phoneData[phone][feature]).filter(v => v);
      if (values.length === selectedPhones.length && new Set(values).size === 1) {
        common[feature] = values[0];
      }
    });
    return common;
  }, [selectedPhones]);

  // Helper: get the set of imported phones that exist in phoneData
  const validImportedPhones = useMemo(() => {
    if (!importedConsonants && !importedVowels) return null;
    const all = [
      ...(importedConsonants || []),
      ...(importedVowels || [])
    ];
    return all.filter(p => phoneData[p]);
  }, [importedConsonants, importedVowels]);

  // Compute distinctive features for selected phones vs. complement set
  const distinctiveFeatures = useMemo(() => {
    if (!validImportedPhones) return {};
    if (selectedPhones.length === 0) return {};
    // The set of all imported phones (filtered to those in phoneData)
    const importedPhones = validImportedPhones;
    // If not limiting to imported, use all phones
    const universe = (limitToImported && importedPhones.length > 0)
      ? importedPhones
      : Object.keys(phoneData);
    // Complement set: all phones in universe not selected
    const complement = universe.filter(p => !selectedPhones.includes(p));
    // For each feature, check if all selected share a value, and all complement do not
    const result: Record<string, FeatureValue> = {};
    features.forEach(feature => {
      const selVals = selectedPhones.map(p => phoneData[p]?.[feature]).filter(v => v);
      if (selVals.length !== selectedPhones.length) return; // skip if missing
      const selVal = selVals[0];
      if (!selVal) return;
      if (!selVals.every(v => v === selVal)) return;
      // Now check complement
      if (complement.length === 0) return;
      const compVals = complement.map(p => phoneData[p]?.[feature]).filter(v => v);
      // If all complement phones have a value, and none match selVal, it's distinctive
      if (compVals.length === complement.length && !compVals.includes(selVal)) {
        result[feature] = selVal;
      }
    });
    return result;
  }, [selectedPhones, validImportedPhones, limitToImported]);

  // Find minimal distinguishing feature sets
  const minimalFeatureCombos = useMemo(() => {
    if (selectedPhones.length === 0 || Object.keys(distinctiveFeatures).length === 0) return [];
    const featureKeys = Object.keys(distinctiveFeatures);
    const combos: Set<string>[] = [];
    // Start with individual features
    featureKeys.forEach(key => {
      const value = distinctiveFeatures[key];
      if (value) {
        combos.push(new Set([`${key}:${value}`]));
      }
    });
    // Combine features to find minimal sets
    for (let i = 0; i < featureKeys.length; i++) {
      for (let j = i + 1; j < featureKeys.length; j++) {
        const combo = new Set([`${featureKeys[i]}:${distinctiveFeatures[featureKeys[i]]}`, `${featureKeys[j]}:${distinctiveFeatures[featureKeys[j]]}`]);
        if (!combos.some(c => [...c].every(f => combo.has(f)))) {
          combos.push(combo);
        }
      }
    }
    // Filter out non-minimal combos
    const minimalCombos = combos.filter(combo => {
      return !combos.some(other => 
        other !== combo && [...combo].every(f => other.has(f))
      );
    });
    return minimalCombos;
  }, [selectedPhones, distinctiveFeatures]);

  // Handle consonant file import
  const handleImportConsonants = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const phones = extractPhonesFromHtml(text);
    setImportedConsonants(phones);
  };
  // Handle vowel file import
  const handleImportVowels = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const phones = extractPhonesFromHtml(text);
    setImportedVowels(phones);
  };
  const handleDone = () => {
    console.log('Done importing:', { importedConsonants, importedVowels });
    setLimitToImported(true);
    setShowOnlySelected(false);
    setSelectedPhones([]);
    setSelectedClass('');
  };
  const handleClearImport = () => {
    setImportedConsonants(null);
    setImportedVowels(null);
    setLimitToImported(false);
    setShowOnlySelected(false);
    setSelectedPhones([]);
    setSelectedClass('');
    setSearchTerm('');
  };

  const DEBUG_LIMIT_IMPORT = false; // set to true to enable limiting to imported phones

  // Filtered phones logic
  const filteredPhones = useMemo(() => {
    let basePhones: string[];
    if (limitToImported && validImportedPhones && validImportedPhones.length > 0) {
      basePhones = validImportedPhones;
    } else {
      basePhones = Object.keys(phoneData);
    }
    return basePhones.filter(phone =>
      phone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [limitToImported, validImportedPhones, searchTerm]);

  const displayPhones = showOnlySelected ? selectedPhones : filteredPhones;

  const getPhoneCategory = (phone: string): 'vowel' | 'sonorant' | 'obstruent' => {
    const data = phoneData[phone];
    if (!data) return 'obstruent'; // fallback for safety
    if (data.syllabic === '+') return 'vowel';
    if (data.sonorant === '+') return 'sonorant';
    return 'obstruent';
  };

  // Persist imported phones to localStorage
  useEffect(() => {
    if (importedConsonants || importedVowels) {
      localStorage.setItem('importedConsonants', JSON.stringify(importedConsonants || []));
      localStorage.setItem('importedVowels', JSON.stringify(importedVowels || []));
    } else {
      localStorage.removeItem('importedConsonants');
      localStorage.removeItem('importedVowels');
    }
  }, [importedConsonants, importedVowels]);

  // Restore imported phones from localStorage on mount
  useEffect(() => {
    const savedConsonants = localStorage.getItem('importedConsonants');
    const savedVowels = localStorage.getItem('importedVowels');
    if (savedConsonants) setImportedConsonants(JSON.parse(savedConsonants));
    if (savedVowels) setImportedVowels(JSON.parse(savedVowels));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Phonetics Feature Explorer</h1>
        
        {/* Import controls */}
        <div className="flex gap-4 mb-6">
          <label className="flex flex-col items-center cursor-pointer">
            <span className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mb-1">Import Consonants (PA HTML)</span>
            <input
              key={importedConsonants ? importedConsonants.join(',') : 'empty'}
              type="file"
              accept=".html,.htm"
              className="hidden"
              onChange={handleImportConsonants}
            />
            {importedConsonants && <span className="text-xs text-green-700 mt-1">Consonants loaded</span>}
          </label>
          <label className="flex flex-col items-center cursor-pointer">
            <span className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mb-1">Import Vowels (PA HTML)</span>
            <input
              key={importedVowels ? importedVowels.join(',') : 'empty'}
              type="file"
              accept=".html,.htm"
              className="hidden"
              onChange={handleImportVowels}
            />
            {importedVowels && <span className="text-xs text-green-700 mt-1">Vowels loaded</span>}
          </label>
          {importedConsonants && importedVowels && !limitToImported && (
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              onClick={handleDone}
            >
              Done
            </button>
          )}
          {(importedConsonants || importedVowels) && (
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
              onClick={handleClearImport}
            >
              Clear Import
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Search Phones</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Search phones..."
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Major Classes</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  const value = e.target.value;
                  if (Object.keys(majorClasses).includes(value)) {
                    selectMajorClass(value as MajorClassName);
                  } else {
                    clearSelection();
                  }
                }}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Select a class...</option>
                {Object.keys(majorClasses).map(className => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end space-x-2">
              <button
                onClick={clearSelection}
                className="flex items-center px-4 py-2 bg-gray-500 dark:bg-gray-700 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </button>
              <button
                onClick={() => setShowOnlySelected(!showOnlySelected)}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  showOnlySelected 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Show Selected Only
              </button>
            </div>
          </div>
          
          {selectedPhones.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-md">
              <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                Selected Phones ({selectedPhones.length}):
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedPhones.map(phone => (
                  <span key={phone} className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded-full text-sm">
                    {phone}
                  </span>
                ))}
              </div>
              {Object.keys(commonFeatures).length > 0 && (
                <div className="mb-3">
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Common Features:</h4>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {Object.entries(commonFeatures).map(([feature, value]) => (
                      <div key={feature} className="text-sm">
                        <span className="font-medium">{feature}:</span> {value}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Distinctive Features Section (moved here) */}
              {(importedConsonants || importedVowels) && Object.keys(distinctiveFeatures).length > 0 && (
                <div className="mb-3">
                  <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">Distinctive Features (vs. imported set):</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(distinctiveFeatures).map(([feature, value]) => (
                      <div key={feature} className="text-sm font-mono">
                        <span className="font-medium">{feature}:</span> {value}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">These features distinguish the selected phones from all other imported phones.</p>
                </div>
              )}
              {/* Minimal Distinguishing Feature Sets Section */}
              {(importedConsonants || importedVowels) && selectedPhones.length > 0 && (
                <MinimalDistinguishingFeatureSets
                  selectedPhones={selectedPhones}
                  validImportedPhones={validImportedPhones || []}
                  phoneData={phoneData}
                  features={features}
                  limitToImported={limitToImported}
                />
              )}
            </div>
          )}
        </div>

        {/* Phone Grid */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Phones {showOnlySelected ? '(Selected)' : '(All)'}
          </h2>
          
          <div className="grid grid-cols-6 md:grid-cols-12 lg:grid-cols-16 gap-2 mb-6">
            {displayPhones.map(phone => {
              const isSelected = selectedPhones.includes(phone);
              const category = getPhoneCategory(phone);
              const bgColor = category === 'vowel' ? 'bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800' : 
                             category === 'sonorant' ? 'bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800' : 
                             'bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800';
              const selectedBg = category === 'vowel' ? 'bg-red-500 dark:bg-red-700' : 
                               category === 'sonorant' ? 'bg-yellow-500 dark:bg-yellow-700' : 
                               'bg-blue-500 dark:bg-blue-700';
              
              return (
                <button
                  key={phone}
                  onClick={() => togglePhone(phone)}
                  className={`p-3 rounded-lg text-center font-sans text-lg transition-colors ${
                    isSelected 
                      ? `${selectedBg} text-white` 
                      : `${bgColor} text-gray-800 dark:text-gray-100`
                  }`}
                  title={`${phone} - Click to ${isSelected ? 'deselect' : 'select'}`}
                >
                  {phone}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 dark:bg-red-900 rounded mr-2"></div>
              Vowels
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900 rounded mr-2"></div>
              Sonorants
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900 rounded mr-2"></div>
              Obstruents
            </div>
          </div>
        </div>

        {/* Feature Details */}
        {selectedPhones.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Feature Matrix</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left font-medium text-gray-900 dark:text-gray-100">Phone</th>
                    {features.map(feature => (
                      <th key={feature} className="px-3 py-2 text-center font-medium text-gray-900 dark:text-gray-100 min-w-[80px]">
                        {feature}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedPhones.map(phone => (
                    <tr key={phone} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-2 font-mono font-bold text-lg">{phone}</td>
                      {features.map(feature => {
                        const value = phoneData[phone][feature];
                        const isCommon = commonFeatures[feature] === value;
                        return (
                          <td key={feature} className={`px-3 py-2 text-center font-mono ${
                            isCommon ? 'bg-green-100 dark:bg-green-900 font-bold' : ''
                          }`}>
                            {value || '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Green highlighting indicates common features across selected phones.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneticsFeaturesApp;