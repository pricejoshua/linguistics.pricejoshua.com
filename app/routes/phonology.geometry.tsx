import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import FeatureGeometryTree from '../components/phonology/FeatureGeometryTree';
import { getPhoneCategory, phoneData } from '../data/phonology/phoneData';
import { combineGeometries, emptyGeometry } from '../data/phonology/featureGeometry';
import {
  GEOMETRY_REVIEW_NOTES,
  PHONES_NEEDING_REVIEW,
  PHONE_GEOMETRIES,
} from '../data/phonology/phoneGeometry';
import type { PhoneCategory } from '../data/phonology/phoneData';

const ALL_PHONES = Object.keys(phoneData);

/** Same palette as the Feature Explorer's grid, so the two screens read as one tool. */
const CATEGORY_CLASSES: Record<PhoneCategory, { idle: string; selected: string }> = {
  vowel: {
    idle: 'bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800',
    selected: 'bg-red-500 dark:bg-red-700',
  },
  sonorant: {
    idle: 'bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800',
    selected: 'bg-yellow-500 dark:bg-yellow-700',
  },
  obstruent: {
    idle: 'bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800',
    selected: 'bg-blue-500 dark:bg-blue-700',
  },
};

export default function FeatureGeometryScreen() {
  const [selectedPhones, setSelectedPhones] = useState<string[]>([]);

  const togglePhone = (phone: string) => {
    setSelectedPhones((prev) =>
      prev.includes(phone) ? prev.filter((p) => p !== phone) : [...prev, phone],
    );
  };

  /** Selected phones that actually have a derived geometry. */
  const selectedWithGeometry = useMemo(
    () => selectedPhones.filter((phone) => PHONE_GEOMETRIES[phone]),
    [selectedPhones],
  );

  const combined = useMemo(() => {
    if (selectedWithGeometry.length === 0) return emptyGeometry();
    return combineGeometries(selectedWithGeometry.map((phone) => PHONE_GEOMETRIES[phone]));
  }, [selectedWithGeometry]);

  const activeNotes = useMemo(
    () => selectedPhones.filter((phone) => GEOMETRY_REVIEW_NOTES[phone]),
    [selectedPhones],
  );

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Feature Geometry
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-8">
          Select phones to see each one&rsquo;s feature-geometry tree and the structure they
          share. Nodes are privative: a greyed branch is absent from the representation, not
          negatively specified.
        </p>

        {/* Phone grid */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Phones ({ALL_PHONES.length})
            </h2>
            <button
              onClick={() => setSelectedPhones([])}
              className="flex items-center px-4 py-2 bg-gray-500 dark:bg-gray-700 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear
            </button>
          </div>

          <div className="grid grid-cols-6 md:grid-cols-12 lg:grid-cols-16 gap-2 mb-6">
            {ALL_PHONES.map((phone) => {
              const isSelected = selectedPhones.includes(phone);
              const classes = CATEGORY_CLASSES[getPhoneCategory(phone)];
              return (
                <button
                  key={phone}
                  onClick={() => togglePhone(phone)}
                  className={`p-3 rounded-lg text-center font-sans text-lg transition-colors ${
                    isSelected
                      ? `${classes.selected} text-white`
                      : `${classes.idle} text-gray-800 dark:text-gray-100`
                  }`}
                  title={`${phone} - Click to ${isSelected ? 'deselect' : 'select'}`}
                >
                  {phone}
                </button>
              );
            })}
          </div>

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

        {/* Combined tree */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Shared geometry
            {selectedWithGeometry.length > 0 && (
              <span className="ml-2 font-normal text-base text-gray-500 dark:text-gray-400">
                {selectedWithGeometry.join(' ')}
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            A node stays solid only if every selected phone has it; a leaf shows a value only
            if they all specify it and agree.
          </p>
          {selectedWithGeometry.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
              Select one or more phones above.
            </p>
          ) : (
            <FeatureGeometryTree
              geometry={combined}
              label={`Shared feature geometry for ${selectedWithGeometry.join(', ')}`}
              size="full"
            />
          )}
        </div>

        {/* Per-phone mini trees */}
        {selectedWithGeometry.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Per-phone geometry
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {selectedWithGeometry.map((phone) => (
                <div
                  key={phone}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
                >
                  <div className="text-2xl font-sans mb-2 text-gray-900 dark:text-gray-100">
                    {phone}
                  </div>
                  <FeatureGeometryTree
                    geometry={PHONE_GEOMETRIES[phone]}
                    label={`Feature geometry for ${phone}`}
                    size="mini"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Needs review */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Needs review
          </h2>

          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">No geometry</h3>
          {PHONES_NEEDING_REVIEW.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Every phone in the inventory has a derived geometry.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-6">
              {PHONES_NEEDING_REVIEW.map((phone) => (
                <span
                  key={phone}
                  className="px-3 py-1 bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-full text-sm"
                >
                  {phone}
                </span>
              ))}
            </div>
          )}

          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            Derived with a judgment call
          </h3>
          <ul className="space-y-1">
            {Object.entries(GEOMETRY_REVIEW_NOTES).map(([phone, note]) => (
              <li
                key={phone}
                className={`text-sm text-gray-600 dark:text-gray-300 rounded px-2 py-1 ${
                  activeNotes.includes(phone) ? 'bg-amber-50 dark:bg-amber-950' : ''
                }`}
              >
                <span className="font-sans text-base text-gray-900 dark:text-gray-100 mr-2">
                  {phone}
                </span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
