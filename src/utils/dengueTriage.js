/**
 * TropiCare — Dengue Triage Engine
 * Rule-based clinical logic for symptom assessment
 */

export const SYMPTOMS = [
  { id: 'fever', labelKey: 'symptom.opt_fever', label: 'Demam tinggi mendadak (≥38°C)', weight: 2, category: 'cardinal' },
  { id: 'headache', labelKey: 'symptom.opt_headache', label: 'Sakit kepala berat', weight: 1, category: 'common' },
  { id: 'retroorbital', labelKey: 'symptom.opt_retroorbital', label: 'Nyeri di belakang mata (retro-orbital)', weight: 3, category: 'specific' },
  { id: 'myalgia', labelKey: 'symptom.opt_aches', label: 'Nyeri otot dan sendi (myalgia/arthralgia)', weight: 2, category: 'common' },
  { id: 'nausea', labelKey: 'symptom.opt_nausea', label: 'Mual dan muntah', weight: 1, category: 'common' },
  { id: 'rash', labelKey: 'symptom.opt_rash', label: 'Ruam merah/bintik merah di kulit', weight: 2, category: 'specific' },
  { id: 'petechiae', labelKey: 'symptom.opt_tourniquet', label: 'Bintik-bintik perdarahan (petekie)', weight: 4, category: 'warning' },
  { id: 'bleeding', labelKey: 'symptom.opt_bleeding', label: 'Perdarahan gusi/hidung/BAB hitam', weight: 5, category: 'warning' },
  { id: 'abdominal', labelKey: 'symptom.opt_pain', label: 'Nyeri perut hebat', weight: 3, category: 'warning' },
  { id: 'lethargy', labelKey: 'symptom.opt_lethargy', label: 'Lemas berat / gelisah', weight: 3, category: 'warning' },
  { id: 'vomiting', labelKey: 'symptom.opt_vomiting', label: 'Muntah terus-menerus (≥3x/hari)', weight: 4, category: 'warning' },
  { id: 'cold_skin', labelKey: 'symptom.opt_cold_skin', label: 'Kulit dingin & berkeringat', weight: 5, category: 'danger' },
  { id: 'rapid_pulse', labelKey: 'symptom.opt_rapid_pulse', label: 'Denyut nadi lemah & cepat', weight: 5, category: 'danger' },
  { id: 'no_urine', labelKey: 'symptom.opt_no_urine', label: 'Tidak buang air kecil >6 jam', weight: 4, category: 'danger' },
];

export const FEVER_DURATION_OPTIONS = [
  { value: '1-2', labelKey: 'symptom.day1', label: '1-2 hari', riskAdd: 0 },
  { value: '3', labelKey: 'symptom.day3', label: '3 hari', riskAdd: 1 },
  { value: '4-5', labelKey: 'symptom.day4', label: '4-5 hari (FASE KRITIS)', riskAdd: 3 },
  { value: '6-7', labelKey: 'symptom.day6', label: '6-7 hari', riskAdd: 2 },
  { value: '7+', labelKey: 'symptom.day8', label: 'Lebih dari 7 hari', riskAdd: 1 },
];

export function calculateTriageScore(selectedSymptoms, feverDuration) {
  let score = 0;
  let hasWarningSign = false;
  let hasDangerSign = false;

  selectedSymptoms.forEach(symptomId => {
    const symptom = SYMPTOMS.find(s => s.id === symptomId);
    if (symptom) {
      score += symptom.weight;
      if (symptom.category === 'warning') hasWarningSign = true;
      if (symptom.category === 'danger') hasDangerSign = true;
    }
  });

  const durationOption = FEVER_DURATION_OPTIONS.find(d => d.value === feverDuration);
  if (durationOption) {
    score += durationOption.riskAdd;
  }

  return { score, hasWarningSign, hasDangerSign };
}

export function getTriageResult(score, hasWarningSign, hasDangerSign, lang = 'id') {
  const isEn = lang === 'en';

  if (hasDangerSign || score >= 20) {
    return {
      level: 'CRITICAL',
      color: '#ef4444',
      title: isEn ? '🚨 EMERGENCY — Go to ER Immediately!' : '🚨 DARURAT — Segera ke IGD!',
      description: isEn ? 'Danger signs detected. Patient may be experiencing Severe Dengue Hemorrhagic Fever (DHF) or Dengue Shock Syndrome (DSS).' : 'Tanda-tanda bahaya ditemukan. Pasien mungkin mengalami Dengue Shock Syndrome (DSS) atau Dengue Hemorrhagic Fever (DHF) berat.',
      actions: isEn ? [
        'IMMEDIATELY go to the nearest hospital ER',
        'Do not delay — this is life-threatening',
        'Call an ambulance if possible',
        'Bring recent lab results if available',
      ] : [
        'SEGERA bawa ke IGD rumah sakit terdekat',
        'Jangan tunda — ini kondisi yang mengancam jiwa',
        'Jika memungkinkan, hubungi ambulans',
        'Bawa hasil lab terbaru jika ada',
      ],
    };
  }

  if (hasWarningSign || score >= 12) {
    return {
      level: 'HIGH',
      color: '#f97066',
      title: isEn ? '⚠️ High Risk — Visit Healthcare Facility Soon' : '⚠️ Risiko Tinggi — Segera Kunjungi Faskes',
      description: isEn ? 'Warning signs present indicating probable Dengue. Medical examination and lab monitoring required.' : 'Terdapat tanda peringatan (warning signs) yang menunjukkan kemungkinan DBD. Diperlukan pemeriksaan medis dan pemantauan laboratorium.',
      actions: isEn ? [
        'Visit a clinic or hospital immediately',
        'Request complete blood count (platelets, hematocrit)',
        'Request NS1 antigen test if fever ≤5 days',
        'Monitor for warning signs: bleeding, continuous vomiting, severe abdominal pain',
        'Drink plenty of fluids (ORS/coconut water)',
      ] : [
        'Segera kunjungi puskesmas atau rumah sakit',
        'Minta pemeriksaan darah lengkap (trombosit, hematokrit)',
        'Minta tes NS1 antigen jika demam ≤5 hari',
        'Pantau tanda bahaya: perdarahan, muntah terus, nyeri perut hebat',
        'Minum cairan yang cukup (ORS/air kelapa)',
      ],
    };
  }

  if (score >= 6) {
    return {
      level: 'MODERATE',
      color: '#f59e0b',
      title: isEn ? '⚡ Moderate Risk — Needs Monitoring' : '⚡ Risiko Sedang — Perlu Dipantau',
      description: isEn ? 'Symptoms are consistent with possible dengue infection. Close monitoring needed, especially entering day 4-6 of fever.' : 'Gejala yang ada konsisten dengan kemungkinan infeksi dengue. Perlu pemantauan ketat, terutama saat memasuki hari ke-4 hingga ke-6 demam.',
      actions: isEn ? [
        'Visit a doctor for examination',
        'Monitor body temperature every 4-6 hours',
        'Drink plenty of fluids (2-3 liters/day)',
        'Complete rest',
        'ALERT: If fever drops but condition worsens → ER immediately',
        'Avoid NSAIDs (ibuprofen, aspirin) — use paracetamol',
      ] : [
        'Kunjungi puskesmas/dokter untuk pemeriksaan',
        'Pantau suhu tubuh setiap 4-6 jam',
        'Minum banyak cairan (2-3 liter/hari)',
        'Istirahat total',
        'WASPADA: Jika demam turun tapi kondisi memburuk → segera ke RS',
        'Hindari obat NSAID (ibuprofen, aspirin) — gunakan paracetamol',
      ],
    };
  }

  return {
    level: 'LOW',
    color: '#22c55e',
    title: isEn ? '✅ Low Risk — Monitor at Home' : '✅ Risiko Rendah — Monitor di Rumah',
    description: isEn ? 'Current symptoms are not typical of Dengue, but still need monitoring. Fever may evolve in a few days.' : 'Gejala saat ini belum khas mengarah ke DBD, namun tetap perlu dipantau. Demam bisa berkembang dalam beberapa hari.',
    actions: isEn ? [
      'Monitor body temperature periodically',
      'Drink enough water',
      'Get enough rest',
      'Take paracetamol for fever (according to dosage)',
      'If symptoms worsen or warning signs appear → go to clinic',
    ] : [
      'Pantau suhu tubuh secara berkala',
      'Minum air putih yang cukup',
      'Istirahat yang cukup',
      'Minum paracetamol jika demam (sesuai dosis)',
      'Jika gejala memburuk atau muncul tanda bahaya → segera ke faskes',
    ],
  };
}

export const CHATBOT_QUESTIONS = [
  {
    id: 'greeting',
    message: 'Halo! Saya TropiCare AI Assistant. Saya akan membantu menilai gejala Anda terkait kemungkinan Demam Berdarah Dengue (DBD). ⚠️ Ini bukan pengganti diagnosis dokter.',
    type: 'info',
  },
  {
    id: 'fever_duration',
    message: 'Berapa lama Anda sudah mengalami demam?',
    type: 'select',
    options: FEVER_DURATION_OPTIONS,
  },
  {
    id: 'symptoms',
    message: 'Pilih gejala yang Anda alami saat ini (bisa lebih dari satu):',
    type: 'multiselect',
    options: SYMPTOMS,
  },
];
