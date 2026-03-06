import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Map as MapIcon, AlertTriangle, BarChart3, Filter } from 'lucide-react';
import { dengueData, riskColors, riskLabels, nationalStats } from '../data/indonesiaProvinces';
import { useLanguage } from '../context/LanguageContext';
import 'leaflet/dist/leaflet.css';
import './DengueMap.css';

function getCircleRadius(cases) {
    if (cases >= 10000) return 25;
    if (cases >= 5000) return 20;
    if (cases >= 2000) return 15;
    if (cases >= 1000) return 12;
    return 8;
}

export default function DengueMap() {
    const { t, language } = useLanguage();
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [riskFilter, setRiskFilter] = useState('all');

    const filteredData = riskFilter === 'all'
        ? dengueData
        : dengueData.filter(d => d.risk === riskFilter);

    const sortedByRisk = [...dengueData].sort((a, b) => b.cases - a.cases);

    return (
        <div className="dengue-map-page">
            {/* Header */}
            <div className="page-header">
                <div className="page-header-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    <MapIcon size={28} color="white" />
                </div>
                <div>
                    <h1 className="page-title">{t('map.title')}</h1>
                    <p className="page-subtitle">{t('map.subtitle')} {nationalStats.year}</p>
                </div>
            </div>

            {/* National Stats */}
            <div className="national-stats">
                <div className="nat-stat">
                    <span className="nat-stat-value">{nationalStats.totalCases.toLocaleString('id-ID')}</span>
                    <span className="nat-stat-label">{t('map.totalCases')}</span>
                </div>
                <div className="nat-stat">
                    <span className="nat-stat-value">{nationalStats.totalDeaths}</span>
                    <span className="nat-stat-label">{t('map.deaths')}</span>
                </div>
                <div className="nat-stat">
                    <span className="nat-stat-value">{nationalStats.cfr}%</span>
                    <span className="nat-stat-label">{t('map.cfr')}</span>
                </div>
                <div className="nat-stat">
                    <span className="nat-stat-value">{nationalStats.highestProvince}</span>
                    <span className="nat-stat-label">{t('map.highest')}</span>
                </div>
            </div>

            <div className="map-layout">
                {/* Map */}
                <div className="map-container card-static">
                    {/* Filter Bar */}
                    <div className="map-filter-bar">
                        <div className="filter-group">
                            <Filter size={16} />
                            <span>{t('map.filterRisk')}:</span>
                        </div>
                        <div className="filter-buttons">
                            <button
                                className={`filter-btn ${riskFilter === 'all' ? 'filter-active' : ''}`}
                                onClick={() => setRiskFilter('all')}
                            >
                                {t('map.all')}
                            </button>
                            {Object.entries(riskLabels).map(([key, label]) => (
                                <button
                                    key={key}
                                    className={`filter-btn ${riskFilter === key ? 'filter-active' : ''}`}
                                    onClick={() => setRiskFilter(key)}
                                    style={riskFilter === key ? { borderColor: riskColors[key], color: riskColors[key] } : {}}
                                >
                                    <div className="filter-dot" style={{ background: riskColors[key] }} />
                                    {language === 'en' ? (key === 'very_high' ? 'Very High' : key === 'high' ? 'High' : key === 'medium' ? 'Medium' : 'Low') : label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="leaflet-wrapper">
                        <MapContainer
                            center={[-2.5, 118]}
                            zoom={5}
                            scrollWheelZoom={true}
                            style={{ height: '100%', width: '100%' }}
                            id="dengue-map"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />

                            {filteredData.map((province) => (
                                <CircleMarker
                                    key={province.province}
                                    center={[province.lat, province.lng]}
                                    radius={getCircleRadius(province.cases)}
                                    pathOptions={{
                                        fillColor: riskColors[province.risk],
                                        fillOpacity: 0.6,
                                        color: riskColors[province.risk],
                                        weight: 2,
                                        opacity: 0.8,
                                    }}
                                    eventHandlers={{
                                        click: () => setSelectedProvince(province),
                                    }}
                                >
                                    <Popup>
                                        <div className="map-popup">
                                            <h3 className="popup-title">{province.province}</h3>
                                            <div className="popup-risk" style={{ color: riskColors[province.risk] }}>
                                                {t('map.risk')}: {language === 'en' ? (province.risk === 'very_high' ? 'Very High' : province.risk === 'high' ? 'High' : province.risk === 'medium' ? 'Medium' : 'Low') : riskLabels[province.risk]}
                                            </div>
                                            <div className="popup-stats">
                                                <div><strong>{province.cases.toLocaleString('id-ID')}</strong> {language === 'en' ? 'cases' : 'kasus'}</div>
                                                <div><strong>{province.deaths}</strong> {language === 'en' ? 'deaths' : 'kematian'}</div>
                                                <div><strong>{province.incidenceRate}</strong> IR/100rb</div>
                                            </div>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            ))}
                        </MapContainer>
                    </div>

                    {/* Legend */}
                    <div className="map-legend">
                        <span className="legend-title">{t('map.riskLevel')}:</span>
                        {Object.entries(riskLabels).map(([key, label]) => (
                            <div key={key} className="legend-entry">
                                <div className="legend-circle" style={{ background: riskColors[key] }} />
                                <span>{language === 'en' ? (key === 'very_high' ? 'Very High' : key === 'high' ? 'High' : key === 'medium' ? 'Medium' : 'Low') : label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Province Rankings */}
                <div className="rankings-panel card-static">
                    <h2 className="section-label">
                        <BarChart3 size={18} />
                        {t('map.ranking')}
                    </h2>

                    <div className="rankings-list">
                        {sortedByRisk.slice(0, 15).map((prov, i) => (
                            <div
                                key={prov.province}
                                className={`rank-item ${selectedProvince?.province === prov.province ? 'rank-selected' : ''}`}
                                onClick={() => setSelectedProvince(prov)}
                            >
                                <span className="rank-number">#{i + 1}</span>
                                <div className="rank-info">
                                    <span className="rank-name">{prov.province}</span>
                                    <span className="rank-cases">{prov.cases.toLocaleString('id-ID')} {language === 'en' ? 'cases' : 'kasus'}</span>
                                </div>
                                <div
                                    className="rank-risk-dot"
                                    style={{ background: riskColors[prov.risk] }}
                                    title={riskLabels[prov.risk]}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Selected Province Detail */}
            {selectedProvince && (
                <div className="province-detail card-static animate-fadeInUp">
                    <div className="detail-header">
                        <AlertTriangle size={20} style={{ color: riskColors[selectedProvince.risk] }} />
                        <h3>{selectedProvince.province}</h3>
                        <span
                            className="badge"
                            style={{
                                background: `${riskColors[selectedProvince.risk]}15`,
                                color: riskColors[selectedProvince.risk],
                                border: `1px solid ${riskColors[selectedProvince.risk]}30`,
                            }}
                        >
                            {t('map.risk')} {language === 'en' ? (selectedProvince.risk === 'very_high' ? 'Very High' : selectedProvince.risk === 'high' ? 'High' : selectedProvince.risk === 'medium' ? 'Medium' : 'Low') : riskLabels[selectedProvince.risk]}
                        </span>
                    </div>
                    <div className="detail-stats">
                        <div className="detail-stat">
                            <span className="detail-stat-value">{selectedProvince.cases.toLocaleString('id-ID')}</span>
                            <span className="detail-stat-label">{t('map.totalCases')}</span>
                        </div>
                        <div className="detail-stat">
                            <span className="detail-stat-value">{selectedProvince.deaths}</span>
                            <span className="detail-stat-label">{t('map.deaths')}</span>
                        </div>
                        <div className="detail-stat">
                            <span className="detail-stat-value">{selectedProvince.incidenceRate}</span>
                            <span className="detail-stat-label">IR {language === 'en' ? 'per 100k' : 'per 100rb'}</span>
                        </div>
                        <div className="detail-stat">
                            <span className="detail-stat-value">
                                {((selectedProvince.deaths / selectedProvince.cases) * 100).toFixed(2)}%
                            </span>
                            <span className="detail-stat-label">CFR</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
