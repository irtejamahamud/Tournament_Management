import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { X } from 'lucide-react';

// Popular icons for teams
const POPULAR_ICONS = [
  'Trophy', 'Target', 'Zap', 'Flame', 'Star', 'Crown', 'Shield', 'Sword',
  'Rocket', 'ThumbsUp', 'Heart', 'Circle', 'Square', 'Triangle', 'Diamond',
  'Flag', 'Award', 'Medal', 'Sparkles', 'Sun', 'Moon', 'CloudLightning',
  'Mountain', 'Waves', 'Wind', 'Snowflake', 'Leaf', 'Feather', 'Fish',
  'Bird', 'Bug', 'Skull', 'Ghost', 'Anchor', 'Plane', 'Ship', 'Car',
  'Bike', 'Music', 'Camera', 'Palette', 'Hammer', 'Wrench', 'Swords',
  'Crosshair', 'Hexagon', 'Pentagon', 'Octagon'
];

interface Props {
  selectedIcon: string;
  onSelect: (iconName: string) => void;
  onClose: () => void;
}

const IconSelector: React.FC<Props> = ({ selectedIcon, onSelect, onClose }) => {
  const [search, setSearch] = useState('');

  const filteredIcons = POPULAR_ICONS.filter(name =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const renderIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="w-6 h-6" />;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white">Select Team Icon</h3>
            <p className="text-sm text-slate-400 mt-1">Choose an icon from Lucide React</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-800">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons..."
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
            {filteredIcons.map((iconName) => (
              <button
                key={iconName}
                onClick={() => {
                  onSelect(iconName);
                  onClose();
                }}
                className={`aspect-square flex items-center justify-center rounded-lg border-2 transition-all hover:scale-110 ${
                  selectedIcon === iconName
                    ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                }`}
                title={iconName}
              >
                {renderIcon(iconName)}
              </button>
            ))}
          </div>
          {filteredIcons.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No icons found matching "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IconSelector;
