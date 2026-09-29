import React from 'react';
import {
  Clock,
  Calendar,
  Share2,
  FileDown,
  Eye,
  Plus,
  Lock,
  CloudOff,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileEdit,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SessionPlan } from '../types';

export const MyPlansScreen: React.FC = () => {
  const {
    plans,
    isOnline,
    role,
    go,
    triggerSync,
    setPreviewPlan,
    setConflict,
    showToast,
  } = useApp();

  const canCreate = role === 'Teacher' || role === 'Administrator';
  const conflicts = plans.filter(p => p.status === 'conflict');
  const pendingCount = plans.filter(p => p.status === 'pending' || p.status === 'uploading').length;

  const renderBadge = (plan: SessionPlan) => {
    if (plan.status === 'synced') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#15803D] text-[11px] font-bold border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
          <span>Synced ✓</span>
        </span>
      );
    }
    if (plan.status === 'uploading') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] text-[11px] font-bold border border-blue-200">
          <RefreshCw className="w-3 h-3 text-[#2563EB] animate-spin" />
          <span>Uploading ({plan.uploadProgress || 68}%)...</span>
        </span>
      );
    }
    if (plan.status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-[#B45309] text-[11px] font-bold border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-[#B45309]" />
          <span>Pending sync</span>
        </span>
      );
    }
    if (plan.status === 'conflict') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[11px] font-bold border border-rose-300">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
          <span>Needs Review</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold border border-gray-200">
        <FileEdit className="w-3.5 h-3.5" />
        <span>Draft</span>
      </span>
    );
  };

  const handleOpenPlan = (p: SessionPlan) => {
    if (p.status === 'conflict') {
      setConflict({
        plan: p,
        remote: {
          title: `${p.title} (edited remotely)`,
          durationMinutes: 45,
          editedOn: 'Station 02 Tablet',
          editedAt: 'Today 07:40',
        },
      });
      return;
    }
    setPreviewPlan(p);
  };

  const handleShare = (e: React.MouseEvent, p: SessionPlan) => {
    e.stopPropagation();
    showToast(`Shared "${p.title}" read-only field spec`);
  };

  const handleExport = (e: React.MouseEvent, p: SessionPlan) => {
    e.stopPropagation();
    showToast(`Exported "${p.title}" PDF to local storage`);
  };

  return (
    <div id="screen-my-plans" className="flex-1 flex flex-col bg-[#F8FAF9] relative pb-28 overflow-y-auto">
      {/* Conflict Review Banner */}
      {conflicts.length > 0 && (
        <div className="px-4 pt-3 pb-1">
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-bold text-gray-900 leading-tight">
                  {conflicts.length} plan needs review
                </span>
                <span className="text-[11px] text-gray-600 truncate">
                  Changed locally and on another device
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenPlan(conflicts[0])}
              className="min-h-[40px] px-3 rounded-lg bg-white border border-rose-300 text-[12px] font-bold text-rose-800 shrink-0 cursor-pointer active:scale-95"
            >
              Review
            </button>
          </div>
        </div>
      )}

      {/* Offline Mode Banner */}
      {!isOnline && (
        <div className="px-4 pt-3 pb-1">
          <div className="bg-white border border-gray-200 rounded-2xl p-3 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#B45309] flex items-center justify-center shrink-0">
                <CloudOff className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-gray-900 leading-tight">
                  Offline Mode
                </span>
                <span className="text-[11px] text-gray-500">
                  {pendingCount > 0
                    ? `${pendingCount} plans waiting to sync`
                    : 'All plans preserved locally'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={triggerSync}
              className="min-h-[40px] px-3 flex items-center justify-center text-[12px] font-bold text-[#0F766E] hover:underline cursor-pointer"
            >
              Sync now
            </button>
          </div>
        </div>
      )}

      {/* Plans List */}
      <div className="px-4 py-3 space-y-3 flex-1">
        {plans.map(p => (
          <article
            key={p.id}
            onClick={() => handleOpenPlan(p)}
            className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:border-[#0F766E] transition-all space-y-2.5 cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center justify-between gap-2">
              {renderBadge(p)}
              <div className="flex items-center gap-1 text-gray-500 text-[12px] font-medium">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>{p.durationMinutes} min</span>
              </div>
            </div>

            {p.status === 'uploading' && (
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#0F766E] h-full rounded-full transition-all duration-300"
                  style={{ width: `${p.uploadProgress || 68}%` }}
                />
              </div>
            )}

            <h3 className="text-[16px] font-bold text-gray-900 leading-snug">{p.title}</h3>

            <div className="flex items-center gap-2 text-gray-500 text-[12px]">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>{p.dateString}</span>
              </div>
              <span aria-hidden="true">·</span>
              <span>{p.groupAllocation}</span>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 gap-1">
              <button
                type="button"
                onClick={e => handleShare(e, p)}
                aria-label={`Share ${p.title}`}
                className="min-h-[40px] px-2.5 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-1 text-[11px] font-semibold transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-gray-500" />
                <span>Share</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={e => handleExport(e, p)}
                  aria-label={`Export PDF for ${p.title}`}
                  className="min-h-[40px] px-2.5 py-1.5 rounded-lg text-gray-600 hover:text-[#0F766E] hover:bg-teal-50 flex items-center gap-1 text-[11px] font-semibold transition-all cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-[#0F766E]" />
                  <span>Export</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenPlan(p)}
                  aria-label={`View plan ${p.title}`}
                  className="min-h-[40px] px-3 py-1.5 bg-teal-50 text-[#0F766E] hover:bg-teal-100 rounded-lg flex items-center gap-1 text-[12px] font-bold transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>View</span>
                </button>
              </div>
            </div>
          </article>
        ))}

        <div className="pt-2 pb-4 text-center flex items-center justify-center gap-1.5 text-gray-500">
          <Lock className="w-3.5 h-3.5 text-[#0F766E]" />
          <p className="text-[11px] font-medium">No pupil data is collected or stored.</p>
        </div>
      </div>

      {/* Floating Action Button */}
      {canCreate && (
        <div className="absolute bottom-20 left-0 right-0 px-4 z-30 pointer-events-none flex justify-end">
          <button
            type="button"
            onClick={() => go('plan-filter')}
            className="pointer-events-auto flex items-center gap-1.5 bg-[#0F766E] hover:bg-[#0c625b] text-white px-5 py-3 rounded-2xl shadow-lg active:scale-95 transition-all min-h-[48px] font-bold text-[14px] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ New Session Plan</span>
          </button>
        </div>
      )}
    </div>
  );
};
