import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserRole,
  SyncStatus,
  Activity,
  SessionPlan,
  KitItem,
  KitRequest,
  PlanFilter,
  RemotePlanEdit,
} from '../types';
import {
  INITIAL_ACTIVITIES,
  INITIAL_PLANS,
  INITIAL_INVENTORY,
  INITIAL_KIT_REQUESTS,
  REMOTE_PLAN_EDITS,
  STAFF_CODE,
} from '../data/mockData';
import { safeStorage } from '../data/storage';

export interface PlanDraftData {
  title: string;
  template: string;
  groupSize: number;
  date: string;
  startTime: string;
  steps: any[];
  updatedAt: number;
}

export interface RunnerProgressData {
  completedStepIds: string[];
  minutesElapsed: number;
  timerRunning: boolean;
  updatedAt: number;
}

interface AppContextType {
  role: UserRole;
  isOnline: boolean;
  syncState: SyncStatus;
  activeTab: 'home' | 'explore' | 'my-plans' | 'kit' | 'settings';
  activeScreen: string;
  screenHistory: string[];
  selectedActivityId: string;
  runnerPlanId: string;
  previewPlan: SessionPlan | null;
  savedSuccessPlan: SessionPlan | null;
  conflict: { plan: SessionPlan; remote: RemotePlanEdit } | null;
  activities: Activity[];
  plans: SessionPlan[];
  inventory: KitItem[];
  kitRequests: KitRequest[];
  planFilter: PlanFilter;
  selectedPlanActivity: Activity;
  simulateStorageFull: boolean;
  simulateConflict: boolean;
  autoSync: boolean;
  mobileData: boolean;
  toast: { message: string; type: 'sync' | 'offline' | 'success' | 'alert' } | null;
  devicePlatform: 'ios' | 'android' | 'responsive';
  offlineReason: string | null;

  // Navigation
  go: (screen: string) => void;
  goBack: () => void;
  setTab: (tab: 'home' | 'explore' | 'my-plans' | 'kit' | 'settings') => void;
  setDevicePlatform: (p: 'ios' | 'android' | 'responsive') => void;

  // Actions
  setRole: (role: UserRole) => void;
  toggleOnline: () => void;
  triggerSync: () => void;
  openActivityDetail: (id: string) => void;
  toggleOfflineActivity: (id: string) => void;
  setPlanFilter: React.Dispatch<React.SetStateAction<PlanFilter>>;
  resetPlanFilter: () => void;
  startPlanCreationForActivity: (act: Activity) => void;
  saveNewPlan: (plan: SessionPlan) => boolean;
  setPreviewPlan: (plan: SessionPlan | null) => void;
  setSavedSuccessPlan: (plan: SessionPlan | null) => void;
  openRunner: (planId: string) => void;
  toggleRunnerStep: (stepId: string) => void;
  setConflict: (conflict: { plan: SessionPlan; remote: RemotePlanEdit } | null) => void;
  resolveConflict: (choice: 'mine' | 'theirs' | 'both') => void;
  requestKit: (kitId: string) => void;
  approveKitRequest: (requestId: string) => void;
  returnKitRequest: (requestId: string) => void;
  cancelKitRequest: (requestId: string) => void;
  updateStock: (kitId: string, delta: number) => void;
  checkOutKitItem: (kitId: string) => void;
  returnKitItem: (kitId: string) => void;
  setSimulateStorageFull: (val: boolean | ((prev: boolean) => boolean)) => void;
  setSimulateConflict: (val: boolean | ((prev: boolean) => boolean)) => void;
  setAutoSync: (val: boolean | ((prev: boolean) => boolean)) => void;
  setMobileData: (val: boolean | ((prev: boolean) => boolean)) => void;
  clearOldAndRetryStorage: () => void;
  showToast: (message: string, type?: 'sync' | 'offline' | 'success' | 'alert') => void;
  resetState: () => void;
  signOut: () => void;

  // Zero-data-loss drafts & runner progress
  saveDraft: (activityId: string, draft: PlanDraftData) => void;
  getDraft: (activityId: string) => PlanDraftData | null;
  clearDraft: (activityId: string) => void;
  saveRunnerProgress: (planId: string, progress: RunnerProgressData) => void;
  getRunnerProgress: (planId: string) => RunnerProgressData | null;
}

const defaultFilter: PlanFilter = {
  topic: 'All Topics',
  grade: 'all',
  duration: 'all',
  materials: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => safeStorage.getItem('stemmate_role', 'Teacher'));
  
  // Real browser online status detection with fallback
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  const [syncState, setSyncState] = useState<SyncStatus>(() => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return 'offline';
    }
    return 'synced';
  });

  const [offlineReason, setOfflineReason] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'my-plans' | 'kit' | 'settings'>('home');
  const [activeScreen, setActiveScreen] = useState<string>('login');
  const [screenHistory, setScreenHistory] = useState<string[]>(['login']);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('act-1');
  const [runnerPlanId, setRunnerPlanId] = useState<string>('plan-1');
  const [previewPlan, setPreviewPlan] = useState<SessionPlan | null>(null);
  const [savedSuccessPlan, setSavedSuccessPlan] = useState<SessionPlan | null>(null);
  const [conflict, setConflict] = useState<{ plan: SessionPlan; remote: RemotePlanEdit } | null>(null);

  // Persistent data state
  const [activities, setActivities] = useState<Activity[]>(() =>
    safeStorage.getItem('stemmate_activities', INITIAL_ACTIVITIES)
  );

  const [plans, setPlans] = useState<SessionPlan[]>(() =>
    safeStorage.getItem('stemmate_plans', INITIAL_PLANS)
  );

  const [inventory, setInventory] = useState<KitItem[]>(() =>
    safeStorage.getItem('stemmate_inventory', INITIAL_INVENTORY)
  );

  const [kitRequests, setKitRequests] = useState<KitRequest[]>(() =>
    safeStorage.getItem('stemmate_kit_requests', INITIAL_KIT_REQUESTS)
  );

  const [planFilter, setPlanFilter] = useState<PlanFilter>(defaultFilter);
  const [selectedPlanActivity, setSelectedPlanActivity] = useState<Activity>(INITIAL_ACTIVITIES[0]);
  const [simulateStorageFull, setSimulateStorageFull] = useState<boolean>(false);
  const [simulateConflict, setSimulateConflict] = useState<boolean>(false);
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [mobileData, setMobileData] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'sync' | 'offline' | 'success' | 'alert' } | null>(null);
  const [devicePlatform, setDevicePlatform] = useState<'ios' | 'android' | 'responsive'>('android');

  // Sync to safeStorage whenever plans, inventory, activities, or kitRequests change
  useEffect(() => {
    safeStorage.setItem('stemmate_plans', plans);
  }, [plans]);

  useEffect(() => {
    safeStorage.setItem('stemmate_activities', activities);
  }, [activities]);

  useEffect(() => {
    safeStorage.setItem('stemmate_inventory', inventory);
  }, [inventory]);

  useEffect(() => {
    safeStorage.setItem('stemmate_kit_requests', kitRequests);
  }, [kitRequests]);

  useEffect(() => {
    safeStorage.setItem('stemmate_role', role);
  }, [role]);

  // Real browser hardware online/offline event listeners
  useEffect(() => {
    const handleBrowserOnline = () => {
      setIsOnline(true);
      setSyncState('syncing');
      setOfflineReason(null);
      showToast('Connection restored! Synchronizing field updates...', 'sync');
      setTimeout(() => {
        completeSync();
      }, 1200);
    };

    const handleBrowserOffline = () => {
      setIsOnline(false);
      setSyncState('offline');
      setOfflineReason('Network link dropped');
      showToast('Connection lost! Working offline · All progress saved locally', 'offline');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleBrowserOnline);
      window.addEventListener('offline', handleBrowserOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleBrowserOnline);
        window.removeEventListener('offline', handleBrowserOffline);
      }
    };
  }, [plans, simulateConflict]);

  const showToast = (message: string, type: 'sync' | 'offline' | 'success' | 'alert' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const go = (screen: string) => {
    if (activeScreen === screen) return;
    setScreenHistory(prev => [...prev, screen]);
    setActiveScreen(screen);
    if (['home', 'explore', 'my-plans', 'kit', 'settings'].includes(screen)) {
      setActiveTab(screen as any);
    }
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const nextHistory = [...screenHistory];
      nextHistory.pop();
      const prevScreen = nextHistory[nextHistory.length - 1];
      setScreenHistory(nextHistory);
      setActiveScreen(prevScreen);
      if (['home', 'explore', 'my-plans', 'kit', 'settings'].includes(prevScreen)) {
        setActiveTab(prevScreen as any);
      }
    } else {
      go('home');
    }
  };

  const setTab = (tab: 'home' | 'explore' | 'my-plans' | 'kit' | 'settings') => {
    setActiveTab(tab);
    setScreenHistory([tab]);
    setActiveScreen(tab);
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  // Toggle connection state (allows manual simulation or field testing)
  const toggleOnline = () => {
    if (isOnline) {
      setIsOnline(false);
      setSyncState('offline');
      setOfflineReason('Offline mode selected');
      showToast('Connection lost! Offline mode active · Current progress saved locally', 'offline');
    } else {
      setIsOnline(true);
      setSyncState('syncing');
      setOfflineReason(null);
      showToast('Connecting to school station network...', 'sync');
      setTimeout(() => {
        completeSync();
      }, 1200);
    }
  };

  const completeSync = () => {
    setSyncState('synced');
    const pending = plans.filter(p => p.status === 'pending' || p.status === 'uploading');
    let conflictsFound = 0;
    let syncedCount = 0;

    const updated = plans.map(p => {
      if (p.status !== 'pending' && p.status !== 'uploading') return p;
      if (simulateConflict && REMOTE_PLAN_EDITS[p.id]) {
        conflictsFound++;
        return { ...p, status: 'conflict' as const, uploadProgress: undefined };
      }
      syncedCount++;
      return { ...p, status: 'synced' as const, uploadProgress: undefined };
    });

    setPlans(updated);
    if (conflictsFound > 0) {
      showToast(`${syncedCount} synced · ${conflictsFound} need review`, 'alert');
    } else if (pending.length > 0) {
      showToast(`${syncedCount} plans uploaded and synchronized ✓`, 'sync');
    } else {
      showToast('Station up to date with cloud archive', 'sync');
    }
  };

  const triggerSync = () => {
    if (!isOnline) {
      setIsOnline(true);
      setOfflineReason(null);
    }
    setSyncState('syncing');
    showToast('Pushing field updates to server...', 'sync');
    setTimeout(completeSync, 1200);
  };

  const openActivityDetail = (id: string) => {
    setSelectedActivityId(id);
    go('activity-detail');
  };

  const toggleOfflineActivity = (id: string) => {
    setActivities(prev =>
      prev.map(act => {
        if (act.id === id) {
          const nextVal = !act.isOfflineReady;
          showToast(nextVal ? `"${act.title}" cached for offline use` : 'Removed from offline storage');
          return { ...act, isOfflineReady: nextVal };
        }
        return act;
      })
    );
  };

  const resetPlanFilter = () => {
    setPlanFilter(defaultFilter);
  };

  const startPlanCreationForActivity = (act: Activity) => {
    setSelectedPlanActivity(act);
    go('plan-form');
  };

  const saveNewPlan = (newPlan: SessionPlan): boolean => {
    if (simulateStorageFull) {
      go('storage-error');
      return false;
    }
    setPlans(prev => [newPlan, ...prev]);
    // Clear the active draft for this activity once successfully saved
    clearDraft(newPlan.activityId);
    setSavedSuccessPlan(newPlan);
    return true;
  };

  const clearOldAndRetryStorage = () => {
    setPlans(prev => prev.filter(p => p.status !== 'synced'));
    setSimulateStorageFull(false);
    showToast('Cleared synced plans. Space recovered!');
    go('my-plans');
  };

  const openRunner = (planId: string) => {
    setRunnerPlanId(planId);
    setPreviewPlan(null);
    go('plan-runner');
  };

  const toggleRunnerStep = (stepId: string) => {
    setPlans(prev =>
      prev.map(p => {
        if (p.id === runnerPlanId) {
          const completed = p.completedStepIds || [];
          const nextCompleted = completed.includes(stepId)
            ? completed.filter(s => s !== stepId)
            : [...completed, stepId];
          return { ...p, completedStepIds: nextCompleted };
        }
        return p;
      })
    );
  };

  const resolveConflict = (choice: 'mine' | 'theirs' | 'both') => {
    if (!conflict) return;
    const { plan, remote } = conflict;
    setPlans(prev => {
      const idx = prev.findIndex(p => p.id === plan.id);
      if (idx === -1) return prev;
      const copy = [...prev];
      const remotePlan: SessionPlan = {
        ...plan,
        title: remote.title,
        durationMinutes: remote.durationMinutes,
        status: 'synced',
      };
      if (choice === 'mine') {
        copy[idx] = { ...plan, status: 'synced' };
        showToast('Kept your version. Broadcast on next sync.');
      } else if (choice === 'theirs') {
        copy[idx] = remotePlan;
        showToast('Adopted other station tablet version.');
      } else {
        copy[idx] = { ...plan, status: 'synced' };
        copy.splice(idx + 1, 0, {
          ...remotePlan,
          id: `${plan.id}-copy-${Date.now()}`,
          title: `${remote.title} (Copy from ${remote.editedOn})`,
        });
        showToast('Kept both versions! Copy preserved.');
      }
      return copy;
    });
    setConflict(null);
  };

  const requestKit = (kitId: string) => {
    const item = inventory.find(i => i.id === kitId);
    if (!item) return;
    const newReq: KitRequest = {
      id: `req-${Date.now()}`,
      kitId,
      boxNumber: item.boxNumber,
      kitName: item.name,
      facilitator: STAFF_CODE[role] || 'F-12',
      facilitatorRole: role,
      planTitle: 'Session Kit Allocation',
      dateNeeded: 'Mon 19 Oct 2026',
      returnDue: 'Tue 20 Oct 2026',
      status: 'requested',
    };
    setKitRequests(prev => [newReq, ...prev]);
    showToast(`Requested ${item.name} (${item.boxNumber}) for custody approval`);
  };

  const approveKitRequest = (requestId: string) => {
    setKitRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'checked-out' as const } : r))
    );
    showToast('Kit request approved and marked checked-out');
  };

  const returnKitRequest = (requestId: string) => {
    setKitRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'returned' as const } : r))
    );
    showToast('Kit return recorded into central inventory log');
  };

  const cancelKitRequest = (requestId: string) => {
    setKitRequests(prev => prev.filter(r => r.id !== requestId));
    showToast('Kit request cancelled');
  };

  const updateStock = (kitId: string, delta: number) => {
    setInventory(prev =>
      prev.map(item => {
        if (item.id === kitId) {
          const nextVal = Math.max(0, Math.min(item.totalUnits, item.availableUnits + delta));
          return { ...item, availableUnits: nextVal };
        }
        return item;
      })
    );
  };

  const checkOutKitItem = (kitId: string) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === kitId
          ? {
              ...item,
              status: 'in-use' as const,
              availableUnits: Math.max(0, item.availableUnits - 1),
              nextScheduled: 'Today 14:30 (Room 5)',
            }
          : item
      )
    );
    showToast('Box checked out to Classroom Room 5');
  };

  const returnKitItem = (kitId: string) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === kitId
          ? {
              ...item,
              status: 'available' as const,
              availableUnits: item.totalUnits,
              nextScheduled: '14 Oct',
            }
          : item
      )
    );
    showToast('Box returned and verified in cupboard');
  };

  // Drafts zero-data-loss persistence
  const saveDraft = (activityId: string, draft: PlanDraftData) => {
    safeStorage.setItem(`stemmate_draft_${activityId}`, draft);
    safeStorage.setItem('stemmate_last_active_draft_id', activityId);
  };

  const getDraft = (activityId: string): PlanDraftData | null => {
    return safeStorage.getItem<PlanDraftData | null>(`stemmate_draft_${activityId}`, null);
  };

  const clearDraft = (activityId: string) => {
    safeStorage.removeItem(`stemmate_draft_${activityId}`);
  };

  // Live runner progress persistence
  const saveRunnerProgress = (planId: string, progress: RunnerProgressData) => {
    safeStorage.setItem(`stemmate_runner_${planId}`, progress);
  };

  const getRunnerProgress = (planId: string): RunnerProgressData | null => {
    return safeStorage.getItem<RunnerProgressData | null>(`stemmate_runner_${planId}`, null);
  };

  const resetState = () => {
    safeStorage.removeItem('stemmate_plans');
    safeStorage.removeItem('stemmate_activities');
    safeStorage.removeItem('stemmate_inventory');
    safeStorage.removeItem('stemmate_kit_requests');
    setRoleState('Teacher');
    setIsOnline(true);
    setSyncState('synced');
    setOfflineReason(null);
    setActivities(INITIAL_ACTIVITIES);
    setPlans(INITIAL_PLANS);
    setInventory(INITIAL_INVENTORY);
    setKitRequests(INITIAL_KIT_REQUESTS);
    setPlanFilter(defaultFilter);
    setSimulateStorageFull(false);
    setSimulateConflict(false);
    setPreviewPlan(null);
    setSavedSuccessPlan(null);
    setConflict(null);
    setActiveScreen('login');
    setScreenHistory(['login']);
    showToast('Prototype state reset to defaults');
  };

  const signOut = () => {
    // Clear all draft keys on sign out
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('stemmate_draft_') || k.startsWith('stemmate_runner_')) {
        safeStorage.removeItem(k);
      }
    });
    setRoleState('Teacher');
    setActiveScreen('login');
    setScreenHistory(['login']);
    showToast('Signed out. In-progress drafts deleted from this tablet.');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        isOnline,
        syncState,
        activeTab,
        activeScreen,
        screenHistory,
        selectedActivityId,
        runnerPlanId,
        previewPlan,
        savedSuccessPlan,
        conflict,
        activities,
        plans,
        inventory,
        kitRequests,
        planFilter,
        selectedPlanActivity,
        simulateStorageFull,
        simulateConflict,
        autoSync,
        mobileData,
        toast,
        devicePlatform,
        offlineReason,
        go,
        goBack,
        setTab,
        setDevicePlatform,
        setRole,
        toggleOnline,
        triggerSync,
        openActivityDetail,
        toggleOfflineActivity,
        setPlanFilter,
        resetPlanFilter,
        startPlanCreationForActivity,
        saveNewPlan,
        setPreviewPlan,
        setSavedSuccessPlan,
        openRunner,
        toggleRunnerStep,
        setConflict,
        resolveConflict,
        requestKit,
        approveKitRequest,
        returnKitRequest,
        cancelKitRequest,
        updateStock,
        checkOutKitItem,
        returnKitItem,
        setSimulateStorageFull,
        setSimulateConflict,
        setAutoSync,
        setMobileData,
        clearOldAndRetryStorage,
        showToast,
        resetState,
        signOut,
        saveDraft,
        getDraft,
        clearDraft,
        saveRunnerProgress,
        getRunnerProgress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
