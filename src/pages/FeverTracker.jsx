import React, { useState } from 'react';
import {
    Thermometer, Plus, Trash2, AlertTriangle, Info,
    TrendingUp, Calendar
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ReferenceLine, ReferenceArea, ResponsiveContainer, Legend, Area, ComposedChart
} from 'recharts';
import './FeverTracker.css';

import { useLanguage } from '../context/LanguageContext';

const getPhaseInfo = (t) => [
    {
        phase: t('fever.febrileName'),
        color: '#f59e0b',
        description: t('fever.febrileDesc'),
    },
    {
        phase: t('fever.criticalName'),
        color: '#ef4444',
        description: t('fever.criticalDesc'),
    },
    {
        phase: t('fever.recoveryName'),
        color: '#22c55e',
        description: t('fever.recoveryDesc'),
    },
];

function getPhaseForDay(day, t) {
    if (day <= 3) return { name: t('fever.febrilePhase').replace('Fase: ', '').replace('Phase: ', ''), color: '#f59e0b', index: 0 };
    if (day <= 6) return { name: t('fever.criticalPhase').replace('Fase: ', '').replace('Phase: ', ''), color: '#ef4444', index: 1 };
    return { name: t('fever.recoveryPhase').replace('Fase: ', '').replace('Phase: ', ''), color: '#22c55e', index: 2 };
}

const FeverTooltip = ({ active, payload, t }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const phase = getPhaseForDay(data.day, t);
        return (
            <div className="chart-tooltip">
                <div className="tooltip-header">{data.dayLabel}</div>
                <div className="tooltip-temp" style={{ color: data.temp >= 38 ? '#f97066' : '#22c55e' }}>
                    {data.temp}°C
                </div>
                <div className="tooltip-phase" style={{ color: phase.color }}>
                    {t('fever.phase')}: {phase.name}
                </div>
                <div className="tooltip-date">{data.date} {data.time}</div>
            </div>
        );
    }
    return null;
};

export default function FeverTracker() {
    const { t, language } = useLanguage();
    const [entries, setEntries] = useState([
        { day: 1, temp: 39.2, date: '2026-03-01', time: '08:00' },
        { day: 2, temp: 39.5, date: '2026-03-02', time: '08:00' },
        { day: 3, temp: 39.0, date: '2026-03-03', time: '08:00' },
    ]);
    const [newTemp, setNewTemp] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('08:00');

    function addEntry() {
        if (!newTemp || isNaN(parseFloat(newTemp))) return;
        const temp = parseFloat(newTemp);
        const day = entries.length + 1;
        const date = newDate || new Date().toISOString().slice(0, 10);
        setEntries([...entries, { day, temp, date, time: newTime }]);
        setNewTemp('');
        setNewDate('');
        setNewTime('08:00');
    }

    function removeEntry(index) {
        const updated = entries.filter((_, i) => i !== index)
            .map((e, i) => ({ ...e, day: i + 1 }));
        setEntries(updated);
    }

    const chartData = entries.map(e => ({
        ...e,
        dayLabel: `${t('fever.dayNumber')}${e.day}`,
        normal: 37.0,
    }));

    const latestDay = entries.length > 0 ? entries[entries.length - 1].day : 0;
    const currentPhase = getPhaseForDay(latestDay, t);
    const isCritical = currentPhase.index === 1;

    return (
        <div className="fever-tracker">
            {/* Header */}
            <div className="page-header">
                <div className="page-header-icon" style={{ background: 'linear-gradient(135deg, #f97066, #dc2626)' }}>
                    <Thermometer size={28} color="white" />
                </div>
                <div>
                    <h1 className="page-title">{t('fever.title')}</h1>
                    <p className="page-subtitle">{t('fever.subtitle')}</p>
                </div>
            </div>

            {/* Critical Warning */}
            {isCritical && (
                <div className="critical-banner animate-fadeInDown">
                    <AlertTriangle size={24} />
                    <div>
                        <strong>⚠️ {t('fever.criticalName')}</strong>
                        <p>{t('fever.criticalWarning')}</p>
                    </div>
                </div>
            )}

            <div className="tracker-grid">
                {/* Chart Section */}
                <div className="chart-section card-static">
                    <h2 className="section-label">
                        <TrendingUp size={18} />
                        {t('fever.chartTitle')}
                    </h2>

                    {chartData.length > 0 ? (
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={350}>
                                <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                    <XAxis
                                        dataKey="dayLabel"
                                        stroke="var(--color-text-muted)"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        domain={[35, 41]}
                                        stroke="var(--color-text-muted)"
                                        tick={{ fontSize: 12 }}
                                        label={{ value: '°C', position: 'insideTopLeft', fill: 'var(--color-text-muted)' }}
                                    />
                                    <Tooltip content={<FeverTooltip t={t} />} />

                                    {/* Phase zones */}
                                    <ReferenceArea x1={`${t('fever.dayNumber')}1`} x2={`${t('fever.dayNumber')}3`} fill="#f59e0b" fillOpacity={0.05} />
                                    <ReferenceArea x1={`${t('fever.dayNumber')}4`} x2={`${t('fever.dayNumber')}6`} fill="#ef4444" fillOpacity={0.08} />
                                    <ReferenceArea x1={`${t('fever.dayNumber')}7`} x2={`${t('fever.dayNumber')}10`} fill="#22c55e" fillOpacity={0.05} />

                                    {/* Normal temp line */}
                                    <ReferenceLine y={37} stroke="#22c55e" strokeDasharray="5 5" label={{ value: `37°C ${language === 'en' ? 'Normal' : 'Normal'}`, fill: '#22c55e', fontSize: 11 }} />
                                    <ReferenceLine y={38} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `38°C ${language === 'en' ? 'Fever' : 'Demam'}`, fill: '#f59e0b', fontSize: 11 }} />

                                    <Line
                                        type="monotone"
                                        dataKey="temp"
                                        stroke="#f97066"
                                        strokeWidth={3}
                                        dot={{ fill: '#f97066', r: 6, strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 8, fill: '#ef4444' }}
                                        name="Suhu (°C)"
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="chart-empty">
                            <Thermometer size={48} className="empty-icon" />
                            <p>{t('fever.noDataStatus')}</p>
                        </div>
                    )}

                    {/* Phase Legend */}
                    <div className="phase-legend">
                        <div className="legend-item">
                            <div className="legend-dot" style={{ background: '#f59e0b' }} />
                            <span>{t('fever.febrilePhase').replace('Fase: ', '').replace('Phase: ', '')} (1-3)</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-dot" style={{ background: '#ef4444' }} />
                            <span>{t('fever.criticalPhase').replace('Fase: ', '').replace('Phase: ', '')} (4-6)</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-dot" style={{ background: '#22c55e' }} />
                            <span>{t('fever.recoveryPhase').replace('Fase: ', '').replace('Phase: ', '')} (7+)</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="right-panel">
                    {/* Add Entry */}
                    <div className="add-entry card-static">
                        <h2 className="section-label">
                            <Plus size={18} />
                            {t('fever.addTemp')}
                        </h2>

                        <div className="entry-form">
                            <div className="form-field">
                                <label className="input-label">{t('fever.temp')}</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder={t('fever.tempEg')}
                                    value={newTemp}
                                    onChange={(e) => setNewTemp(e.target.value)}
                                    step="0.1"
                                    min="35"
                                    max="42"
                                    id="temp-input"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-field">
                                    <label className="input-label">{t('common.date')}</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        id="date-input"
                                    />
                                </div>
                                <div className="form-field">
                                    <label className="input-label">{t('common.time')}</label>
                                    <input
                                        type="time"
                                        className="input"
                                        value={newTime}
                                        onChange={(e) => setNewTime(e.target.value)}
                                        id="time-input"
                                    />
                                </div>
                            </div>
                            <button className="btn btn-primary" onClick={addEntry} id="add-temp">
                                <Plus size={16} />
                                {t('fever.addByDay')}{entries.length + 1}
                            </button>
                        </div>
                    </div>

                    {/* Current Status */}
                    {entries.length > 0 && (
                        <div className="status-card card-static" style={{ borderLeft: `4px solid ${currentPhase.color}` }}>
                            <div className="status-header">
                                <Calendar size={18} />
                                <span>{t('fever.currentStatus')}</span>
                            </div>
                            <div className="status-day" style={{ color: currentPhase.color }}>
                                {t('fever.dayNumber')}{latestDay}
                            </div>
                            <div className="status-phase" style={{ color: currentPhase.color }}>
                                {t('fever.phase')}: {currentPhase.name}
                            </div>
                            <div className="status-temp">
                                {t('fever.lastTemp')}: {entries[entries.length - 1].temp}°C
                            </div>
                        </div>
                    )}

                    {/* Entry Log */}
                    <div className="entry-log card-static">
                        <h2 className="section-label">
                            <Calendar size={18} />
                            {t('fever.log')}
                        </h2>
                        <div className="log-list">
                            {entries.map((entry, i) => {
                                const phase = getPhaseForDay(entry.day, t);
                                return (
                                    <div key={i} className="log-item" style={{ borderLeft: `3px solid ${phase.color}` }}>
                                        <div className="log-info">
                                            <span className="log-day">{t('fever.dayNumber')}{entry.day}</span>
                                            <span className="log-temp" style={{ color: entry.temp >= 38 ? '#f97066' : '#22c55e' }}>
                                                {entry.temp}°C
                                            </span>
                                        </div>
                                        <div className="log-meta">
                                            <span>{entry.date} {entry.time}</span>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => removeEntry(i)}
                                                aria-label="Remove entry"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Phase Info Cards */}
            <div className="phase-info-grid">
                {getPhaseInfo(t).map((phase, i) => (
                    <div key={i} className="phase-info-card card-static" style={{ borderTop: `3px solid ${phase.color}` }}>
                        <div className="phase-info-header" style={{ color: phase.color }}>
                            <Info size={16} />
                            <span>{phase.phase}</span>
                        </div>
                        <p className="phase-info-desc">{phase.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
