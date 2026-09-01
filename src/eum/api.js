// ============================================================================
// 외부 API 클라이언트 — EumApp 단일파일에서 분리 (단일파일 분해 1단계 · 로직 100% 동일)
//   callClaude: AI 매칭 추천 & 월간 리포트 요약에 쓰는 Anthropic Messages 호출 헬퍼.
//   기존 EumApp.jsx 내부 정의를 그대로 이동만 했다(동작 불변). 호출부는 import 로 연결.
//
// ⚠️ 상용화 주의(사람 승인 필요 · P1): 이 함수는 브라우저에서 api.anthropic.com 을
//    직접 호출한다. (1) 현재 Authorization/x-api-key 헤더가 없어 운영에서 401 이며,
//    (2) 클라이언트에 API 키를 노출하면 안 되므로 반드시 서버(프록시) 경유로 바꿔야 한다.
//    → 백엔드 프록시 엔드포인트 신설 후 fetch 대상 URL 을 교체하는 별도 회차에서 처리.
//    이번 회차는 "분리"만 수행하고 동작·값은 바꾸지 않는다.
// ============================================================================

import { startRequest, statusCode } from './reqlog.js';

export async function callClaude({ system, user, maxTokens = 1024 }) {
  // 구조화 로깅: 요청 ID·소요시간·에러코드를 남긴다(프롬프트 본문은 기록하지 않는다).
  const req = startRequest('api.claude', { maxTokens });
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    });
    if (!res.ok) {
      const err = new Error(`API ${res.status}`);
      err.code = statusCode(res.status);
      throw err;
    }
    const data = await res.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
    req.succeed({ status: res.status, chars: text.length });
    return text;
  } catch (e) {
    req.fail(e);            // 동작 불변: 기록만 하고 그대로 다시 던진다
    console.error('Claude API error:', e);
    throw e;
  }
}
