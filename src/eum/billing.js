// ============================================================================
// billing.js — 구독결제 스캐폴딩 (PortOne · Toss Payments)
//   상태: [승인 필요] — 기본 비활성(BILLING_ENABLED=false). 실결제·실키 연동 금지.
//   목적: "build now, activate on approval". 결제 UI/플로우를 코드로 준비하되
//         실제 결제 호출은 승인 전까지 가드로 차단한다. 테스트키만 사용.
//
//   활성화 절차(승인 후):
//     1) .env 에 VITE_BILLING_ENABLED=true
//     2) VITE_PAYMENT_PROVIDER=portone | toss
//     3) 각 provider 테스트키(아래 참조) 설정 → 검수 후 라이브키 교체
//     4) 서버측 결제검증·웹훅 엔드포인트 신설(클라이언트 단독 결제 금지)
// ============================================================================

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

// 실제 결제 호출 마스터 스위치. 기본 OFF — 승인 전에는 절대 true 금지.
export const BILLING_ENABLED = String(env.VITE_BILLING_ENABLED) === 'true';

// 결제사 선택: 'portone'(아임포트/PortOne) | 'toss'(토스페이먼츠)
export const PAYMENT_PROVIDER = env.VITE_PAYMENT_PROVIDER || 'portone';

// ─── 요금제(ConsumerPricing 3단계와 동일 계약) ──────────────────────────────
// amount 는 원(KRW) 정수. free 는 결제 대상 아님.
export const PLANS = [
  { id: 'free',    name: '무료',        amount: 0,     interval: null,    sub: '동네 품앗이 기본',   feats: ['트리오 매칭·활동 일지', '봉사시간·상생카드 보상'] },
  { id: 'basic',   name: '안심 베이직', amount: 19900, interval: 'month', sub: '맞벌이 보호자에게',   feats: ['실시간 체크인·위치 알림', '주간 활동 리포트'] },
  { id: 'premium', name: '안심 프리미엄', amount: 39900, interval: 'month', sub: '가장 깊은 안심',   feats: ['우선 매칭', '월간 성장 리포트·상담'] },
];

// ─── 결제사 설정(테스트키 placeholder) ─────────────────────────────────────
// ⚠️ [승인 필요] 아래 키는 환경변수 주입용 placeholder 다. 소스에 실키 하드코딩 금지.
export const PROVIDER_CONFIG = {
  portone: {
    label: 'PortOne(아임포트)',
    // 테스트 채널/가맹점 식별자. 예: 'imp00000000' — 승인 후 발급값으로 교체.
    storeId: env.VITE_PORTONE_STORE_ID || 'test_imp_store',
    channelKey: env.VITE_PORTONE_CHANNEL_KEY || 'test_channel_key',
    sdkUrl: 'https://cdn.portone.io/v2/browser-sdk.js',
  },
  toss: {
    label: 'Toss Payments',
    // 토스 테스트 클라이언트키 형식(test_ck_...). 승인 후 라이브키로 교체.
    clientKey: env.VITE_TOSS_CLIENT_KEY || 'test_ck_placeholder',
    sdkUrl: 'https://js.tosspayments.com/v2/standard',
  },
};

// ─── 순수 헬퍼(테스트 가능) ────────────────────────────────────────────────
export function getPlan(planId) {
  return PLANS.find((p) => p.id === planId) || null;
}

export function isPaidPlan(planId) {
  const p = getPlan(planId);
  return !!p && p.amount > 0;
}

export function formatKRW(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '-';
  if (Number(amount) === 0) return '무료';
  return '₩' + Number(amount).toLocaleString('ko-KR');
}

// 결제 준비 오더 구성(서버 서명 전 클라이언트 프리페이로드). 실제 결제 아님.
export function buildOrderDraft(planId, { userRef = null } = {}) {
  const plan = getPlan(planId);
  if (!plan) return { ok: false, error: 'unknown_plan' };
  if (!isPaidPlan(planId)) return { ok: false, error: 'free_plan_no_payment' };
  return {
    ok: true,
    order: {
      planId: plan.id,
      orderName: `이음 ${plan.name} 구독`,
      amount: plan.amount,
      currency: 'KRW',
      interval: plan.interval,
      userRef: userRef || null,
      provider: PAYMENT_PROVIDER,
      // orderId 는 서버에서 발급·서명해야 한다(위변조 방지).
      _requiresServerSignature: true,
    },
  };
}

// 실제 구독 결제 요청 진입점 — 승인 전에는 가드로 차단.
// 반환: { ok, status, message } — 절대 여기서 실결제 호출을 수행하지 않는다.
export async function requestSubscription(planId, opts = {}) {
  const draft = buildOrderDraft(planId, opts);
  if (!draft.ok) return { ok: false, status: 'invalid', message: draft.error };

  if (!BILLING_ENABLED) {
    // [승인 필요] 실결제 비활성 — 스캐폴딩만 존재.
    return {
      ok: false,
      status: 'disabled',
      message: '[승인 필요] 결제 기능이 비활성 상태입니다. 승인 후 VITE_BILLING_ENABLED=true 및 서버 결제검증 연동이 필요합니다.',
      order: draft.order,
    };
  }

  // 활성화된 경우에도 서버 결제검증 엔드포인트가 없으면 진행 불가(클라이언트 단독 결제 금지).
  // 아래는 승인 후 provider SDK 로딩·서버 오더서명·결제창 호출을 구현할 지점(TODO).
  return {
    ok: false,
    status: 'not_implemented',
    message: '[승인 필요] 서버 결제검증·웹훅 엔드포인트 연동 후 provider 결제창을 호출하도록 구현하세요.',
    order: draft.order,
  };
}
