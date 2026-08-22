import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import {
  FontRatingData,
  getFontRating,
  getUserRatingForFont,
  submitFontRating,
  FONT_RATINGS_UPDATED_EVENT,
} from '../utils/fontRatingStorage';
import { IconStar, IconCheckCircle, IconCrown, IconClose } from './icons/Icons';

interface FontStarRatingProps {
  fontId: string;
  fontName: string;
  compact?: boolean;
  showBreakdown?: boolean;
  onRated?: (newRating: number) => void;
}

export const FontStarRating: React.FC<FontStarRatingProps> = ({
  fontId,
  fontName,
  compact = false,
  showBreakdown = false,
  onRated,
}) => {
  const { user, isGuest, openAuthModal } = useAuth();
  const [ratingData, setRatingData] = useState<FontRatingData>(() => getFontRating(fontId));
  const [hoverStar, setHoverStar] = useState<number | null>(null);
  const [showLoginNotice, setShowLoginNotice] = useState(false);
  const [userSuccessToast, setUserSuccessToast] = useState<string | null>(null);

  const currentUserKey = user && !isGuest ? user.username || user.email : null;
  const userCurrentRating = currentUserKey ? getUserRatingForFont(fontId, currentUserKey) : null;

  // Listen for storage updates
  useEffect(() => {
    const refreshData = () => {
      setRatingData(getFontRating(fontId));
    };
    refreshData();
    window.addEventListener(FONT_RATINGS_UPDATED_EVENT, refreshData);
    return () => {
      window.removeEventListener(FONT_RATINGS_UPDATED_EVENT, refreshData);
    };
  }, [fontId]);

  // Handle star click by user
  const handleStarClick = (starValue: number) => {
    if (!currentUserKey) {
      setShowLoginNotice(true);
      return;
    }

    const updated = submitFontRating(fontId, currentUserKey, starValue);
    setRatingData(updated);

    setUserSuccessToast(`تم تسجيل تقييمك (${starValue} نجوم) لخط "${fontName}" بنجاح!`);
    setTimeout(() => setUserSuccessToast(null), 3500);

    if (onRated) {
      onRated(starValue);
    }
  };

  const activeDisplayRating = hoverStar !== null ? hoverStar : (userCurrentRating || ratingData.average);

  return (
    <div className="space-y-3 font-body">
      {/* Success Feedback Alert */}
      <AnimatePresence>
        {userSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 text-[11px] font-bold flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-1.5">
              <IconCheckCircle size={14} className="text-amber-600" />
              <span>{userSuccessToast}</span>
            </div>
            <button
              onClick={() => setUserSuccessToast(null)}
              className="text-amber-700 hover:text-amber-900"
            >
              <IconClose size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interactive Stars Line */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Rating Score Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-400/30 shadow-xs">
          <IconStar size={16} fill="#f59e0b" className="text-amber-500" />
          <span className="font-heading font-extrabold text-xs text-amber-800">
            {ratingData.average.toFixed(1)}
          </span>
          <span className="text-[10px] text-amber-700/80 font-medium dir-rtl">
            ({ratingData.totalCount} تقييم)
          </span>
        </div>

        {/* 5 Interactive Stars Group */}
        <div
          className="flex items-center gap-1 bg-white/70 backdrop-blur-xs px-2 py-1 rounded-xl border border-slate-200/80 shadow-xs dir-ltr"
          onMouseLeave={() => setHoverStar(null)}
        >
          {[1, 2, 3, 4, 5].map((starIndex) => {
            const isFilled =
              hoverStar !== null
                ? starIndex <= hoverStar
                : starIndex <= Math.round(ratingData.average);

            const isUserChoice = userCurrentRating === starIndex;

            return (
              <motion.button
                key={starIndex}
                type="button"
                whileHover={{ scale: 1.25 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setHoverStar(starIndex)}
                onClick={() => handleStarClick(starIndex)}
                title={
                  currentUserKey
                    ? `تقييم ${starIndex} نجوم`
                    : 'سجل الدخول لتقييم هذا الخط'
                }
                className={`p-1 rounded-md transition-colors relative ${
                  isUserChoice ? 'ring-2 ring-amber-400' : ''
                }`}
              >
                <IconStar
                  size={compact ? 15 : 18}
                  fill={isFilled ? '#f59e0b' : 'none'}
                  className={
                    isFilled
                      ? 'text-amber-400 drop-shadow-xs'
                      : 'text-slate-300 hover:text-amber-300'
                  }
                />
              </motion.button>
            );
          })}
        </div>

        {/* User Rating Indicator */}
        {userCurrentRating && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 inline-flex items-center gap-1">
            <span>تقييمك: {userCurrentRating}</span>
            <IconStar size={11} fill="currentColor" className="text-amber-500" />
          </span>
        )}
      </div>

      {/* Guest Login Required Prompt Popover */}
      <AnimatePresence>
        {showLoginNotice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white text-xs shadow-xl border border-slate-700 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconCrown size={16} className="text-amber-400" />
                <span className="font-bold text-amber-200">
                  يرجى تسجيل الدخول لتقييم الخطوط
                </span>
              </div>
              <button
                onClick={() => setShowLoginNotice(false)}
                className="text-slate-400 hover:text-white"
              >
                <IconClose size={16} />
              </button>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              يمكن للمستخدمين الأعضاء المسجلين تقييم الخطوط وترك بصمتهم في ترتيب المعرض!
            </p>
            <div className="pt-1 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowLoginNotice(false)}
                className="px-3 py-1 rounded-lg bg-slate-700 text-slate-200 text-[11px] font-bold"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  setShowLoginNotice(false);
                  openAuthModal('login');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-extrabold shadow-sm transition-all"
              >
                تسجيل الدخول الآن
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Rating Breakdown (Distribution Bars) for Modal */}
      {showBreakdown && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-800">توزيع التقييمات حسب النجوم:</span>
            <span className="text-[11px] text-slate-500 font-semibold">
              المجموع: {ratingData.totalCount} صوت
            </span>
          </div>

          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingData.distribution[stars as keyof typeof ratingData.distribution] || 0;
              const pct = ratingData.totalCount > 0 ? Math.round((count / ratingData.totalCount) * 100) : 0;

              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 w-12 text-[11px] font-bold text-slate-700 dir-ltr justify-end">
                    <span>{stars}</span>
                    <IconStar size={12} fill="#f59e0b" className="text-amber-500" />
                  </div>

                  <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                    />
                  </div>

                  <span className="w-10 text-[10px] font-bold text-slate-500 text-left dir-ltr">
                    {pct}% ({count})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
