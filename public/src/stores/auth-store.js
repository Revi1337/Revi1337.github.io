import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    nickname: null,
    accessToken: null,
    isAuthenticated: false,
    // roles: 'ROLE_MANAGER'
    roles: null
  }),
  persist: true
});

// []는 유저라면 누구나 접근가능(client, admin)
// [“admin”]는 어드민 권한을 가져야 접근가능
// [“client”]는 클라이언트 권한을 가져야 접근가능
// meta 속성에 따로 정의해주지 않았다면 아무나 접근가능
