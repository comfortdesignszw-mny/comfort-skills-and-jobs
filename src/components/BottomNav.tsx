import React from 'react';
import { Home, GraduationCap, Briefcase, Store, User } from 'lucide-react';
import { useApp, NavTab } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, syncQueue, translate } = useApp();

  const navItems: { id: NavTab; labelKey: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', labelKey: 'nav_home', icon: Home },
    { id: 'learn', labelKey: 'nav_learn', icon: GraduationCap },
    { id: 'work', labelKey: 'nav_work', icon: Briefcase },
    { id: 'business', labelKey: 'nav_business', icon: Store },
    { id: 'profile', labelKey: 'nav_profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-all active:scale-90 relative ${
                isActive ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {item.id === 'work' && syncQueue.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 leading-none">
                {translate(item.labelKey)}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-5 h-0.5 bg-teal-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
