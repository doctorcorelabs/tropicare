/**
 * TropiCare — Indonesia Dengue Data
 * Simplified province data with mock dengue case statistics
 * Based on actual Indonesian dengue epidemiology patterns
 */

export const dengueData = [
    { province: 'Aceh', cases: 1245, deaths: 8, incidenceRate: 23.1, risk: 'medium', lat: 4.6951, lng: 96.7494 },
    { province: 'Sumatera Utara', cases: 4521, deaths: 32, incidenceRate: 30.5, risk: 'high', lat: 2.1154, lng: 99.5451 },
    { province: 'Sumatera Barat', cases: 2345, deaths: 15, incidenceRate: 42.8, risk: 'high', lat: -0.7399, lng: 100.8000 },
    { province: 'Riau', cases: 1876, deaths: 12, incidenceRate: 27.3, risk: 'medium', lat: 0.2933, lng: 101.7068 },
    { province: 'Jambi', cases: 1123, deaths: 7, incidenceRate: 31.2, risk: 'high', lat: -1.6101, lng: 103.6131 },
    { province: 'Sumatera Selatan', cases: 2654, deaths: 18, incidenceRate: 31.8, risk: 'high', lat: -3.3194, lng: 103.9144 },
    { province: 'Bengkulu', cases: 678, deaths: 4, incidenceRate: 34.1, risk: 'high', lat: -3.5778, lng: 102.3464 },
    { province: 'Lampung', cases: 1987, deaths: 14, incidenceRate: 23.5, risk: 'medium', lat: -4.5586, lng: 105.4068 },
    { province: 'Kep. Bangka Belitung', cases: 432, deaths: 2, incidenceRate: 29.1, risk: 'medium', lat: -2.7411, lng: 106.4406 },
    { province: 'Kepulauan Riau', cases: 567, deaths: 3, incidenceRate: 26.4, risk: 'medium', lat: 3.9457, lng: 108.1429 },
    { province: 'DKI Jakarta', cases: 8976, deaths: 45, incidenceRate: 85.3, risk: 'very_high', lat: -6.2088, lng: 106.8456 },
    { province: 'Jawa Barat', cases: 12453, deaths: 67, incidenceRate: 25.2, risk: 'high', lat: -6.9175, lng: 107.6191 },
    { province: 'Jawa Tengah', cases: 9876, deaths: 52, incidenceRate: 28.3, risk: 'high', lat: -7.1510, lng: 110.1403 },
    { province: 'DI Yogyakarta', cases: 2345, deaths: 12, incidenceRate: 62.1, risk: 'very_high', lat: -7.7956, lng: 110.3695 },
    { province: 'Jawa Timur', cases: 15678, deaths: 89, incidenceRate: 39.5, risk: 'very_high', lat: -7.5361, lng: 112.2384 },
    { province: 'Banten', cases: 4567, deaths: 28, incidenceRate: 35.4, risk: 'high', lat: -6.4058, lng: 106.0640 },
    { province: 'Bali', cases: 5432, deaths: 21, incidenceRate: 124.5, risk: 'very_high', lat: -8.4095, lng: 115.1889 },
    { province: 'Nusa Tenggara Barat', cases: 2876, deaths: 19, incidenceRate: 55.2, risk: 'very_high', lat: -8.6529, lng: 117.3616 },
    { province: 'Nusa Tenggara Timur', cases: 1234, deaths: 11, incidenceRate: 22.8, risk: 'medium', lat: -8.6574, lng: 121.0794 },
    { province: 'Kalimantan Barat', cases: 1567, deaths: 10, incidenceRate: 30.1, risk: 'high', lat: -0.2788, lng: 111.4753 },
    { province: 'Kalimantan Tengah', cases: 987, deaths: 6, incidenceRate: 37.2, risk: 'high', lat: -1.6815, lng: 113.3824 },
    { province: 'Kalimantan Selatan', cases: 1432, deaths: 9, incidenceRate: 34.8, risk: 'high', lat: -3.0926, lng: 115.2838 },
    { province: 'Kalimantan Timur', cases: 1876, deaths: 11, incidenceRate: 51.3, risk: 'very_high', lat: 1.6407, lng: 116.4194 },
    { province: 'Kalimantan Utara', cases: 345, deaths: 2, incidenceRate: 48.2, risk: 'high', lat: 3.0731, lng: 116.0414 },
    { province: 'Sulawesi Utara', cases: 876, deaths: 5, incidenceRate: 35.3, risk: 'high', lat: 0.6247, lng: 123.9750 },
    { province: 'Sulawesi Tengah', cases: 1123, deaths: 8, incidenceRate: 37.8, risk: 'high', lat: -1.4301, lng: 121.4456 },
    { province: 'Sulawesi Selatan', cases: 3456, deaths: 22, incidenceRate: 38.7, risk: 'high', lat: -3.6688, lng: 119.9741 },
    { province: 'Sulawesi Tenggara', cases: 654, deaths: 4, incidenceRate: 24.5, risk: 'medium', lat: -4.1449, lng: 122.1748 },
    { province: 'Gorontalo', cases: 432, deaths: 3, incidenceRate: 36.2, risk: 'high', lat: 0.6999, lng: 122.4467 },
    { province: 'Sulawesi Barat', cases: 345, deaths: 2, incidenceRate: 25.8, risk: 'medium', lat: -2.8442, lng: 119.2321 },
    { province: 'Maluku', cases: 234, deaths: 1, incidenceRate: 13.2, risk: 'low', lat: -3.2385, lng: 130.1453 },
    { province: 'Maluku Utara', cases: 187, deaths: 1, incidenceRate: 15.4, risk: 'low', lat: 1.5709, lng: 127.8089 },
    { province: 'Papua', cases: 456, deaths: 3, incidenceRate: 11.2, risk: 'low', lat: -4.2699, lng: 138.0804 },
    { province: 'Papua Barat', cases: 234, deaths: 2, incidenceRate: 23.1, risk: 'medium', lat: -1.3361, lng: 133.1747 },
];

export const riskColors = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#f97066',
    very_high: '#ef4444',
};

export const riskLabels = {
    low: 'Rendah',
    medium: 'Sedang',
    high: 'Tinggi',
    very_high: 'Sangat Tinggi',
};

export const nationalStats = {
    totalCases: 89234,
    totalDeaths: 521,
    cfr: 0.58,
    highestProvince: 'Jawa Timur',
    year: 2025,
};
