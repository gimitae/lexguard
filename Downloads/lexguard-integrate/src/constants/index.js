// Feature highlights for landing page
export const FEATURE_LIST = [
  {
    id: 'red-flag',
    text: '독소 조항(Red Flag) 즉시 식별',
    icon: 'AlertTriangle'
  },
  {
    id: 'legal-basis',
    text: '법적 근거 및 판례 데이터 기반 설명',
    icon: 'Scale'
  },
  {
    id: 'drafting',
    text: '대안 조항(Drafting) 원클릭 복사',
    icon: 'FileText'
  }
];

// Risk severity levels (백엔드 API 응답과 호환되도록 상세화)
export const RISK_SEVERITY = {
  CRITICAL: {
    value: 'critical',
    label: '치명적',
    color: 'red',
    bgClass: 'bg-red-50',
    borderClass: 'border-red-600',
    textClass: 'text-red-700',
    badgeClass: 'bg-red-700'
  },
  HIGH: {
    value: 'high',
    label: '높음',
    color: 'red',
    bgClass: 'bg-red-50',
    borderClass: 'border-red-500',
    textClass: 'text-red-600',
    badgeClass: 'bg-red-600'
  },
  MEDIUM: {
    value: 'medium',
    label: '주의',
    color: 'amber',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-600',
    badgeClass: 'bg-amber-600'
  },
  LOW: {
    value: 'low',
    label: '낮음',
    color: 'green',
    bgClass: 'bg-green-50',
    borderClass: 'border-green-500',
    textClass: 'text-green-600',
    badgeClass: 'bg-green-600'
  },
  NONE: {
    value: 'none',
    label: '안전',
    color: 'blue',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-600',
    badgeClass: 'bg-blue-600'
  }
};

// File validation (OCR을 위해 이미지 파일 형식 포함)
export const FILE_CONFIG = {
  MAX_SIZE: 20 * 1024 * 1024, // 20MB
  ALLOWED_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg'
  ],
  ALLOWED_EXTENSIONS: ['pdf', 'docx', 'png', 'jpg', 'jpeg']
};

// Error messages
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: '파일 크기는 20MB를 초과할 수 없습니다.',
  INVALID_FILE_TYPE: 'PDF, DOCX, PNG, JPG 파일만 업로드 가능합니다.',
  NO_FILE_SELECTED: '파일을 선택해주세요.',
  UPLOAD_FAILED: '파일 업로드에 실패했습니다. 다시 시도해주세요.',
  ANALYSIS_FAILED: '분석 중 오류가 발생했습니다. 다시 시도해주세요.'
};

// UI Text
export const UI_TEXT = {
  LANDING_TITLE: '계약서 리스크를',
  LANDING_TITLE_HIGHLIGHT: '3분 안에 찾으세요',
  LANDING_SUBTITLE: '회원가입 없이 파일을 업로드하여 인공지능의 리스크 분석 결과를 즉시 확인하세요.',
  UPLOAD_TITLE: 'PDF, Word 또는 이미지 파일을 드래그하세요',
  UPLOAD_SUBTITLE: '최대 20MB까지 업로드 가능',
  UPLOAD_BUTTON: '내 컴퓨터에서 파일 찾기'
};

// Demo data
export const DEMO_ANALYSIS_RESULT = {
  risks: {
    critical: 1,
    warning: 2,
    info: 0
  },
  details: [
    {
      id: 'R1',
      severity: 'high',
      title: '부당해고 금지 조항 위반',
      description: '근로기준법 제23조에 의거, 정당한 이유 없는 해고는 무효입니다. "별도 절차 없이"라는 문구는 법적 효력이 없습니다.',
      legalBasis: '근로기준법 제23조 제1항',
      suggestion: '갑은 정당한 이유가 있는 경우 근로기준법의 절차에 따라 해지할 수 있다.',
      position: { start: 120, end: 165 }
    },
    {
      id: 'R2',
      severity: 'medium',
      title: '경업금지 기간 과도',
      description: '퇴사 후 10년간 동종업종 취업 금지는 과도한 제한으로 무효 가능성이 높습니다.',
      legalBasis: '대법원 2021다234567 판결',
      suggestion: '퇴사 후 1년간 직접 경쟁관계에 있는 동종업종에 취업할 수 없다.',
      position: { start: 200, end: 240 }
    }
  ]
};