// src/data/insurance.ts
// 건강보험 급여 및 실손보험 정보 (2026년 기준 정적 데이터)

export interface DrugInsuranceInfo {
  name: string;
  genericName: string;
  manufacturer: string;
  coverageStatus: '급여' | '선별급여' | '비급여';
  coverageRate: string; // 본인부담률
  monthlyEstimate: string; // 월 예상 비용
  eligibilityBmi: string;
  eligibilityConditions: string[];
  notes: string;
}

export interface EligibilityCriteria {
  title: string;
  items: string[];
}

export interface RealInsuranceItem {
  question: string;
  answer: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const drugInsuranceData: DrugInsuranceInfo[] = [
  {
    name: '위고비',
    genericName: '세마글루타이드 2.4mg',
    manufacturer: '노보 노디스크',
    coverageStatus: '비급여',
    coverageRate: '100% 본인부담',
    monthlyEstimate: '약 30만~50만 원',
    eligibilityBmi: '비급여 적용 — BMI 기준 무관',
    eligibilityConditions: ['현재 건강보험 급여 적용 없음', '처방 의사의 판단에 따라 처방 가능'],
    notes: '2026년 현재 국내 건강보험 급여 적용 대상이 아닙니다. 향후 급여화 논의가 진행 중입니다.',
  },
  {
    name: '삭센다',
    genericName: '리라글루타이드 3mg',
    manufacturer: '노보 노디스크',
    coverageStatus: '선별급여',
    coverageRate: '50% 본인부담 (급여 적용 시)',
    monthlyEstimate: '급여 시 약 7만~12만 원 / 비급여 시 약 20만~30만 원',
    eligibilityBmi: 'BMI ≥ 30 또는 BMI ≥ 27 + 동반질환',
    eligibilityConditions: [
      'BMI 30 이상',
      'BMI 27 이상 + 제2형 당뇨병',
      'BMI 27 이상 + 고혈압',
      'BMI 27 이상 + 이상지질혈증',
      '식이요법·운동요법으로 체중 감량 실패 이력',
    ],
    notes: '급여 적용 여부는 심사평가원 기준에 따라 달라지며, 요양급여 인정기준 충족 여부를 담당 의사와 확인해야 합니다.',
  },
  {
    name: '마운자로',
    genericName: '티르제파타이드',
    manufacturer: '일라이 릴리',
    coverageStatus: '비급여',
    coverageRate: '100% 본인부담',
    monthlyEstimate: '약 40만~70만 원',
    eligibilityBmi: '비급여 적용 — BMI 기준 무관',
    eligibilityConditions: ['현재 건강보험 급여 적용 없음', '당뇨 동반 시 별도 급여 적용 가능성 (담당 의사 확인 필요)'],
    notes: '비만 치료 목적으로는 비급여입니다. 제2형 당뇨병 치료 목적으로는 별도 급여 기준이 적용될 수 있습니다.',
  },
];

export const eligibilityCriteriaList: EligibilityCriteria[] = [
  {
    title: 'BMI 기준',
    items: [
      'BMI 30 이상: 단독 조건으로 급여 검토 가능 (삭센다)',
      'BMI 27~29.9: 동반질환 조건 충족 시 급여 검토 가능 (삭센다)',
      'BMI 27 미만: 현재 급여 적용 기준 미해당',
    ],
  },
  {
    title: '인정되는 동반질환 조건',
    items: [
      '제2형 당뇨병 (혈당 조절 불량 포함)',
      '고혈압 (수축기 혈압 140mmHg 이상 또는 치료 중)',
      '이상지질혈증 (LDL 콜레스테롤 상승 또는 치료 중)',
      '수면무호흡증 (수면다원검사 진단)',
      '비알코올성 지방간질환 (NAFLD)',
    ],
  },
  {
    title: '추가 요건',
    items: [
      '식이요법·운동요법을 3개월 이상 시행했으나 체중 감량 실패 이력',
      '이전 비만 약물 치료 이력 (일부 경우)',
      '내분비계 질환으로 인한 비만이 아닌 경우',
    ],
  },
];

export const realInsuranceItems: RealInsuranceItem[] = [
  {
    question: '실손보험으로 GLP-1 비만치료제를 청구할 수 있나요?',
    answer:
      '대부분의 경우 불가능합니다. GLP-1 비만치료제는 미용·비만 치료 목적으로 처방될 경우 실손보험 표준약관상 "미용 목적 치료"로 분류되어 보장 제외 항목에 해당합니다.',
  },
  {
    question: '당뇨 치료 목적으로 처방받으면 실손보험 적용이 가능한가요?',
    answer:
      '제2형 당뇨병 치료 목적으로 처방된 경우, 담당 의사의 진단서와 처방전을 첨부하여 청구하면 일부 실손보험에서 인정될 수 있습니다. 단, 보험사 및 약관에 따라 차이가 있으므로 개별 확인이 필요합니다.',
  },
  {
    question: '실손보험 청구 시 주의사항은 무엇인가요?',
    answer:
      '처방 목적(비만 vs. 당뇨)을 명확히 명시한 진료기록부와 처방전을 보험사에 제출해야 합니다. 비만 치료 목적으로 처방된 경우 보장이 거부될 가능성이 높습니다.',
  },
];

export const faqs: FaqItem[] = [
  {
    question: '위고비는 건강보험이 적용되나요?',
    answer:
      '2026년 현재 위고비(세마글루타이드 2.4mg)는 건강보험 급여 적용이 되지 않습니다. 100% 본인부담으로 월 30만~50만 원 수준의 비용이 발생합니다. 향후 급여화 논의가 진행 중이므로 최신 정보는 건강보험심사평가원(www.hira.or.kr)에서 확인하세요.',
  },
  {
    question: '삭센다 급여를 받으려면 어떤 조건이 필요한가요?',
    answer:
      'BMI 30 이상이거나, BMI 27 이상에 제2형 당뇨병·고혈압·이상지질혈증 중 하나 이상의 동반질환이 있어야 합니다. 또한 식이요법과 운동요법을 일정 기간 시행했음에도 체중 감량에 실패한 이력이 요구될 수 있습니다.',
  },
  {
    question: '마운자로는 급여 적용이 되나요?',
    answer:
      '비만 치료 목적으로는 급여가 적용되지 않습니다. 다만 제2형 당뇨병 치료를 위한 처방인 경우 별도의 급여 기준이 적용될 수 있으므로, 담당 의사와 상담하시기 바랍니다.',
  },
  {
    question: 'GLP-1 약물을 실손보험으로 청구할 수 있나요?',
    answer:
      '비만 치료 목적인 경우 대부분 실손보험 보장 제외 항목에 해당합니다. 제2형 당뇨병 치료 목적으로 처방된 경우 일부 보험사에서 인정될 수 있으나, 개인 보험 약관을 반드시 확인하세요.',
  },
  {
    question: '보험 기준이 바뀔 수도 있나요?',
    answer:
      '네. 건강보험 급여 기준은 보건복지부·건강보험심사평가원의 고시에 따라 변경될 수 있습니다. 최신 급여 기준은 건강보험심사평가원 홈페이지(www.hira.or.kr) 또는 담당 의사를 통해 확인하시기 바랍니다.',
  },
  {
    question: '급여 적용 신청은 어떻게 하나요?',
    answer:
      '별도로 환자가 신청하는 절차는 없습니다. 담당 의사가 처방 시 급여 기준 충족 여부를 확인하고 급여 처방을 발행합니다. 급여 요건 충족 여부는 의사와 상담하세요.',
  },
];
