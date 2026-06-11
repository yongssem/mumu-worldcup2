// 무무월드컵2 — 물리(알까기) 게임 상수 · 가로(landscape) 필드

// 논리 필드 크기 (가로형). 골대는 좌/우 벽.
export const FW = 960;   // 필드 가로
export const FH = 600;   // 필드 세로
export const GOAL_H = 190; // 골대 입구 높이(세로)

export const PIECE_R = 18; // 조각 반지름
export const BALL_R = 12;  // 공 반지름
export const PIECE_MASS = 3;
export const BALL_MASS = 1;

// 물리 상수
export const FRICTION = 0.977;   // 매 프레임 감속
export const STOP = 0.13;         // 이 속도 이하면 정지로 간주
export const RESTITUTION = 0.92;  // 충돌 반발 계수
export const WALL_DAMP = 0.78;    // 벽 반사 감쇠
export const MAX_SPEED = 22;      // 튕기기 최대 속도
export const POWER = 0.12;        // (참고용) 드래그 → 속도 배율
export const MAX_DRAG = 220;      // 조준 최대 드래그 거리(논리)

export const MAX_TURNS = 24;      // 총 턴(양 팀 합산)

// 팀: home=왼쪽(파랑, 오른쪽 골 공격), away=오른쪽(빨강, 왼쪽 골 공격)
export const TEAM = {
  home: { id: 'home', name: '우리팀', color: '#2563eb', dark: '#1e3a8a' },
  away: { id: 'away', name: '상대팀', color: '#ef4444', dark: '#991b1b' },
};

// 월드컵 16강 출전 팀
export const TEAMS = [
  '무무 코리아 🇰🇷', '브라질 🇧🇷', '독일 🇩🇪', '아르헨티나 🇦🇷',
  '프랑스 🇫🇷', '스페인 🇪🇸', '잉글랜드 🏴', '이탈리아 🇮🇹',
  '네덜란드 🇳🇱', '포르투갈 🇵🇹', '일본 🇯🇵', '멕시코 🇲🇽',
  '미국 🇺🇸', '크로아티아 🇭🇷', '벨기에 🇧🇪', '우루과이 🇺🇾',
];
export const PLAYER_TEAM = TEAMS[0]; // 플레이어는 무무 코리아
