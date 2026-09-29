/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileFrame } from './components/MobileFrame';
import { TopAppBar, BottomTabBar } from './components/Navigation';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ExploreScreen } from './screens/ExploreScreen';
import { ActivityDetailScreen } from './screens/ActivityDetailScreen';
import { CreatePlanFilterScreen } from './screens/CreatePlanFilterScreen';
import { CreatePlanResultsScreen } from './screens/CreatePlanResultsScreen';
import { CreatePlanFormScreen } from './screens/CreatePlanFormScreen';
import { MyPlansScreen } from './screens/MyPlansScreen';
import { LessonRunnerScreen } from './screens/LessonRunnerScreen';
import { KitScreen } from './screens/KitScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { StorageErrorScreen } from './screens/StorageErrorScreen';
import { PlanPreviewModal } from './components/PlanPreviewModal';
import { SaveSuccessModal } from './components/SaveSuccessModal';
import { ConflictModal } from './components/ConflictModal';

const AppContent: React.FC = () => {
  const { activeScreen, activeTab, role } = useApp();

  const isTabScreen = ['home', 'explore', 'my-plans', 'kit', 'settings'].includes(activeScreen);

  const getScreenTitle = () => {
    switch (activeScreen) {
      case 'home':
        return 'STEMMATE Namibia';
      case 'explore':
        return 'STEM Library';
      case 'my-plans':
        return 'My Plans';
      case 'kit':
        return 'Kit Inventory';
      case 'settings':
        return 'Settings';
      default:
        return 'STEMMATE';
    }
  };

  const getScreenSubtitle = () => {
    switch (activeScreen) {
      case 'home':
        return 'Station 04 · Field Lab';
      case 'kit':
        return `${role} View`;
      default:
        return undefined;
    }
  };

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'login':
        return <LoginScreen />;
      case 'home':
        return <HomeScreen />;
      case 'explore':
        return <ExploreScreen />;
      case 'activity-detail':
        return <ActivityDetailScreen />;
      case 'plan-filter':
        return <CreatePlanFilterScreen />;
      case 'plan-filter-results':
        return <CreatePlanResultsScreen />;
      case 'plan-form':
        return <CreatePlanFormScreen />;
      case 'my-plans':
        return <MyPlansScreen />;
      case 'plan-runner':
        return <LessonRunnerScreen />;
      case 'kit':
        return <KitScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'storage-error':
        return <StorageErrorScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <MobileFrame>
      {/* Top App Bar for root tab screens */}
      {isTabScreen && (
        <TopAppBar title={getScreenTitle()} subtitle={getScreenSubtitle()} />
      )}

      {/* Screen Viewport */}
      {renderActiveScreen()}

      {/* Bottom Navigation Tab Bar for root screens */}
      {isTabScreen && <BottomTabBar />}

      {/* Modals & Overlays */}
      <PlanPreviewModal />
      <SaveSuccessModal />
      <ConflictModal />
    </MobileFrame>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
