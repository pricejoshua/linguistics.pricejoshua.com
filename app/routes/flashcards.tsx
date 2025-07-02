import React, { useState, useEffect, useRef } from 'react';

// JSON schema for flashcard sets
// {
//   "name": "Vowels",
//   "cards": [
//     { "name": "Close front unrounded vowel", "symbol": "i" },
//     { "name": "Open-mid back rounded vowel", "symbol": "ɔ" }
//   ]
// }

interface FlashCard {
  name: string;
  symbol: string;
}

interface FlashCardSet {
  name: string;
  cards: FlashCard[];
}

const defaultSets: FlashCardSet[] = [
  {
    name: 'Vowels',
    cards: [
      { name: 'Close front unrounded vowel', symbol: 'i' },
      { name: 'Close front rounded vowel', symbol: 'y' },
      { name: 'Close central unrounded vowel', symbol: 'ɨ' },
      { name: 'Close central rounded vowel', symbol: 'ʉ' },
      { name: 'Close back rounded vowel', symbol: 'u' },
      { name: 'Close back unrounded vowel', symbol: 'ɯ' },
      { name: 'Near-close near-front unrounded vowel', symbol: 'ɪ' }, 
      { name: 'Near-close near-front rounded vowel', symbol: 'ʏ' },
      { name: 'Near-close near-back rounded vowel', symbol: 'ʊ' },
      { name: 'Close-mid front unrounded vowel', symbol: 'e' },
      { name: 'Close-mid front rounded vowel', symbol: 'ø' },
      { name: 'Close-mid back unrounded vowel', symbol: 'ɤ' },
      { name: 'Close-mid back rounded vowel', symbol: 'o' },
      { name: 'Mid-central vowel', symbol: 'ə' },
      { name: 'Open-mid front unrounded vowel', symbol: 'ɛ' },
      { name: 'Open-mid front rounded vowel', symbol: 'œ' },
      { name: 'Open-mid central unrounded vowel', symbol: 'ɜ' },
      { name: 'Open-mid back unrounded vowel', symbol: 'ʌ' },
      { name: 'Open-mid back rounded vowel', symbol: 'ɔ' },
      { name: 'Near-open front unrounded vowel', symbol: 'æ' },
      { name: 'Open front rounded vowel', symbol: 'ɶ'},
      { name: 'Open back unrounded vowel', symbol: 'ɑ'},
      { name: 'Open central unrounded vowel', symbol: 'a' },
    ],
  },
  {
    name: '(some) Consonants',
    cards: [
      { name: 'Voiceless bilabial plosive', symbol: 'p' },
      { name: 'Voiced bilabial plosive', symbol: 'b' },
      { name: 'Voiceless alveolar plosive', symbol: 't' },
      { name: 'Voiced alveolar plosive', symbol: 'd' },
      { name: 'Voiceless velar plosive', symbol: 'k' },
      { name: 'Voiced velar plosive', symbol: 'g' },
      { name: 'Voiceless labiodental fricative', symbol: 'f' },
      { name: 'Voiced labiodental fricative', symbol: 'v' },
      { name: 'Voiceless dental fricative', symbol: 'θ' },
      { name: 'Voiced dental fricative', symbol: 'ð' },
      { name: 'Voiceless alveolar fricative', symbol: 's' },
      { name: 'Voiced alveolar fricative', symbol: 'z' },
      { name: 'Voiceless postalveolar fricative', symbol: 'ʃ' },
      { name: 'Voiced postalveolar fricative', symbol: 'ʒ' },
      { name: 'Voiceless glottal fricative', symbol: 'h' },
      { name: 'Voiced bilabial nasal', symbol: 'm' },
      { name: 'Voiced alveolar nasal', symbol: 'n' },
      { name: 'Voiced velar nasal', symbol: 'ŋ' },
      { name: 'Voiced alveolar lateral approximant', symbol: 'l' },
      { name: 'Voiced alveolar approximant', symbol: 'ɹ' },
    ],
  },
];

const LOCAL_STORAGE_KEY_SETS = 'flashcardSets';
const LOCAL_STORAGE_KEY_FAVS = 'flashcardFavorites';

const FlashcardApp: React.FC = () => {
  // Load from localStorage if available
  const [sets, setSets] = useState<FlashCardSet[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SETS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return defaultSets;
  });
  const [favorites, setFavorites] = useState<{ [setName: string]: Set<number> }>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_FAVS);
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        // Convert arrays to Set
        const out: { [setName: string]: Set<number> } = {};
        for (const k in obj) out[k] = new Set(obj[k]);
        return out;
      } catch {}
    }
    return {};
  });
  const [currentSetIdx, setCurrentSetIdx] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [frontIsName, setFrontIsName] = useState(true);
  const [cardAnim, setCardAnim] = useState<'none' | 'next' | 'prev'>('none');
  const [shuffleMode, setShuffleMode] = useState(false);
  const [favoritesMode, setFavoritesMode] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);
  const prevSetIdx = useRef(currentSetIdx);

  const currentSet = sets[currentSetIdx];

  // Shuffle logic
  useEffect(() => {
    if (shuffleMode) {
      const indices = Array.from({ length: currentSet.cards.length }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setShuffledOrder(indices);
      setCurrentIdx(0);
    } else {
      setShuffledOrder([]);
      setCurrentIdx(0);
    }
  }, [shuffleMode, currentSetIdx, currentSet.cards.length]);

  // Reset index if set changes
  useEffect(() => {
    if (prevSetIdx.current !== currentSetIdx) {
      setCurrentIdx(0);
      prevSetIdx.current = currentSetIdx;
    }
  }, [currentSetIdx]);

  // Get indices for current mode
  const getActiveIndices = () => {
    let indices = shuffleMode ? shuffledOrder : Array.from({ length: currentSet.cards.length }, (_, i) => i);
    if (favoritesMode) {
      const favs = favorites[currentSet.name] || new Set<number>();
      indices = indices.filter((i: number) => favs.has(i));
    }
    return indices;
  };
  const activeIndices = getActiveIndices();
  const activeIdx = activeIndices[currentIdx] ?? 0;
  const currentCard = currentSet.cards[activeIdx];

  const handleNext = () => {
    setCardAnim('next');
    setTimeout(() => {
      setCurrentIdx((idx) => (idx + 1) % (activeIndices.length || 1));
      setFlipped(false);
      setCardAnim('none');
    }, 250);
  };
  const handlePrev = () => {
    setCardAnim('prev');
    setTimeout(() => {
      setCurrentIdx((idx) => (idx - 1 + (activeIndices.length || 1)) % (activeIndices.length || 1));
      setFlipped(false);
      setCardAnim('none');
    }, 250);
  };
  const handleSetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentSetIdx(Number(e.target.value));
    setCurrentIdx(0);
    setFlipped(false);
  };
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.name && Array.isArray(json.cards)) {
          setSets((prev) => [...prev, json]);
          setCurrentSetIdx(sets.length); // select new set
          setCurrentIdx(0);
          setFlipped(false);
        } else {
          alert('Invalid flashcard set format.');
        }
      } catch {
        alert('Could not parse JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Favorite logic
  const isFavorite = (setName: string, idx: number) => (favorites[setName]?.has(idx) ?? false);
  const toggleFavorite = () => {
    setFavorites(prev => {
      const setName = currentSet.name;
      const idx = activeIdx;
      const prevSet = prev[setName] ? new Set<number>(Array.from(prev[setName])) : new Set<number>();
      if (prevSet.has(idx)) {
        prevSet.delete(idx);
      } else {
        prevSet.add(idx);
      }
      return { ...prev, [setName]: prevSet };
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        setFlipped(f => !f);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSet.cards.length, handleNext, handlePrev]);

  // Save sets and favorites to localStorage on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SETS, JSON.stringify(sets));
  }, [sets]);
  useEffect(() => {
    // Convert Set to Array for storage
    const favObj: { [setName: string]: number[] } = {};
    for (const k in favorites) favObj[k] = Array.from(favorites[k]);
    localStorage.setItem(LOCAL_STORAGE_KEY_FAVS, JSON.stringify(favObj));
  }, [favorites]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
        <select
          value={currentSetIdx}
          onChange={handleSetChange}
          className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-gray-100"
        >
          {sets.map((set, idx) => (
            <option key={set.name} value={idx}>{set.name}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <input
            type="checkbox"
            checked={frontIsName}
            onChange={() => setFrontIsName(f => !f)}
          />
          Name on front
        </label>
        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <input
            type="checkbox"
            checked={shuffleMode}
            onChange={() => setShuffleMode(s => !s)}
          />
          Shuffle
        </label>
        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <input
            type="checkbox"
            checked={favoritesMode}
            onChange={() => setFavoritesMode(f => !f)}
            disabled={!(favorites[currentSet.name]?.size > 0)}
          />
          Favorites
        </label>
        <input
          type="file"
          accept="application/json"
          onChange={handleUpload}
          className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      <div className="w-full max-w-xs">
        <div
          className={`relative rounded-lg shadow-lg p-8 flex flex-col items-center justify-center min-h-[200px] cursor-pointer select-none transition-transform duration-300 perspective-1000 group
            bg-white dark:bg-gray-900
            ${cardAnim === 'next' ? 'animate-slide-left' : ''}
            ${cardAnim === 'prev' ? 'animate-slide-right' : ''}
            hover:scale-105`}
          style={{ perspective: 1000 }}
          onClick={() => setFlipped(f => !f)}
        >
          {/* Favorite button */}
          <button
            onClick={e => { e.stopPropagation(); toggleFavorite(); }}
            className="absolute top-2 right-2 text-yellow-400 hover:scale-125 transition-transform"
            title={isFavorite(currentSet.name, activeIdx) ? 'Unmark favorite' : 'Mark as favorite'}
            aria-label="Toggle favorite"
          >
            {isFavorite(currentSet.name, activeIdx)
              ? '★'
              : '☆'}
          </button>
          <div
            className={`w-full h-full flex items-center justify-center transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}
          >
            <div className="absolute w-full h-full flex items-center justify-center backface-hidden text-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {frontIsName ? currentCard.name : currentCard.symbol}
              </span>
            </div>
            <div className="absolute w-full h-full flex items-center justify-center backface-hidden [transform:rotateY(180deg)] text-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {frontIsName ? currentCard.symbol : currentCard.name}
              </span>
            </div>
          </div>
          <span className="absolute bottom-2 right-4 text-xs text-gray-400 group-hover:text-blue-500 transition-colors">Click to flip</span>
        </div>
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePrev}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
            disabled={activeIndices.length === 0}
          >Prev</button>
          <span className="text-gray-600 dark:text-gray-300">{activeIndices.length === 0 ? 0 : currentIdx + 1} / {activeIndices.length}</span>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
            disabled={activeIndices.length === 0}
          >Next</button>
        </div>
      </div>
      <div>
        <p className="mt-8 max-w-xl text-s text-gray-500 dark:text-gray-400">
          Use arrow keys to navigate cards, spacebar to flip. Upload your own flashcard sets in JSON format.<br/>
          Shuffle mode randomizes the order. Mark cards as favorites (star) and use Favorites mode to study only those.
        </p>
      </div>
    </div>
  );
};

export default FlashcardApp;

/* Add Tailwind keyframes for slide animations */
// In your global CSS (e.g., app.css), add:
// @keyframes slide-left { 0% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(-60px); } }
// @keyframes slide-right { 0% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(60px); } }
// .animate-slide-left { animation: slide-left 0.25s linear; }
// .animate-slide-right { animation: slide-right 0.25s linear; }
