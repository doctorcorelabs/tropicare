import React, { useState, useEffect, useRef } from 'react';
import { Droplets, Plus, Calculator, Clock, Info, GlassWater, Trash2 } from 'lucide-react';
import {
    calculateDailyFluid, FLUID_OPTIONS, ORS_RECIPE,
    calculateProgress, getHydrationStatus
} from '../utils/hydrationCalc';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import './HydrationManager.css';

export default function HydrationManager() {
    const { t, language } = useLanguage();
    const [weight, setWeight] = useState(60);
    const fluidGoal = weight > 0 ? calculateDailyFluid(weight) : null;
    const [intakes, setIntakes] = useState([]);
    const [selectedFluid, setSelectedFluid] = useState('water');
    const [customAmount, setCustomAmount] = useState('');
    const [showORS, setShowORS] = useState(false);
    const [reminder, setReminder] = useState(null);
    const reminderRef = useRef(null);
    const { user } = useAuth();

    function getIconForFluid(name) {
        const option = FLUID_OPTIONS.find(f => f.id === name.toLowerCase());
        return option ? option.icon : '💧';
    }

    // Fetch from Supabase
    useEffect(() => {
        async function loadIntakes() {
            if (!user) return;
            try {
                const today = new Date().toISOString().split('T')[0];
                const { data, error } = await supabase
                    .from('hydration_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('date', today);

                if (error) throw error;
                if (data) {
                    const loaded = data.map(d => ({
                        id: d.id,
                        fluid: d.fluid_type,
                        icon: getIconForFluid(d.fluid_type) || '💧',
                        amount: d.amount_ml,
                        time: new Date(`${d.date}T${d.time}`)
                    }));
                    setIntakes(loaded);
                }
            } catch (err) {
                console.error('Error loading hydration:', err);
            }
        }
        loadIntakes();
    }, [user]);

    // Reminder timer
    useEffect(() => {
        if (fluidGoal) {
            reminderRef.current = setInterval(() => {
                setReminder({
                    message: `⏰ ${t('hydration.drinkReminderDesc').replace('200ml', `${fluidGoal.oralPerSession} ml`)}`,
                    time: new Date(),
                });
                setTimeout(() => setReminder(null), 8000);
            }, 120000); // every 2 minutes for demo (120s), real would be 7200000 for 2 hours

            return () => clearInterval(reminderRef.current);
        }
    }, [fluidGoal, t]);

    const totalIntake = intakes.reduce((sum, i) => sum + i.amount, 0);
    const targetMl = fluidGoal?.withDeficit || 2000;
    const progress = calculateProgress(totalIntake, targetMl);
    const status = getHydrationStatus(progress, language);

    async function addIntake() {
        const fluid = FLUID_OPTIONS.find(f => f.id === selectedFluid);
        const amount = customAmount ? parseInt(customAmount) : fluid.mlPerGlass;
        if (isNaN(amount) || amount <= 0) return;

        const newEntry = {
            fluid: t(fluid.labelKey),
            icon: fluid.icon,
            amount,
            time: new Date(),
        };

        if (user) {
            try {
                const date = newEntry.time.toISOString().split('T')[0];
                const timeStr = newEntry.time.toTimeString().split(' ')[0];

                const { data, error } = await supabase
                    .from('hydration_logs')
                    .insert([{
                        user_id: user.id,
                        fluid_type: fluid.id,
                        amount_ml: amount,
                        date,
                        time: timeStr
                    }])
                    .select();

                if (error) throw error;
                if (data) newEntry.id = data[0].id; // Store db id for deletion
            } catch (err) {
                console.error("Error saving hydration:", err);
            }
        }

        setIntakes([...intakes, newEntry]);
        setCustomAmount('');
    }

    async function removeIntake(index) {
        const intake = intakes[index];
        if (user && intake.id) {
            try {
                await supabase.from('hydration_logs').delete().eq('id', intake.id);
            } catch (err) {
                console.error("Error deleting hydration:", err);
            }
        }
        setIntakes(intakes.filter((_, i) => i !== index));
    }

    return (
        <div className="hydration-manager">
            {/* Header */}
            <div className="page-header">
                <div className="page-header-icon" style={{ background: 'linear-gradient(135deg, #38bdf8, #0284c7)' }}>
                    <Droplets size={28} color="white" />
                </div>
                <div>
                    <h1 className="page-title">{t('hydration.title')}</h1>
                    <p className="page-subtitle">{t('hydration.subtitle')}</p>
                </div>
            </div>

            {/* Reminder Toast */}
            {reminder && (
                <div className="reminder-toast animate-fadeInDown">
                    <GlassWater size={20} />
                    <span>{reminder.message}</span>
                </div>
            )}

            <div className="hydration-grid">
                {/* Left Column - Calculator & Progress */}
                <div className="hydration-left">
                    {/* Weight Calculator */}
                    <div className="calc-card card-static">
                        <h2 className="section-label">
                            <Calculator size={18} />
                            {t('hydration.calcTitle')}
                        </h2>

                        <div className="weight-input-group">
                            <label className="input-label">{t('hydration.weight')}</label>
                            <div className="weight-slider-row">
                                <input
                                    type="range"
                                    min="5"
                                    max="120"
                                    value={weight}
                                    onChange={(e) => setWeight(parseInt(e.target.value))}
                                    className="weight-slider"
                                    id="weight-slider"
                                />
                                <div className="weight-display">{weight} kg</div>
                            </div>
                        </div>

                        {fluidGoal && (
                            <div className="fluid-results">
                                <div className="fluid-result-item">
                                    <span className="result-label">{t('hydration.maintenance')}</span>
                                    <span className="result-value">{fluidGoal.maintenance} {t('hydration.perDay')}</span>
                                </div>
                                <div className="fluid-result-item highlight">
                                    <span className="result-label">{t('hydration.deficit')}</span>
                                    <span className="result-value">{fluidGoal.withDeficit} {t('hydration.perDay')}</span>
                                </div>
                                <div className="fluid-result-item">
                                    <span className="result-label">{language === 'en' ? 'Per Hour' : 'Per Jam'}</span>
                                    <span className="result-value">{fluidGoal.perHourWithDeficit} {t('hydration.perHour')}</span>
                                </div>
                                <div className="fluid-result-item">
                                    <span className="result-label">{language === 'en' ? 'Per 2 Hours (Oral)' : 'Per 2 Jam (Oral)'}</span>
                                    <span className="result-value">{fluidGoal.oralPerSession} ml</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Progress Ring */}
                    <div className="progress-card card-static">
                        <div className="progress-visual">
                            <div className="progress-ring-container">
                                <svg className="progress-ring" viewBox="0 0 140 140">
                                    <circle
                                        cx="70" cy="70" r="60"
                                        fill="none"
                                        stroke="var(--color-border)"
                                        strokeWidth="10"
                                    />
                                    <circle
                                        cx="70" cy="70" r="60"
                                        fill="none"
                                        stroke={status.color}
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        strokeDasharray={`${progress * 3.77} 377`}
                                        transform="rotate(-90 70 70)"
                                        style={{ transition: 'stroke-dasharray 0.5s ease' }}
                                    />
                                </svg>
                                <div className="progress-center">
                                    <span className="progress-percent" style={{ color: status.color }}>{progress}%</span>
                                    <span className="progress-label">{status.label}</span>
                                </div>
                            </div>
                        </div>

                        <div className="progress-stats">
                            <div className="progress-stat">
                                <span className="progress-stat-value" style={{ color: 'var(--color-sky)' }}>{totalIntake} ml</span>
                                <span className="progress-stat-label">{language === 'en' ? 'Consumed' : 'Diminum'}</span>
                            </div>
                            <div className="progress-stat">
                                <span className="progress-stat-value">{targetMl} ml</span>
                                <span className="progress-stat-label">{language === 'en' ? 'Target' : 'Target'}</span>
                            </div>
                            <div className="progress-stat">
                                <span className="progress-stat-value" style={{ color: Math.max(targetMl - totalIntake, 0) > 0 ? 'var(--color-coral)' : 'var(--color-success)' }}>
                                    {Math.max(targetMl - totalIntake, 0)} ml
                                </span>
                                <span className="progress-stat-label">{language === 'en' ? 'Remaining' : 'Sisa'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Add Intake & Log */}
                <div className="hydration-right">
                    {/* Add Intake */}
                    <div className="intake-card card-static">
                        <h2 className="section-label">
                            <Plus size={18} />
                            {t('hydration.addDrink')}
                        </h2>

                        <div className="fluid-type-grid">
                            {FLUID_OPTIONS.map((fluid) => (
                                <button
                                    key={fluid.id}
                                    className={`fluid-type-btn ${selectedFluid === fluid.id ? 'fluid-selected' : ''}`}
                                    onClick={() => setSelectedFluid(fluid.id)}
                                    id={`fluid-${fluid.id}`}
                                >
                                    <span className="fluid-emoji">{fluid.icon}</span>
                                    <span className="fluid-name">{t(fluid.labelKey)}</span>
                                    <span className="fluid-ml">{fluid.mlPerGlass} ml</span>
                                </button>
                            ))}
                        </div>

                        <div className="intake-actions">
                            <div className="form-field">
                                <label className="input-label">{t('hydration.amount')} — {t('common.optional')}</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder={`Default: ${FLUID_OPTIONS.find(f => f.id === selectedFluid)?.mlPerGlass} ml`}
                                    value={customAmount}
                                    onChange={(e) => setCustomAmount(e.target.value)}
                                    id="custom-amount"
                                />
                            </div>
                            <button className="btn btn-primary" onClick={addIntake} id="add-intake">
                                <Plus size={16} />
                                {t('common.add')}
                            </button>
                        </div>
                    </div>

                    {/* Intake Log */}
                    <div className="intake-log card-static">
                        <h2 className="section-label">
                            <Clock size={18} />
                            {t('hydration.history')}
                        </h2>

                        {intakes.length === 0 ? (
                            <div className="log-empty">
                                <Droplets size={32} style={{ opacity: 0.3 }} />
                                <p>{t('hydration.noHistory')}</p>
                            </div>
                        ) : (
                            <div className="intake-list">
                                {intakes.map((intake, i) => (
                                    <div key={i} className="intake-item animate-fadeInUp">
                                        <span className="intake-emoji">{intake.icon}</span>
                                        <div className="intake-info">
                                            <span className="intake-name">{intake.fluid}</span>
                                            <span className="intake-time">
                                                {intake.time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <span className="intake-amount">+{intake.amount} ml</span>
                                        <button className="btn btn-ghost btn-sm" onClick={() => removeIntake(i)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="ors-card card-static">
                        <button className="ors-toggle" onClick={() => setShowORS(!showORS)} id="ors-toggle">
                            <Info size={18} style={{ color: 'var(--color-primary)' }} />
                            <span>{t('hydration.orsRecipe')}</span>
                        </button>

                        {showORS && (
                            <div className="ors-content animate-fadeInUp">
                                <ol className="ors-steps">
                                    <li>{t('hydration.ors1')}</li>
                                    <li>{t('hydration.ors2')}</li>
                                    <li>{t('hydration.ors3')}</li>
                                    <li>{t('hydration.ors4')}</li>
                                </ol>
                                <p className="ors-note">📝 {language === 'en' ? 'Equal to standard WHO ORS. Keep refrigerated and discard after 24 hours.' : ORS_RECIPE.note}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
