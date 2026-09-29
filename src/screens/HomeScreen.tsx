import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  Search,
  X,
  Clock,
  School,
  CheckCircle2,
  Play,
  Timer,
  CheckSquare,
  Users,
  MapPin,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FILTER_CHIPS } from '../data/mockData';

export const HomeScreen: React.FC = () => {
  const { role, activities, go, openActivityDetail, openRunner } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  const toggleChip = (chip: string) => {
    setSelectedChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const filteredActivities = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return activities.filter(act => {
      const matchesQ =
        !q ||
        act.title.toLowerCase().includes(q) ||
        act.topic.toLowerCase().includes(q) ||
        act.description.toLowerCase().includes(q) ||
        act.materialsSummary.toLowerCase().includes(q);

      const matchesChips =
        selectedChips.length === 0 ||
        selectedChips.every(chip => {
          if (chip === 'Grade 4-6') return act.level.includes('4-6') || act.level.includes('5-7');
          if (chip === 'Physics') return act.topic.toLowerCase().includes('physic') || act.tags.includes('Physics');
          if (chip === 'Outdoor') return act.tags.includes('Outdoor') || act.description.toLowerCase().includes('outdoor');
          if (chip === 'Under 60 min') return act.durationMinutes <= 60;
          if (chip === 'Low Cost') return act.tags.includes('Low Cost');
          return true;
        });

      return matchesQ && matchesChips;
    });
  }, [activities, searchQuery, selectedChips]);

  return (
    <div id="screen-home" className="flex-1 px-4 pt-3 pb-24 overflow-y-auto space-y-4 bg-[#F8FAF9]">
      {/* Header Greeting */}
      <section className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-[19px] font-bold text-gray-900 tracking-tight leading-snug">
            Good morning, {role}
          </h2>
          <div className="flex items-center gap-1 text-gray-500 text-[11.5px] mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>Station 04 · Field Lab Unit</span>
          </div>
        </div>
      </section>

      {/* Primary CTA */}
      <section>
        <button
          type="button"
          id="home-create-session-plan-btn"
          onClick={() => go('plan-filter')}
          className="w-full min-h-[50px] bg-[#0F766E] hover:bg-[#0c625b] active:scale-[0.98] text-white font-bold text-[14px] rounded-xl flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer select-none"
        >
          <PlusCircle className="w-5 h-5 stroke-[2.2]" />
          <span>Create Session Plan</span>
        </button>
      </section>

      {/* Search Input */}
      <section>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" />
          <input
            id="home-search-input"
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search activities, kits, or topics..."
            className="w-full h-11 pl-10 pr-9 bg-white rounded-xl border border-gray-300 text-[13.5px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 p-1 text-gray-400 hover:text-gray-700 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      {/* Filter Chips Bar */}
      <section className="-mx-4 px-4 overflow-x-auto no-scrollbar py-0.5">
        <div className="flex gap-1.5 items-center whitespace-nowrap">
          {FILTER_CHIPS.map(chip => {
            const isSelected = selectedChips.includes(chip);
            return (
              <button
                key={chip}
                type="button"
                onClick={() => toggleChip(chip)}
                aria-pressed={isSelected}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium min-h-[36px] active:scale-95 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F766E] text-white shadow-2xs'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-[#0F766E]'
                }`}
              >
                <span>{chip}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Suggested Activities Feed */}
      <section className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">Suggested Activities</h3>
          <span className="text-[11px] font-semibold text-[#0F766E] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
            {filteredActivities.length} available
          </span>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-gray-900">No matching activities</p>
              <p className="text-[12px] text-gray-500 mt-0.5">Try clearing filters or search terms</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedChips([]);
              }}
              className="px-4 py-2 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0c625b]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredActivities.slice(0, 4).map(act => {
              const firstMat = act.materials[0];
              return (
                <article
                  key={act.id}
                  className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col gap-2.5 transition-all hover:border-[#0F766E]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{act.durationMinutes}m</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{act.level}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-teal-800">{act.topic}</span>
                      </div>
                      <h4 className="text-[15.5px] font-bold text-gray-900 leading-snug">
                        {act.title}
                      </h4>
                    </div>

                    {act.isOfflineReady && (
                      <div
                        className="inline-flex items-center gap-1 bg-emerald-50 text-[#15803D] border border-emerald-200 px-2 py-0.5 rounded-full text-[10.5px] font-bold shrink-0"
                        title="Offline ready"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Offline</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[12px] text-gray-600 line-clamp-2 leading-relaxed">
                    {act.description}
                  </p>

                  <div className="bg-[#F8FAF9] rounded-xl p-2.5 border border-gray-200/70 text-[11.5px] text-gray-600">
                    <span className="font-semibold text-gray-800">Materials: </span>
                    <span>{act.materialsSummary}</span>
                    {firstMat && (
                      <div className="flex items-center gap-1 mt-1 text-[#0F766E] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{firstMat.name} ({firstMat.statusText})</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openActivityDetail(act.id)}
                      className="min-h-[44px] bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-1.5 hover:border-[#0F766E] active:scale-98 transition-all cursor-pointer"
                    >
                      <span>View Blueprint</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openActivityDetail(act.id)}
                      className="min-h-[44px] bg-[#0F766E] hover:bg-[#0c625b] text-white rounded-xl font-semibold text-[13px] flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer shadow-2xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Launch</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Field Utilities Section */}
      <section className="pt-2">
        <h3 className="text-[15px] font-bold text-gray-900 mb-2">Field Utilities</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => openRunner('plan-1')}
            className="min-h-[68px] bg-white rounded-xl p-2 border border-gray-200 flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#0F766E] active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center mb-1">
              <Timer className="w-4 h-4" />
            </div>
            <span className="text-[11.5px] font-semibold text-gray-800 leading-tight">Field Timer</span>
          </button>

          <button
            type="button"
            onClick={() => openActivityDetail('act-1')}
            className="min-h-[68px] bg-white rounded-xl p-2 border border-gray-200 flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#0F766E] active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center mb-1">
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className="text-[11.5px] font-semibold text-gray-800 leading-tight">Kit Checklist</span>
          </button>

          <button
            type="button"
            onClick={() => openRunner('plan-1')}
            className="min-h-[68px] bg-white rounded-xl p-2 border border-gray-200 flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#0F766E] active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center mb-1">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11.5px] font-semibold text-gray-800 leading-tight">Squad Counter</span>
          </button>
        </div>
      </section>

      {/* Anonymous Data Notice */}
      <footer className="pt-2 pb-4 flex items-center justify-center gap-1.5 text-gray-500 border-t border-gray-200/70">
        <Lock className="w-3.5 h-3.5 text-[#0F766E]" />
        <p className="text-[11px] font-medium text-center">
          No pupil data is collected or stored. All records local.
        </p>
      </footer>
    </div>
  );
};
