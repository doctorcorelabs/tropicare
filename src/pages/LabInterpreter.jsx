import React, { useState, useEffect } from 'react';
import {
    FlaskConical, Plus, TrendingUp, TrendingDown,
    AlertTriangle, CheckCircle, Calendar, Trash2, Info
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import './LabInterpreter.css';

const NORMAL_RANGES = {
    hematokrit: { min: 36, max: 44, unit: '%', label: 'Hematokrit', color: '#f97066' },
    trombosit: { min: 150, max: 400, unit: '×10³/µL', label: 'Trombosit', color: '#38bdf8' },
};

function interpretNS1(value, t) {
    if (value === 'positive') {
        return { status: 'danger', message: t('lab.ns1Pos') };
    }
    return { status: 'success', message: t('lab.ns1Neg') };
}

function interpretIgM(value, t) {
    if (value === 'positive') {
        return { status: 'warning', message: t('lab.igmPos') };
    }
    return { status: 'success', message: t('lab.igmNeg') };
}

function interpretIgG(value, t) {
    if (value === 'positive') {
        return { status: 'warning', message: t('lab.iggPos') };
    }
    return { status: 'success', message: t('lab.iggNeg') };
}

function interpretHematokrit(value, prevValue, t, lang) {
    const result = { value, status: 'success', message: '' };
    if (value > 44) {
        result.status = 'danger';
        result.message = t('lab.htHigh').replace('{x}', value);
    } else if (value < 36) {
        result.status = 'warning';
        result.message = t('lab.htLow').replace('{x}', value);
    } else {
        result.message = t('lab.htNormal').replace('{x}', value);
    }
    if (prevValue && value > prevValue) {
        const increase = ((value - prevValue) / prevValue * 100).toFixed(1);
        if (parseFloat(increase) >= 20) {
            result.status = 'danger';
            result.message += ` ⚠️ ${lang === 'en' ? 'UP' : 'NAIK'} ${increase}% — ${t('lab.plasmaLeak')}`;
        }
    }
    return result;
}

function interpretTrombosit(value, t) {
    const result = { value, status: 'success', message: '' };
    if (value < 50) {
        result.status = 'danger';
        result.message = t('lab.pltCritical').replace('{x}', value);
    } else if (value < 100) {
        result.status = 'danger';
        result.message = t('lab.pltLow').replace('{x}', value);
    } else if (value < 150) {
        result.status = 'warning';
        result.message = t('lab.pltWarning').replace('{x}', value);
    } else {
        result.message = t('lab.pltNormal').replace('{x}', value);
    }
    return result;
}

const LabTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="chart-tooltip">
                <div className="tooltip-header">{payload[0]?.payload?.name}</div>
                {payload.map((p, i) => (
                    <div key={i} style={{ color: p.color }}>
                        {p.name}: <strong>{p.value}</strong>
                        {p.name === 'Hematokrit' ? '%' : '×10³'}
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function LabInterpreter() {
    const { t, language } = useLanguage();
    const { user } = useAuth();

    // Default mock data for guest mode
    const [entries, setEntries] = useState([
        { day: 1, date: '2026-03-01', hematokrit: 42, trombosit: 180, ns1: 'positive', igm: 'negative', igg: 'negative' },
        { day: 2, date: '2026-03-02', hematokrit: 44, trombosit: 140, ns1: '', igm: 'negative', igg: 'negative' },
        { day: 3, date: '2026-03-03', hematokrit: 47, trombosit: 95, ns1: '', igm: 'positive', igg: 'negative' },
    ]);

    const [newEntry, setNewEntry] = useState({
        date: '', hematokrit: '', trombosit: '', ns1: '', igm: '', igg: '',
    });

    // Fetch from Supabase
    useEffect(() => {
        async function loadEntries() {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('lab_results')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('day', { ascending: true });

                if (error) throw error;
                if (data && data.length > 0) {
                    setEntries(data.map(d => ({
                        id: d.id, // Supabase UUID
                        day: d.day,
                        date: d.created_at.slice(0, 10), // Simplification
                        hematokrit: d.hematokrit,
                        trombosit: d.trombosit,
                        ns1: d.ns1,
                        igm: d.igm,
                        igg: d.igg
                    })));
                } else if (data && data.length === 0) {
                    setEntries([]);
                }
            } catch (err) {
                console.error("Error loading lab results:", err);
            }
        }
        loadEntries();
    }, [user]);

    async function addEntry() {
        if (!newEntry.hematokrit && !newEntry.trombosit) return;
        const day = entries.length + 1;
        const date = newEntry.date || new Date().toISOString().slice(0, 10);

        const hematokrit = newEntry.hematokrit ? parseFloat(newEntry.hematokrit) : null;
        const trombosit = newEntry.trombosit ? parseInt(newEntry.trombosit) : null;

        const entryObj = {
            day, date, hematokrit, trombosit,
            ns1: newEntry.ns1, igm: newEntry.igm, igg: newEntry.igg
        };

        if (user) {
            try {
                const { data, error } = await supabase
                    .from('lab_results')
                    .insert([{
                        user_id: user.id,
                        day: day,
                        hematokrit: hematokrit,
                        trombosit: trombosit,
                        ns1: newEntry.ns1 || null,
                        igm: newEntry.igm || null,
                        igg: newEntry.igg || null,
                    }])
                    .select();

                if (error) throw error;
                if (data) entryObj.id = data[0].id;
            } catch (err) {
                console.error("Error saving lab result:", err);
            }
        }

        setEntries([...entries, entryObj]);
        setNewEntry({ date: '', hematokrit: '', trombosit: '', ns1: '', igm: '', igg: '' });
    }

    async function removeEntry(index) {
        const entryToRemove = entries[index];
        if (user && entryToRemove.id) {
            try {
                await supabase.from('lab_results').delete().eq('id', entryToRemove.id);
            } catch (err) {
                console.error("Error deleting lab result:", err);
            }
        }

        const updated = entries.filter((_, i) => i !== index).map((e, i) => ({ ...e, day: i + 1 }));
        setEntries(updated);
    }

    const chartData = entries.map(e => ({
        name: `${t('fever.dayNumber')}${e.day}`,
        hematokrit: e.hematokrit,
        trombosit: e.trombosit,
    }));

    // Get latest interpretations
    const latest = entries[entries.length - 1];
    const prev = entries.length >= 2 ? entries[entries.length - 2] : null;
    const interpretations = latest ? [
        latest.ns1 ? interpretNS1(latest.ns1, t) : null,
        latest.igm ? interpretIgM(latest.igm, t) : null,
        latest.igg ? interpretIgG(latest.igg, t) : null,
        latest.hematokrit ? interpretHematokrit(latest.hematokrit, prev?.hematokrit, t, language) : null,
        latest.trombosit !== null ? interpretTrombosit(latest.trombosit, t) : null,
    ].filter(Boolean) : [];

    return (
        <div className="lab-interpreter">
            {/* Header */}
            <div className="page-header">
                <div className="page-header-icon" style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}>
                    <FlaskConical size={28} color="white" />
                </div>
                <div>
                    <h1 className="page-title">{t('lab.title')}</h1>
                    <p className="page-subtitle">{t('lab.subtitle')}</p>
                </div>
            </div>

            <div className="lab-grid">
                {/* Chart + Interpretation */}
                <div className="lab-left">
                    {/* Trend Charts */}
                    <div className="chart-card card-static">
                        <h2 className="section-label">
                            <TrendingUp size={18} />
                            {t('lab.chartTitle')}
                        </h2>

                        {chartData.length > 0 ? (
                            <div className="charts-container">
                                {/* Hematokrit Chart */}
                                <div className="mini-chart">
                                    <h3 className="mini-chart-title" style={{ color: '#f97066' }}>{language === 'en' ? 'Hematocrit' : 'Hematokrit'} (%)</h3>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                            <XAxis dataKey="name" stroke="var(--color-text-muted)" tick={{ fontSize: 11 }} />
                                            <YAxis domain={[30, 55]} stroke="var(--color-text-muted)" tick={{ fontSize: 11 }} />
                                            <Tooltip content={<LabTooltip />} />
                                            <ReferenceLine y={44} stroke="#ef4444" strokeDasharray="5 5" label={{ value: language === 'en' ? 'Upper Limit' : 'Batas Atas', fill: '#ef4444', fontSize: 10 }} />
                                            <ReferenceLine y={36} stroke="#22c55e" strokeDasharray="5 5" label={{ value: language === 'en' ? 'Lower Limit' : 'Batas Bawah', fill: '#22c55e', fontSize: 10 }} />
                                            <Line
                                                type="monotone"
                                                dataKey="hematokrit"
                                                stroke="#f97066"
                                                strokeWidth={3}
                                                dot={{ fill: '#f97066', r: 5 }}
                                                name="Hematokrit"
                                                connectNulls
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Trombosit Chart */}
                                <div className="mini-chart">
                                    <h3 className="mini-chart-title" style={{ color: '#38bdf8' }}>{language === 'en' ? 'Platelets' : 'Trombosit'} (×10³/µL)</h3>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                            <XAxis dataKey="name" stroke="var(--color-text-muted)" tick={{ fontSize: 11 }} />
                                            <YAxis domain={[0, 400]} stroke="var(--color-text-muted)" tick={{ fontSize: 11 }} />
                                            <Tooltip content={<LabTooltip />} />
                                            <ReferenceLine y={150} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: language === 'en' ? 'Lower Normal Limit' : 'Batas Bawah Normal', fill: '#f59e0b', fontSize: 10 }} />
                                            <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="5 5" label={{ value: language === 'en' ? '< 100 = Danger' : '< 100 = Bahaya', fill: '#ef4444', fontSize: 10 }} />
                                            <Line
                                                type="monotone"
                                                dataKey="trombosit"
                                                stroke="#38bdf8"
                                                strokeWidth={3}
                                                dot={{ fill: '#38bdf8', r: 5 }}
                                                name="Trombosit"
                                                connectNulls
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ) : (
                            <div className="chart-empty">
                                <FlaskConical size={48} style={{ opacity: 0.2 }} />
                                <p>{t('lab.noData')}</p>
                            </div>
                        )}
                    </div>

                    {/* Interpretations */}
                    {interpretations.length > 0 && (
                        <div className="interp-card card-static">
                            <h2 className="section-label">
                                <Info size={18} />
                                {t('lab.latestInterp')} ({t('fever.dayNumber')}{latest.day})
                            </h2>

                            <div className="interp-list">
                                {interpretations.map((interp, i) => (
                                    <div key={i} className={`interp-item interp-${interp.status}`}>
                                        {interp.status === 'danger' && <AlertTriangle size={18} />}
                                        {interp.status === 'warning' && <AlertTriangle size={18} />}
                                        {interp.status === 'success' && <CheckCircle size={18} />}
                                        <p>{interp.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel - Input & History */}
                <div className="lab-right">
                    {/* Add Entry Form */}
                    <div className="add-lab card-static">
                        <h2 className="section-label">
                            <Plus size={18} />
                            {t('lab.addEntry')}{entries.length + 1}
                        </h2>

                        <div className="lab-form">
                            <div className="form-field">
                                <label className="input-label">{t('common.date')}</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={newEntry.date}
                                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                                    id="lab-date"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-field">
                                    <label className="input-label">{language === 'en' ? 'Hematocrit (%)' : 'Hematokrit (%)'}</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder={`${language === 'en' ? 'Example' : 'Contoh'}: 42`}
                                        value={newEntry.hematokrit}
                                        onChange={(e) => setNewEntry({ ...newEntry, hematokrit: e.target.value })}
                                        step="0.1"
                                        id="lab-hematokrit"
                                    />
                                </div>
                                <div className="form-field">
                                    <label className="input-label">{language === 'en' ? 'Platelets' : 'Trombosit'} (×10³)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder={`${language === 'en' ? 'Example' : 'Contoh'}: 150`}
                                        value={newEntry.trombosit}
                                        onChange={(e) => setNewEntry({ ...newEntry, trombosit: e.target.value })}
                                        id="lab-trombosit"
                                    />
                                </div>
                            </div>

                            <div className="serologi-section">
                                <h3 className="serologi-title">Serologi</h3>
                                <div className="serologi-grid">
                                    {[
                                        { key: 'ns1', label: 'NS1 Antigen' },
                                        { key: 'igm', label: 'IgM Anti-Dengue' },
                                        { key: 'igg', label: 'IgG Anti-Dengue' },
                                    ].map(({ key, label }) => (
                                        <div key={key} className="serologi-item">
                                            <span className="serologi-label">{label}</span>
                                            <div className="serologi-buttons">
                                                <button
                                                    className={`sero-btn ${newEntry[key] === 'positive' ? 'sero-positive' : ''}`}
                                                    onClick={() => setNewEntry({ ...newEntry, [key]: 'positive' })}
                                                >
                                                    (+)
                                                </button>
                                                <button
                                                    className={`sero-btn ${newEntry[key] === 'negative' ? 'sero-negative' : ''}`}
                                                    onClick={() => setNewEntry({ ...newEntry, [key]: 'negative' })}
                                                >
                                                    (-)
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button className="btn btn-primary" onClick={addEntry} id="add-lab">
                                <Plus size={16} />
                                {t('lab.save')}
                            </button>
                        </div>
                    </div>

                    {/* History */}
                    <div className="lab-history card-static">
                        <h2 className="section-label">
                            <Calendar size={18} />
                            {t('lab.history')}
                        </h2>

                        <div className="history-list">
                            {entries.map((entry, i) => (
                                <div key={i} className="history-item">
                                    <div className="history-header">
                                        <span className="history-day">{t('fever.dayNumber')}{entry.day}</span>
                                        <span className="history-date">{entry.date}</span>
                                        <button className="btn btn-ghost btn-sm" onClick={() => removeEntry(i)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="history-values">
                                        {entry.hematokrit && (
                                            <span className={`hv ${entry.hematokrit > 44 ? 'hv-danger' : 'hv-ok'}`}>
                                                Ht: {entry.hematokrit}%
                                            </span>
                                        )}
                                        {entry.trombosit !== null && (
                                            <span className={`hv ${entry.trombosit < 100 ? 'hv-danger' : entry.trombosit < 150 ? 'hv-warn' : 'hv-ok'}`}>
                                                Plt: {entry.trombosit}×10³
                                            </span>
                                        )}
                                        {entry.ns1 === 'positive' && <span className="hv hv-danger">NS1(+)</span>}
                                        {entry.igm === 'positive' && <span className="hv hv-warn">IgM(+)</span>}
                                        {entry.igg === 'positive' && <span className="hv hv-warn">IgG(+)</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
