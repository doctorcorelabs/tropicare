/**
 * TropiCare — Hydration Calculator
 * WHO-based oral rehydration formula for dengue patients
 */

/**
 * Calculate daily fluid requirement based on weight (Holliday-Segar formula)
 * Used for dengue maintenance fluid calculation
 */
export function calculateDailyFluid(weightKg) {
    if (weightKg <= 0) return 0;

    let ml = 0;

    if (weightKg <= 10) {
        ml = weightKg * 100;
    } else if (weightKg <= 20) {
        ml = 1000 + (weightKg - 10) * 50;
    } else {
        ml = 1500 + (weightKg - 20) * 20;
    }

    // Dengue patients need additional 5% of body weight for deficit replacement
    const deficitReplacement = weightKg * 50; // 5% of body weight in ml

    return {
        maintenance: Math.round(ml),
        withDeficit: Math.round(ml + deficitReplacement),
        perHour: Math.round(ml / 24),
        perHourWithDeficit: Math.round((ml + deficitReplacement) / 24),
        oralPerSession: Math.round(ml / 12), // every 2 hours
    };
}

/**
 * Get hydration tips based on fluid type
 */
export const FLUID_OPTIONS = [
    { id: 'water', labelKey: 'hydration.water', icon: '💧', mlPerGlass: 250 },
    { id: 'ors', labelKey: 'hydration.ors', icon: '🥤', mlPerGlass: 200 },
    { id: 'coconut', labelKey: 'hydration.coconut', icon: '🥥', mlPerGlass: 250 },
    { id: 'juice', labelKey: 'hydration.juice', icon: '🧃', mlPerGlass: 200 },
    { id: 'soup', labelKey: 'hydration.soup', icon: '🍲', mlPerGlass: 250 },
    { id: 'isotonic', labelKey: 'hydration.iso', icon: '🏃', mlPerGlass: 350 },
];

/**
 * ORS Preparation Guide
 */
export const ORS_RECIPE = {
    title: 'Cara Membuat Larutan Oralit (ORS) di Rumah',
    steps: [
        'Siapkan 1 liter air matang yang sudah dingin',
        'Tambahkan 6 sendok teh (30 gram) gula pasir',
        'Tambahkan ½ sendok teh (2.5 gram) garam dapur',
        'Aduk hingga larut sempurna',
        'Minum dalam porsi kecil-kecil secara berkala',
    ],
    note: 'Larutan ini setara dengan ORS standar WHO. Simpan di lemari es dan buang setelah 24 jam.',
};

/**
 * Calculate hydration progress percentage
 */
export function calculateProgress(totalIntake, target) {
    if (target <= 0) return 0;
    return Math.min(Math.round((totalIntake / target) * 100), 100);
}

/**
 * Get hydration status based on progress
 */
export function getHydrationStatus(progressPercent, lang = 'id') {
    const isEn = lang === 'en';
    if (progressPercent >= 100) {
        return { label: isEn ? 'Goal Reached! 🎉' : 'Target Tercapai! 🎉', color: '#22c55e', level: 'excellent' };
    }
    if (progressPercent >= 75) {
        return { label: isEn ? 'Almost There' : 'Hampir Tercapai', color: '#14b8a6', level: 'good' };
    }
    if (progressPercent >= 50) {
        return { label: isEn ? 'Doing Good' : 'Cukup Baik', color: '#f59e0b', level: 'moderate' };
    }
    if (progressPercent >= 25) {
        return { label: isEn ? 'Need to Drink More' : 'Perlu Minum Lebih Banyak', color: '#f97066', level: 'low' };
    }
    return { label: isEn ? 'Critically Low!' : 'Sangat Kurang!', color: '#ef4444', level: 'critical' };
}
