import React, { useState, useMemo } from 'react';
import {
    Building2, Search, Phone, MapPin, Bed, Droplets,
    Filter, Heart, CheckCircle, XCircle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { hospitals } from '../data/hospitals';
import { useLanguage } from '../context/LanguageContext';
import 'leaflet/dist/leaflet.css';
import './HealthDirectory.css';

// Fix Leaflet default marker icon
const defaultIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export default function HealthDirectory() {
    const { t, language } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedHospital, setSelectedHospital] = useState(null);

    const filteredHospitals = useMemo(() => {
        return hospitals.filter(h => {
            const matchesSearch =
                h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                h.city.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesProvince = !selectedProvince || h.province === selectedProvince;
            const matchesType = typeFilter === 'all' ||
                (typeFilter === 'rs' && h.type.includes('Rumah Sakit')) ||
                (typeFilter === 'puskesmas' && h.type === 'Puskesmas');
            return matchesSearch && matchesProvince && matchesType;
        });
    }, [searchQuery, selectedProvince, typeFilter]);

    const uniqueProvinces = [...new Set(hospitals.map(h => h.province))].sort();

    return (
        <div className="health-directory">
            {/* Header */}
            <div className="page-header">
                <div className="page-header-icon" style={{ background: 'linear-gradient(135deg, #f472b6, #db2777)' }}>
                    <Building2 size={28} color="white" />
                </div>
                <div>
                    <h1 className="page-title">{t('directory.title')}</h1>
                    <p className="page-subtitle">{t('directory.subtitle')}</p>
                </div>
            </div>

            <div className="dir-layout">
                {/* Search & Filter Panel */}
                <div className="dir-sidebar">
                    <div className="search-section card-static">
                        <div className="search-box">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                className="input search-input"
                                placeholder={t('directory.search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                id="hospital-search"
                            />
                        </div>

                        <div className="filter-section">
                            <div className="form-field">
                                <label className="input-label">
                                    <Filter size={14} />
                                    {t('directory.province')}
                                </label>
                                <select
                                    className="input"
                                    value={selectedProvince}
                                    onChange={(e) => setSelectedProvince(e.target.value)}
                                    id="province-filter"
                                >
                                    <option value="">{t('directory.allProv')}</option>
                                    {uniqueProvinces.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="type-filter">
                                <button
                                    className={`filter-btn ${typeFilter === 'all' ? 'filter-active' : ''}`}
                                    onClick={() => setTypeFilter('all')}
                                >
                                    {t('map.all')}
                                </button>
                                <button
                                    className={`filter-btn ${typeFilter === 'rs' ? 'filter-active' : ''}`}
                                    onClick={() => setTypeFilter('rs')}
                                >
                                    🏥 {language === 'en' ? 'Hospital' : 'Rumah Sakit'}
                                </button>
                                <button
                                    className={`filter-btn ${typeFilter === 'puskesmas' ? 'filter-active' : ''}`}
                                    onClick={() => setTypeFilter('puskesmas')}
                                >
                                    🏢 {language === 'en' ? 'Health Center' : 'Puskesmas'}
                                </button>
                            </div>
                        </div>

                        <p className="result-count">
                            {language === 'en' ? 'Showing' : 'Menampilkan'} <strong>{filteredHospitals.length}</strong> {language === 'en' ? 'facilities' : 'fasilitas kesehatan'}
                        </p>
                    </div>

                    {/* Hospital List */}
                    <div className="hospital-list">
                        {filteredHospitals.map((hospital) => (
                            <div
                                key={hospital.id}
                                className={`hospital-card card-static ${selectedHospital?.id === hospital.id ? 'hospital-selected' : ''}`}
                                onClick={() => setSelectedHospital(hospital)}
                                id={`hospital-${hospital.id}`}
                            >
                                <div className="hospital-header">
                                    <h3 className="hospital-name">{hospital.name}</h3>
                                    <span className="hospital-type-badge">{hospital.type === 'Puskesmas' ? '🏢' : '🏥'}</span>
                                </div>

                                <div className="hospital-meta">
                                    <div className="meta-item">
                                        <MapPin size={14} />
                                        <span>{hospital.city}, {hospital.province}</span>
                                    </div>
                                    <div className="meta-item">
                                        <Phone size={14} />
                                        <span>{hospital.phone}</span>
                                    </div>
                                </div>

                                <div className="hospital-stats">
                                    <div className="hosp-stat">
                                        <Bed size={14} />
                                        <span className={hospital.beds.available > 10 ? 'stat-ok' : hospital.beds.available > 0 ? 'stat-warn' : 'stat-danger'}>
                                            {hospital.beds.available}/{hospital.beds.total} {language === 'en' ? 'beds' : 'kamar'}
                                        </span>
                                    </div>
                                    <div className="hosp-stat">
                                        <Droplets size={14} />
                                        <span className={hospital.bloodStock.platelet > 20 ? 'stat-ok' : hospital.bloodStock.platelet > 0 ? 'stat-warn' : 'stat-danger'}>
                                            {hospital.bloodStock.platelet > 0 ? `${hospital.bloodStock.platelet} unit TC` : (language === 'en' ? 'Unavailable' : 'Tidak tersedia')}
                                        </span>
                                    </div>
                                    <div className="hosp-stat">
                                        {hospital.hasICU
                                            ? <><CheckCircle size={14} className="stat-ok" /><span className="stat-ok">ICU</span></>
                                            : <><XCircle size={14} className="stat-danger" /><span className="stat-danger">No ICU</span></>
                                        }
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredHospitals.length === 0 && (
                            <div className="no-results">
                                <Building2 size={48} style={{ opacity: 0.2 }} />
                                <p>{language === 'en' ? 'No health facilities found' : 'Tidak ditemukan fasilitas kesehatan'}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Map + Detail */}
                <div className="dir-main">
                    {/* Mini Map */}
                    <div className="dir-map card-static">
                        <div className="leaflet-wrapper" style={{ height: '350px' }}>
                            <MapContainer
                                center={
                                    selectedHospital
                                        ? [selectedHospital.lat, selectedHospital.lng]
                                        : [-2.5, 118]
                                }
                                zoom={selectedHospital ? 12 : 5}
                                scrollWheelZoom={true}
                                style={{ height: '100%', width: '100%' }}
                                key={selectedHospital ? selectedHospital.id : 'default'}
                                id="directory-map"
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                />
                                {filteredHospitals.map((hospital) => (
                                    <Marker
                                        key={hospital.id}
                                        position={[hospital.lat, hospital.lng]}
                                        icon={defaultIcon}
                                        eventHandlers={{ click: () => setSelectedHospital(hospital) }}
                                    >
                                        <Popup>
                                            <div className="map-popup">
                                                <h3 className="popup-title">{hospital.name}</h3>
                                                <p>{hospital.city}</p>
                                                <p>{language === 'en' ? 'Available beds' : 'Kamar tersedia'}: {hospital.beds.available}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>

                    {/* Selected Hospital Detail */}
                    {selectedHospital && (
                        <div className="hospital-detail card-static animate-fadeInUp">
                            <div className="detail-top">
                                <div>
                                    <h2 className="detail-name">{selectedHospital.name}</h2>
                                    <p className="detail-type">{selectedHospital.type}</p>
                                </div>
                                {selectedHospital.dengueReady && (
                                    <span className="badge badge-success">{t('directory.dengueReady')}</span>
                                )}
                            </div>

                            <div className="detail-info-grid">
                                <div className="detail-info-item">
                                    <MapPin size={16} />
                                    <div>
                                        <span className="detail-info-label">{language === 'en' ? 'Address' : 'Alamat'}</span>
                                        <span className="detail-info-value">{selectedHospital.address}</span>
                                    </div>
                                </div>
                                <div className="detail-info-item">
                                    <Phone size={16} />
                                    <div>
                                        <span className="detail-info-label">{language === 'en' ? 'Phone' : 'Telepon'}</span>
                                        <span className="detail-info-value">{selectedHospital.phone}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-cards-grid">
                                <div className="detail-mini-card">
                                    <Bed size={20} />
                                    <div className="detail-mini-value">{selectedHospital.beds.available}</div>
                                    <div className="detail-mini-label">{t('directory.beds')}</div>
                                    <div className="detail-mini-total">{language === 'en' ? `of ${selectedHospital.beds.total} total` : `dari ${selectedHospital.beds.total} total`}</div>
                                </div>
                                <div className="detail-mini-card">
                                    <Heart size={20} style={{ color: '#f97066' }} />
                                    <div className="detail-mini-value">{selectedHospital.bloodStock.platelet}</div>
                                    <div className="detail-mini-label">{t('directory.platelet')}</div>
                                    <div className="detail-mini-total">{language === 'en' ? 'concentrate' : 'konsentrat'}</div>
                                </div>
                                <div className="detail-mini-card">
                                    <Droplets size={20} style={{ color: '#ef4444' }} />
                                    <div className="detail-mini-value">{selectedHospital.bloodStock.wholeBlood}</div>
                                    <div className="detail-mini-label">{t('directory.blood')}</div>
                                    <div className="detail-mini-total">whole blood</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
