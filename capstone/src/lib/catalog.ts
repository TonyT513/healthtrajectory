import type { CategoryId, LabTest } from './types';

/*
 * Typical adult reference ranges below are *suggestions* shown in the add form.
 * Every saved result stores the range from the user's own report, and status is
 * always computed against that. Sources are listed in docs/reference-ranges.md.
 */

export const CATEGORIES: { id: CategoryId; name: string; short: string }[] = [
  { id: 'blood-sugar', name: 'Blood Sugar / Diabetes', short: 'Blood sugar' },
  { id: 'lipids', name: 'Cholesterol / Lipids', short: 'Cholesterol' },
  { id: 'cbc', name: 'Complete Blood Count', short: 'CBC' },
  { id: 'kidney', name: 'Kidney Function', short: 'Kidney' },
  { id: 'liver', name: 'Liver Function', short: 'Liver' },
  { id: 'thyroid', name: 'Thyroid', short: 'Thyroid' },
  { id: 'iron', name: 'Iron', short: 'Iron' },
  { id: 'vitamins', name: 'Vitamins', short: 'Vitamins' },
  { id: 'inflammation', name: 'Inflammation', short: 'Inflammation' },
  { id: 'electrolytes', name: 'Electrolytes', short: 'Electrolytes' },
  { id: 'other', name: 'Other', short: 'Other' },
];

export const categoryName = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.name ?? 'Other';

const K = '×10³/µL';

export const TESTS: LabTest[] = [
  // ── Blood sugar / diabetes ────────────────────────────────────────────────
  {
    id: 'glucose-fasting', name: 'Glucose, fasting', short: 'Fasting glucose', aliases: ['fbg', 'fpg', 'blood sugar', 'glucose'],
    category: 'blood-sugar', unit: 'mg/dL', altUnits: ['mmol/L'], typical: '70-99', better: 'range', sig: 4, primary: true,
    about: 'Blood sugar after at least 8 hours without food. It is one of the standard screening tests for diabetes.',
    bandsSource: 'American Diabetes Association, Standards of Care',
    bands: [
      { label: 'Low', text: 'Below 70', max: 70, tone: 'high' },
      { label: 'Normal', text: '70–99', min: 70, max: 100, tone: 'ok' },
      { label: 'Prediabetes range', text: '100–125', min: 100, max: 126, tone: 'watch' },
      { label: 'Diabetes range', text: '126 or higher', min: 126, tone: 'high' },
    ],
  },
  {
    id: 'glucose-random', name: 'Glucose, random', short: 'Random glucose', aliases: ['non-fasting glucose', 'blood sugar'],
    category: 'blood-sugar', unit: 'mg/dL', altUnits: ['mmol/L'], typical: '70-139', better: 'range', sig: 8,
    about: 'Blood sugar taken at any time of day, regardless of meals. It varies more than a fasting reading.',
  },
  {
    id: 'a1c', name: 'Hemoglobin A1C', short: 'A1C', aliases: ['hba1c', 'a1c', 'glycated hemoglobin', 'glycohemoglobin'],
    category: 'blood-sugar', unit: '%', altUnits: ['mmol/mol'], typical: '< 5.7', better: 'lower', sig: 0.2, primary: true,
    about: 'Your average blood sugar over roughly the past 2–3 months. It doesn’t swing day to day like a glucose reading does.',
    bandsSource: 'American Diabetes Association, Standards of Care',
    bands: [
      { label: 'Normal', text: 'Below 5.7', max: 5.7, tone: 'ok' },
      { label: 'Prediabetes range', text: '5.7–6.4', min: 5.7, max: 6.5, tone: 'watch' },
      { label: 'Diabetes range', text: '6.5 or higher', min: 6.5, tone: 'high' },
    ],
  },
  {
    id: 'eag', name: 'Estimated Average Glucose (eAG)', short: 'eAG', aliases: ['estimated average glucose'],
    category: 'blood-sugar', unit: 'mg/dL', typical: '< 117', better: 'lower', sig: 6,
    about: 'A1C converted to the same units as a glucose reading (eAG = 28.7 × A1C − 46.7).',
  },
  {
    id: 'insulin', name: 'Insulin, fasting', short: 'Insulin', aliases: ['insulin'],
    category: 'blood-sugar', unit: 'µIU/mL', typical: '2.6-24.9', better: 'range',
    about: 'How much insulin is in your blood while fasting. It is sometimes used to look at insulin resistance.',
  },
  {
    id: 'c-peptide', name: 'C-Peptide', aliases: ['c peptide', 'connecting peptide'],
    category: 'blood-sugar', unit: 'ng/mL', typical: '0.8-3.85', better: 'range',
    about: 'A by-product released when your body makes insulin. It shows how much insulin your pancreas is producing.',
  },

  // ── Lipids ────────────────────────────────────────────────────────────────
  {
    id: 'total-chol', name: 'Total Cholesterol', short: 'Total cholesterol', aliases: ['cholesterol', 'tc'],
    category: 'lipids', unit: 'mg/dL', altUnits: ['mmol/L'], typical: '< 200', better: 'lower', sig: 8, primary: true,
    about: 'All the cholesterol carried in your blood: LDL, HDL and VLDL together.',
    bandsSource: 'NCEP ATP III',
    bands: [
      { label: 'Desirable', text: 'Below 200', max: 200, tone: 'ok' },
      { label: 'Borderline high', text: '200–239', min: 200, max: 240, tone: 'watch' },
      { label: 'High', text: '240 or higher', min: 240, tone: 'high' },
    ],
  },
  {
    id: 'ldl', name: 'LDL Cholesterol', short: 'LDL', aliases: ['ldl-c', 'bad cholesterol', 'low-density lipoprotein'],
    category: 'lipids', unit: 'mg/dL', altUnits: ['mmol/L'], typical: '< 100', better: 'lower', sig: 6, primary: true,
    about: 'The cholesterol most closely tied to plaque in arteries. Your clinician may give you a target that is lower than the lab range.',
    bandsSource: 'NCEP ATP III',
    bands: [
      { label: 'Optimal', text: 'Below 100', max: 100, tone: 'ok' },
      { label: 'Near optimal', text: '100–129', min: 100, max: 130, tone: 'watch' },
      { label: 'Borderline high', text: '130–159', min: 130, max: 160, tone: 'watch' },
      { label: 'High', text: '160–189', min: 160, max: 190, tone: 'high' },
      { label: 'Very high', text: '190 or higher', min: 190, tone: 'high' },
    ],
  },
  {
    id: 'hdl', name: 'HDL Cholesterol', short: 'HDL', aliases: ['hdl-c', 'good cholesterol', 'high-density lipoprotein'],
    category: 'lipids', unit: 'mg/dL', altUnits: ['mmol/L'], typical: { male: '>= 40', female: '>= 50' }, better: 'higher', sig: 3, primary: true,
    about: 'Carries cholesterol away from arteries, so higher values are generally better.',
    bandsSource: 'NCEP ATP III / American Heart Association',
    bands: [
      { label: 'Low', text: 'Below 40 (men) / 50 (women)', max: 40, tone: 'high' },
      { label: 'Acceptable', text: '40–59', min: 40, max: 60, tone: 'ok' },
      { label: 'Protective', text: '60 or higher', min: 60, tone: 'ok' },
    ],
  },
  {
    id: 'trig', name: 'Triglycerides', aliases: ['tg', 'trigs'],
    category: 'lipids', unit: 'mg/dL', altUnits: ['mmol/L'], typical: '< 150', better: 'lower', sig: 10, primary: true,
    about: 'A type of fat in the blood. It is affected by recent meals, alcohol and blood sugar.',
    bandsSource: 'NCEP ATP III',
    bands: [
      { label: 'Normal', text: 'Below 150', max: 150, tone: 'ok' },
      { label: 'Borderline high', text: '150–199', min: 150, max: 200, tone: 'watch' },
      { label: 'High', text: '200–499', min: 200, max: 500, tone: 'high' },
      { label: 'Very high', text: '500 or higher', min: 500, tone: 'high' },
    ],
  },
  {
    id: 'non-hdl', name: 'Non-HDL Cholesterol', short: 'Non-HDL', aliases: ['non hdl'],
    category: 'lipids', unit: 'mg/dL', typical: '< 130', better: 'lower', sig: 6,
    about: 'Total cholesterol minus HDL. It includes every type of cholesterol that can build up in arteries.',
  },
  {
    id: 'vldl', name: 'VLDL Cholesterol', short: 'VLDL', aliases: ['very low-density lipoprotein'],
    category: 'lipids', unit: 'mg/dL', typical: '5-40', better: 'lower',
    about: 'Mostly carries triglycerides. Many labs estimate it rather than measure it directly.',
  },
  {
    id: 'apoa1', name: 'Apolipoprotein A1', short: 'ApoA1', aliases: ['apo a1', 'apoa-1'],
    category: 'lipids', unit: 'mg/dL', typical: { male: '101-178', female: '116-209' }, better: 'higher',
    about: 'The main protein in HDL particles.',
  },
  {
    id: 'apob', name: 'Apolipoprotein B', short: 'ApoB', aliases: ['apo b'],
    category: 'lipids', unit: 'mg/dL', typical: '< 90', better: 'lower',
    about: 'Counts the particles that can cause plaque, with one ApoB on each LDL and VLDL particle.',
  },
  {
    id: 'lpa', name: 'Lipoprotein(a)', short: 'Lp(a)', aliases: ['lp(a)', 'lpa', 'lipoprotein a'],
    category: 'lipids', unit: 'nmol/L', altUnits: ['mg/dL'], typical: '< 75', better: 'lower',
    about: 'Mostly set by your genes. It is often checked just once. Units vary by lab (nmol/L or mg/dL) and can’t be converted directly.',
  },

  // ── CBC ───────────────────────────────────────────────────────────────────
  { id: 'wbc', name: 'White Blood Cell Count (WBC)', short: 'WBC', aliases: ['white count', 'leukocytes'], category: 'cbc', unit: K, typical: '4.0-11.0', better: 'range', primary: true, about: 'Infection-fighting cells. It can rise with infection or inflammation and drop with some medicines or conditions.' },
  { id: 'rbc', name: 'Red Blood Cell Count (RBC)', short: 'RBC', aliases: ['red count', 'erythrocytes'], category: 'cbc', unit: '×10⁶/µL', typical: { male: '4.14-5.80', female: '3.77-5.28' }, better: 'range', primary: true, about: 'The cells that carry oxygen.' },
  { id: 'hgb', name: 'Hemoglobin', short: 'Hemoglobin', aliases: ['hgb', 'hb'], category: 'cbc', unit: 'g/dL', typical: { male: '13.2-16.6', female: '11.6-15.0' }, better: 'range', sig: 0.5, primary: true, about: 'The oxygen-carrying protein in red cells. A low value is the main sign of anemia.' },
  { id: 'hct', name: 'Hematocrit', short: 'Hematocrit', aliases: ['hct', 'pcv'], category: 'cbc', unit: '%', typical: { male: '38.3-48.6', female: '35.5-44.9' }, better: 'range', primary: true, about: 'How much of your blood volume is made up of red cells.' },
  { id: 'mcv', name: 'Mean Corpuscular Volume (MCV)', short: 'MCV', aliases: ['mcv'], category: 'cbc', unit: 'fL', typical: '80-100', better: 'range', about: 'The average size of your red cells. It helps narrow down the cause of anemia.' },
  { id: 'mch', name: 'Mean Corpuscular Hemoglobin (MCH)', short: 'MCH', aliases: ['mch'], category: 'cbc', unit: 'pg', typical: '27-33', better: 'range', about: 'The average amount of hemoglobin in each red cell.' },
  { id: 'mchc', name: 'Mean Corpuscular Hemoglobin Concentration (MCHC)', short: 'MCHC', aliases: ['mchc'], category: 'cbc', unit: 'g/dL', typical: '32-36', better: 'range', about: 'How concentrated the hemoglobin is inside red cells.' },
  { id: 'rdw', name: 'Red Cell Distribution Width (RDW)', short: 'RDW', aliases: ['rdw', 'rdw-cv'], category: 'cbc', unit: '%', typical: '11.6-15.4', better: 'range', about: 'How much your red cells vary in size.' },
  { id: 'plt', name: 'Platelet Count', short: 'Platelets', aliases: ['plt', 'platelets', 'thrombocytes'], category: 'cbc', unit: K, typical: '150-450', better: 'range', primary: true, about: 'Cell fragments that help your blood clot.' },
  { id: 'mpv', name: 'Mean Platelet Volume (MPV)', short: 'MPV', aliases: ['mpv'], category: 'cbc', unit: 'fL', typical: '7.5-12.5', better: 'range', about: 'The average size of your platelets.' },
  { id: 'neut-pct', name: 'Neutrophils', short: 'Neutrophils %', aliases: ['neutrophils', 'neut', 'segs'], category: 'cbc', unit: '%', typical: '40-70', better: 'range', about: 'Percentage of white cells that are neutrophils, which are first responders to bacterial infection.' },
  { id: 'lymph-pct', name: 'Lymphocytes', short: 'Lymphocytes %', aliases: ['lymphs', 'lymph'], category: 'cbc', unit: '%', typical: '20-40', better: 'range', about: 'Percentage of white cells that are lymphocytes (T cells, B cells and NK cells).' },
  { id: 'mono-pct', name: 'Monocytes', short: 'Monocytes %', aliases: ['monos', 'mono'], category: 'cbc', unit: '%', typical: '2-10', better: 'range', about: 'Percentage of white cells that are monocytes.' },
  { id: 'eos-pct', name: 'Eosinophils', short: 'Eosinophils %', aliases: ['eos'], category: 'cbc', unit: '%', typical: '1-6', better: 'range', about: 'Percentage of white cells that are eosinophils. These rise with allergies and some infections.' },
  { id: 'baso-pct', name: 'Basophils', short: 'Basophils %', aliases: ['basos', 'baso'], category: 'cbc', unit: '%', typical: '0-2', better: 'range', about: 'Percentage of white cells that are basophils.' },
  { id: 'anc', name: 'Absolute Neutrophil Count', short: 'ANC', aliases: ['anc', 'neutrophils absolute'], category: 'cbc', unit: K, typical: '1.5-7.8', better: 'range', about: 'The actual number of neutrophils, not a percentage.' },
  { id: 'alc', name: 'Absolute Lymphocyte Count', short: 'ALC', aliases: ['alc', 'lymphocytes absolute'], category: 'cbc', unit: K, typical: '0.85-3.9', better: 'range', about: 'The actual number of lymphocytes.' },
  { id: 'amc', name: 'Absolute Monocyte Count', short: 'AMC', aliases: ['monocytes absolute'], category: 'cbc', unit: K, typical: '0.2-0.95', better: 'range', about: 'The actual number of monocytes.' },
  { id: 'aec', name: 'Absolute Eosinophil Count', short: 'AEC', aliases: ['eosinophils absolute'], category: 'cbc', unit: K, typical: '0.015-0.5', better: 'range', about: 'The actual number of eosinophils.' },
  { id: 'abc', name: 'Absolute Basophil Count', short: 'ABC', aliases: ['basophils absolute'], category: 'cbc', unit: K, typical: '0-0.2', better: 'range', about: 'The actual number of basophils.' },

  // ── Kidney ────────────────────────────────────────────────────────────────
  { id: 'creatinine', name: 'Creatinine', aliases: ['creat', 'cr', 'serum creatinine'], category: 'kidney', unit: 'mg/dL', altUnits: ['µmol/L'], typical: { male: '0.74-1.35', female: '0.59-1.04' }, better: 'range', sig: 0.1, primary: true, about: 'A waste product from muscle that your kidneys filter out. It is used to calculate eGFR.' },
  { id: 'bun', name: 'Blood Urea Nitrogen (BUN)', short: 'BUN', aliases: ['bun', 'urea nitrogen', 'urea'], category: 'kidney', unit: 'mg/dL', typical: '6-24', better: 'range', primary: true, about: 'A waste product from breaking down protein. It is affected by kidney function, hydration and diet.' },
  {
    id: 'egfr', name: 'Estimated Glomerular Filtration Rate (eGFR)', short: 'eGFR', aliases: ['egfr', 'gfr', 'kidney function'],
    category: 'kidney', unit: 'mL/min/1.73m²', typical: '>= 60', better: 'higher', sig: 4, primary: true,
    about: 'An estimate of how well your kidneys filter blood, calculated from creatinine, age and sex.',
    bandsSource: 'KDIGO 2024 CKD guideline',
    bands: [
      { label: 'G1 · Normal or high', text: '90 or higher', min: 90, tone: 'ok' },
      { label: 'G2 · Mildly decreased', text: '60–89', min: 60, max: 90, tone: 'ok' },
      { label: 'G3a · Mild to moderate', text: '45–59', min: 45, max: 60, tone: 'watch' },
      { label: 'G3b · Moderate to severe', text: '30–44', min: 30, max: 45, tone: 'high' },
      { label: 'G4 · Severely decreased', text: '15–29', min: 15, max: 30, tone: 'high' },
      { label: 'G5 · Kidney failure', text: 'Below 15', max: 15, tone: 'high' },
    ],
  },
  { id: 'bun-creat', name: 'BUN/Creatinine Ratio', short: 'BUN/Creat', aliases: ['bun creatinine ratio'], category: 'kidney', unit: 'ratio', typical: '10-20', better: 'range', about: 'Compares BUN with creatinine. It can help tell dehydration apart from kidney causes.' },
  { id: 'uric-acid', name: 'Uric Acid', aliases: ['urate'], category: 'kidney', unit: 'mg/dL', typical: { male: '3.7-8.6', female: '2.7-7.3' }, better: 'range', about: 'A waste product from breaking down purines. High levels are linked to gout and kidney stones.' },

  // ── Electrolytes ──────────────────────────────────────────────────────────
  { id: 'sodium', name: 'Sodium', aliases: ['na'], category: 'electrolytes', unit: 'mmol/L', altUnits: ['mEq/L'], typical: '135-145', better: 'range', sig: 2, primary: true, about: 'Controls fluid balance and nerve signals.' },
  { id: 'potassium', name: 'Potassium', aliases: ['k'], category: 'electrolytes', unit: 'mmol/L', altUnits: ['mEq/L'], typical: '3.5-5.2', better: 'range', sig: 0.2, primary: true, about: 'Important for heart rhythm and muscles. Both high and low values matter.' },
  { id: 'chloride', name: 'Chloride', aliases: ['cl'], category: 'electrolytes', unit: 'mmol/L', altUnits: ['mEq/L'], typical: '98-107', better: 'range', sig: 2, about: 'Works together with sodium to keep fluid and acid–base balance.' },
  { id: 'co2', name: 'Carbon Dioxide (CO₂)', short: 'CO₂', aliases: ['co2', 'bicarbonate', 'hco3', 'total co2'], category: 'electrolytes', unit: 'mmol/L', altUnits: ['mEq/L'], typical: '22-29', better: 'range', sig: 2, about: 'Mostly bicarbonate. It reflects your body’s acid–base balance.' },
  { id: 'calcium', name: 'Calcium', aliases: ['ca'], category: 'electrolytes', unit: 'mg/dL', typical: '8.6-10.3', better: 'range', sig: 0.3, about: 'Needed for bones, muscles and nerves. Read it together with albumin.' },

  // ── Liver ─────────────────────────────────────────────────────────────────
  { id: 'alt', name: 'ALT (SGPT)', short: 'ALT', aliases: ['alt', 'sgpt', 'alanine aminotransferase'], category: 'liver', unit: 'U/L', typical: '4-36', better: 'range', primary: true, about: 'A liver enzyme. When it is high, it usually points to liver cell irritation.' },
  { id: 'ast', name: 'AST (SGOT)', short: 'AST', aliases: ['ast', 'sgot', 'aspartate aminotransferase'], category: 'liver', unit: 'U/L', typical: '8-33', better: 'range', primary: true, about: 'An enzyme found in the liver, heart and muscle.' },
  { id: 'alp', name: 'Alkaline Phosphatase', short: 'ALP', aliases: ['alk phos', 'alp'], category: 'liver', unit: 'U/L', typical: '44-147', better: 'range', about: 'An enzyme found in the liver and bone.' },
  { id: 'tbili', name: 'Total Bilirubin', short: 'Bilirubin', aliases: ['bilirubin', 't bili', 'tbil'], category: 'liver', unit: 'mg/dL', typical: '0.1-1.2', better: 'range', about: 'A yellow pigment made when red cells break down. The liver clears it.' },
  { id: 'dbili', name: 'Direct Bilirubin', aliases: ['conjugated bilirubin', 'd bili'], category: 'liver', unit: 'mg/dL', typical: '0.0-0.3', better: 'range', about: 'The part of bilirubin the liver has already processed.' },
  { id: 'ibili', name: 'Indirect Bilirubin', aliases: ['unconjugated bilirubin'], category: 'liver', unit: 'mg/dL', typical: '0.1-1.0', better: 'range', about: 'Bilirubin the liver hasn’t processed yet.' },
  { id: 'albumin', name: 'Albumin', aliases: ['alb'], category: 'liver', unit: 'g/dL', typical: '3.5-5.0', better: 'range', about: 'The main protein made by the liver. It reflects nutrition and liver function.' },
  { id: 'total-protein', name: 'Total Protein', aliases: ['tp', 'protein'], category: 'liver', unit: 'g/dL', typical: '6.0-8.3', better: 'range', about: 'Albumin and globulins added together.' },
  { id: 'globulin', name: 'Globulin', aliases: ['glob'], category: 'liver', unit: 'g/dL', typical: '2.0-3.5', better: 'range', about: 'Proteins that include antibodies. Usually calculated as total protein minus albumin.' },
  { id: 'ag-ratio', name: 'Albumin/Globulin Ratio', short: 'A/G ratio', aliases: ['a/g ratio', 'ag ratio'], category: 'liver', unit: 'ratio', typical: '1.1-2.5', better: 'range', about: 'Albumin divided by globulin.' },

  // ── Thyroid ───────────────────────────────────────────────────────────────
  { id: 'tsh', name: 'TSH', aliases: ['thyroid stimulating hormone', 'thyrotropin'], category: 'thyroid', unit: 'mIU/L', altUnits: ['µIU/mL'], typical: '0.45-4.5', better: 'range', sig: 0.3, primary: true, about: 'The pituitary’s signal to your thyroid. High TSH usually means an underactive thyroid, and low TSH an overactive one.' },
  { id: 'ft4', name: 'Free T4', aliases: ['ft4', 'free thyroxine'], category: 'thyroid', unit: 'ng/dL', altUnits: ['pmol/L'], typical: '0.8-1.8', better: 'range', sig: 0.1, primary: true, about: 'The unbound form of the main thyroid hormone.' },
  { id: 'tt4', name: 'Total T4', aliases: ['t4', 'thyroxine'], category: 'thyroid', unit: 'µg/dL', typical: '4.5-12.0', better: 'range', about: 'All the thyroxine in your blood, both bound and free.' },
  { id: 'ft3', name: 'Free T3', aliases: ['ft3', 'free triiodothyronine'], category: 'thyroid', unit: 'pg/mL', typical: '2.0-4.4', better: 'range', about: 'The unbound form of the active thyroid hormone.' },
  { id: 'tt3', name: 'Total T3', aliases: ['t3', 'triiodothyronine'], category: 'thyroid', unit: 'ng/dL', typical: '80-200', better: 'range', about: 'All the triiodothyronine in your blood.' },
  { id: 'tpo', name: 'Thyroid Peroxidase Antibody (TPO)', short: 'TPO antibody', aliases: ['tpo', 'anti-tpo', 'tpoab'], category: 'thyroid', unit: 'IU/mL', typical: '< 9', better: 'lower', about: 'An antibody linked to autoimmune thyroid disease, such as Hashimoto’s. Cutoffs vary a lot between labs.' },
  { id: 'tgab', name: 'Thyroglobulin Antibody', short: 'TgAb', aliases: ['tgab', 'anti-thyroglobulin'], category: 'thyroid', unit: 'IU/mL', typical: '< 4', better: 'lower', about: 'Another autoimmune thyroid antibody. Cutoffs vary between labs.' },

  // ── Iron ──────────────────────────────────────────────────────────────────
  { id: 'ferritin', name: 'Ferritin', aliases: ['ferr'], category: 'iron', unit: 'ng/mL', typical: { male: '24-336', female: '11-307' }, better: 'range', primary: true, about: 'Shows how much iron your body has stored. It can also rise with inflammation.' },
  { id: 'iron', name: 'Iron, serum', short: 'Iron', aliases: ['iron', 'fe', 'serum iron'], category: 'iron', unit: 'µg/dL', typical: '60-170', better: 'range', primary: true, about: 'Iron circulating in your blood right now. It changes over the course of the day.' },
  { id: 'tibc', name: 'Total Iron-Binding Capacity (TIBC)', short: 'TIBC', aliases: ['tibc'], category: 'iron', unit: 'µg/dL', typical: '240-450', better: 'range', primary: true, about: 'How much iron your blood could carry. It tends to go up when iron is low.' },
  { id: 'transferrin', name: 'Transferrin', aliases: ['trf'], category: 'iron', unit: 'mg/dL', typical: '200-360', better: 'range', about: 'The protein that carries iron around the body.' },
  { id: 'tsat', name: 'Transferrin Saturation', short: 'Iron saturation', aliases: ['tsat', 'iron saturation', '% saturation'], category: 'iron', unit: '%', typical: '20-50', better: 'range', primary: true, about: 'How much of your transferrin is carrying iron.' },

  // ── Vitamins ──────────────────────────────────────────────────────────────
  {
    id: 'b12', name: 'Vitamin B12', short: 'B12', aliases: ['b12', 'cobalamin'],
    category: 'vitamins', unit: 'pg/mL', altUnits: ['pmol/L'], typical: '200-900', better: 'range', primary: true,
    about: 'Needed for nerves and for making red blood cells.',
    bandsSource: 'NIH Office of Dietary Supplements',
    bands: [
      { label: 'Deficient', text: 'Below 200', max: 200, tone: 'high' },
      { label: 'Borderline', text: '200–300', min: 200, max: 300, tone: 'watch' },
      { label: 'Normal', text: 'Above 300', min: 300, tone: 'ok' },
    ],
  },
  { id: 'folate', name: 'Folate', aliases: ['folic acid', 'b9'], category: 'vitamins', unit: 'ng/mL', typical: '>= 3', better: 'higher', primary: true, about: 'A B vitamin needed to make red blood cells.' },
  {
    id: 'vitd', name: 'Vitamin D, 25-Hydroxy', short: 'Vitamin D', aliases: ['vitamin d', '25-oh', '25(oh)d', 'calcidiol'],
    category: 'vitamins', unit: 'ng/mL', altUnits: ['nmol/L'], typical: '30-100', better: 'range', sig: 3, primary: true,
    about: 'The standard test for your vitamin D level. Where the cutoffs sit is still debated.',
    bandsSource: 'Endocrine Society',
    bands: [
      { label: 'Deficient', text: 'Below 20', max: 20, tone: 'high' },
      { label: 'Insufficient', text: '20–29', min: 20, max: 30, tone: 'watch' },
      { label: 'Sufficient', text: '30–100', min: 30, max: 100.01, tone: 'ok' },
      { label: 'Higher than needed', text: 'Above 100', min: 100.01, tone: 'watch' },
    ],
  },
  { id: 'vita', name: 'Vitamin A', aliases: ['retinol'], category: 'vitamins', unit: 'µg/dL', typical: '20-60', better: 'range', about: 'Needed for vision, skin and immune function.' },
  { id: 'vitb1', name: 'Vitamin B1', aliases: ['thiamine'], category: 'vitamins', unit: 'nmol/L', typical: '70-180', better: 'range', about: 'Thiamine, measured in whole blood.' },
  { id: 'vitb6', name: 'Vitamin B6', aliases: ['pyridoxine', 'plp'], category: 'vitamins', unit: 'µg/L', typical: '5-50', better: 'range', about: 'Measured as PLP, its active form.' },
  { id: 'vitc', name: 'Vitamin C', aliases: ['ascorbic acid'], category: 'vitamins', unit: 'mg/dL', typical: '0.4-2.0', better: 'range', about: 'An antioxidant vitamin. Levels reflect what you’ve eaten recently.' },
  { id: 'vite', name: 'Vitamin E', aliases: ['alpha-tocopherol', 'tocopherol'], category: 'vitamins', unit: 'mg/L', typical: '5.5-17', better: 'range', about: 'Measured as alpha-tocopherol.' },

  // ── Inflammation ──────────────────────────────────────────────────────────
  { id: 'crp', name: 'C-Reactive Protein (CRP)', short: 'CRP', aliases: ['crp'], category: 'inflammation', unit: 'mg/L', typical: '< 10', better: 'lower', primary: true, about: 'A general marker of inflammation. It rises quickly with infection or injury.' },
  {
    id: 'hscrp', name: 'High-Sensitivity CRP (hs-CRP)', short: 'hs-CRP', aliases: ['hscrp', 'hs crp', 'cardiac crp'],
    category: 'inflammation', unit: 'mg/L', typical: '< 3.0', better: 'lower', sig: 0.3,
    about: 'Measures low-level inflammation and is used to help estimate heart risk. Skip it if you’ve been sick recently.',
    bandsSource: 'AHA / CDC',
    bands: [
      { label: 'Lower risk', text: 'Below 1.0', max: 1, tone: 'ok' },
      { label: 'Average risk', text: '1.0–3.0', min: 1, max: 3.01, tone: 'watch' },
      { label: 'Higher risk', text: 'Above 3.0', min: 3.01, tone: 'high' },
    ],
  },
  { id: 'esr', name: 'Erythrocyte Sedimentation Rate (ESR)', short: 'ESR', aliases: ['esr', 'sed rate'], category: 'inflammation', unit: 'mm/hr', typical: { male: '0-15', female: '0-20' }, better: 'lower', about: 'An older, slower-moving marker of inflammation. It tends to rise with age.' },

  // ── Other ─────────────────────────────────────────────────────────────────
  { id: 'magnesium', name: 'Magnesium', aliases: ['mg'], category: 'other', unit: 'mg/dL', typical: '1.7-2.2', better: 'range', about: 'Needed for muscles, nerves and heart rhythm.' },
  { id: 'phosphorus', name: 'Phosphorus', aliases: ['phos', 'phosphate'], category: 'other', unit: 'mg/dL', typical: '2.5-4.5', better: 'range', about: 'Works with calcium to build bone.' },
  { id: 'amylase', name: 'Amylase', aliases: ['amy'], category: 'other', unit: 'U/L', typical: '40-140', better: 'range', about: 'A digestive enzyme from the pancreas and salivary glands.' },
  { id: 'lipase', name: 'Lipase', aliases: ['lip'], category: 'other', unit: 'U/L', typical: '13-60', better: 'range', about: 'A pancreatic enzyme. It is the main blood test for pancreatitis.' },
  { id: 'ldh', name: 'Lactate Dehydrogenase (LDH)', short: 'LDH', aliases: ['ldh', 'ld'], category: 'other', unit: 'U/L', typical: '105-333', better: 'range', about: 'An enzyme found in most tissues. It is released when cells are damaged.' },
  { id: 'ck', name: 'Creatine Kinase (CK)', short: 'CK', aliases: ['ck', 'cpk'], category: 'other', unit: 'U/L', typical: { male: '39-308', female: '26-192' }, better: 'range', about: 'A muscle enzyme. It rises after hard exercise or muscle injury.' },
];

/** Common panels, for entering a whole report at once. */
export const PANELS: { id: string; name: string; tests: string[] }[] = [
  { id: 'lipid', name: 'Lipid panel', tests: ['total-chol', 'ldl', 'hdl', 'trig', 'non-hdl', 'vldl'] },
  { id: 'bmp', name: 'Basic metabolic panel (BMP)', tests: ['sodium', 'potassium', 'chloride', 'co2', 'calcium', 'glucose-fasting', 'bun', 'creatinine', 'egfr'] },
  {
    id: 'cmp', name: 'Comprehensive metabolic panel (CMP)',
    tests: ['sodium', 'potassium', 'chloride', 'co2', 'calcium', 'glucose-fasting', 'bun', 'creatinine', 'egfr', 'total-protein', 'albumin', 'globulin', 'ag-ratio', 'tbili', 'alp', 'ast', 'alt'],
  },
  { id: 'cbc', name: 'Complete blood count (CBC)', tests: ['wbc', 'rbc', 'hgb', 'hct', 'mcv', 'mch', 'mchc', 'rdw', 'plt', 'mpv'] },
  { id: 'cbc-diff', name: 'CBC with differential', tests: ['wbc', 'rbc', 'hgb', 'hct', 'mcv', 'mch', 'mchc', 'rdw', 'plt', 'mpv', 'neut-pct', 'lymph-pct', 'mono-pct', 'eos-pct', 'baso-pct', 'anc', 'alc', 'amc', 'aec', 'abc'] },
  { id: 'hepatic', name: 'Liver (hepatic) panel', tests: ['alt', 'ast', 'alp', 'tbili', 'dbili', 'albumin', 'total-protein'] },
  { id: 'thyroid', name: 'Thyroid panel', tests: ['tsh', 'ft4', 'ft3'] },
  { id: 'iron', name: 'Iron studies', tests: ['iron', 'tibc', 'tsat', 'ferritin', 'transferrin'] },
  { id: 'diabetes', name: 'Diabetes screening', tests: ['a1c', 'glucose-fasting'] },
];

export function searchTests(all: LabTest[], q: string, category?: CategoryId | ''): LabTest[] {
  const needle = q.trim().toLowerCase();
  const pool = category ? all.filter((t) => t.category === category) : all;
  if (!needle) return [...pool].sort((a, b) => Number(!!b.primary) - Number(!!a.primary));
  const score = (t: LabTest) => {
    const names = [t.name, t.short ?? '', ...(t.aliases ?? [])].map((s) => s.toLowerCase());
    if (names.some((n) => n === needle)) return 0;
    if (names.some((n) => n.startsWith(needle))) return 1;
    if (names.some((n) => n.includes(needle))) return 2;
    return 9;
  };
  return pool
    .map((t) => [t, score(t)] as const)
    .filter(([, s]) => s < 9)
    .sort((a, b) => a[1] - b[1] || Number(!!b[0].primary) - Number(!!a[0].primary))
    .map(([t]) => t);
}
