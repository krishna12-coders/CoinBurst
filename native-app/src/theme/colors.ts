export const colors = {
  dark: {
    bg: '#07050F',
    card: '#0B0B0F',
    cardBorder: '#1E1E26',
    text: '#FFFFFF',
    textMuted: '#9CA3AF',
    accent: '#00FF88',
    accentPink: '#FF007F',
    income: '#10B981',
    expense: '#EF4444',
    input: '#1E1E26',
    tabBar: '#0B0B0F',
    tabActive: '#00FF88',
    tabInactive: '#4B5563',
  },
  cyberpunk: {
    bg: '#12042C',
    card: '#1F0E3D',
    cardBorder: '#FF007F',
    text: '#FFE600',
    textMuted: '#A8A29E',
    accent: '#FFE600',
    accentPink: '#FF007F',
    income: '#39FF14',
    expense: '#FF007F',
    input: '#12042C',
    tabBar: '#1F0E3D',
    tabActive: '#FFE600',
    tabInactive: '#FF007F',
  },
  synthwave: {
    bg: '#0A0516',
    card: '#120B24',
    cardBorder: '#FF007F',
    text: '#00E5FF',
    textMuted: '#9A8EA9',
    accent: '#00E5FF',
    accentPink: '#FF007F',
    income: '#00E5FF',
    expense: '#FF007F',
    input: '#0A0516',
    tabBar: '#120B24',
    tabActive: '#00E5FF',
    tabInactive: '#FF007F',
  },
};

export type ThemeColors = typeof colors.dark;

export const getThemeColors = (theme: string): ThemeColors => {
  return colors[theme as keyof typeof colors] || colors.dark;
};
