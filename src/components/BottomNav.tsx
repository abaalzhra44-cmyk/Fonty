import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import {
  IconHome,
  IconCloud,
  IconFonts,
  IconInspector,
  IconCompare,
  IconShield,
  IconLab,
} from './icons/Icons';

export const BottomNav: React.FC = React.memo(() => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const navItems = [
    { path: '/', label: 'الرئيسية', icon: IconHome },
    { path: '/gallery', label: 'السحابة', icon: IconCloud },
    { path: '/my-fonts', label: 'خطوطي', icon: IconFonts },
    { path: '/inspector', label: 'المفتش', icon: IconInspector },
    { path: '/compare', label: 'مقارنة', icon: IconCompare },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin', label: 'الإدارة', icon: IconShield });
  }

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-xl liquid-glass-nav rounded-full p-2 shadow-2xl shadow-sky-950/15 transition-colors duration-300 ring-1 ring-white/80">
      <div className="flex items-center justify-around relative">
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          const IconComponent = item.icon;
          const isAdminItem = item.path === '/admin';

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-xs transition-colors duration-300 ${
                isActive
                  ? isAdminItem
                    ? 'text-amber-600 font-bold'
                    : 'text-sky-700 font-bold'
                  : isAdminItem
                  ? 'text-amber-600/80 hover:text-amber-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className={`absolute inset-0 border rounded-full shadow-xs ${
                    isAdminItem
                      ? 'bg-gradient-to-r from-amber-400/20 via-amber-500/25 to-orange-500/20 border-amber-400/50'
                      : 'bg-gradient-to-r from-sky-400/20 via-sky-500/25 to-blue-500/20 border-sky-400/50'
                  }`}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <span className="relative z-10 mb-0.5 flex items-center justify-center">
                <IconComponent size={20} />
              </span>
              <span className="relative z-10 font-body text-[11px] leading-none whitespace-nowrap">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
});
