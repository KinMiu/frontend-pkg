import React, { createContext, useContext, useEffect, useState } from 'react';
import { settingsAPI } from '../../services/api';

type ThemeId = 'default' | 'dark' | 'softBlue';
type PaletteId =
  // default / lama
  | 'white'
  | 'black'
  | 'blue'
  | 'yellow'
  | 'gray'
  | 'green'
  | 'purple'
  | 'orange'
  // abu terang → putih
  | 'grayD1D5DB'
  | 'gray9CA3AF'
  | 'gray6B7280'
  | 'gray4B5563'
  | 'gray374151'
  | 'gray1F2937'
  | 'gray111827'
  | 'grayE5E7EB'
  | 'grayF3F4F6'
  | 'grayF9FAFB'
  // merah
  | 'red7F1D1D'
  | 'red991B1B'
  | 'redB91C1C'
  | 'redDC2626'
  | 'redEF4444'
  | 'redF87171'
  | 'redFCA5A5'
  // ungu
  | 'purple4C1D95'
  | 'purple5B21B6'
  | 'purple6D28D9'
  | 'purple7C3AED'
  | 'purple8B5CF6'
  | 'purpleA78BFA'
  | 'purpleC4B5FD'
  // biru
  | 'blue1E3A8A'
  | 'blue1D4ED8'
  | 'blue2563EB'
  | 'blue3B82F6'
  | 'blue60A5FA'
  | 'blue93C5FD'
  | 'blueBFDBFE'
  // cyan / biru muda
  | 'cyan164E63'
  | 'cyan0E7490'
  | 'cyan0891B2'
  | 'cyan06B6D4'
  | 'cyan22D3EE'
  | 'cyan67E8F9'
  | 'cyanCFFAFE'
  // hijau
  | 'green14532D'
  | 'green166534'
  | 'green15803D'
  | 'green16A34A'
  | 'green22C55E'
  | 'green4ADE80'
  | 'green86EFAC'
  // kuning
  | 'yellow713F12'
  | 'yellow854D0E'
  | 'yellowA16207'
  | 'yellowCA8A04'
  | 'yellowEAB308'
  | 'yellowFACC15'
  | 'yellowFDE047'
  // orange
  | 'orange7C2D12'
  | 'orange9A3412'
  | 'orangeC2410C'
  | 'orangeEA580C'
  | 'orangeF97316'
  | 'orangeFB923C'
  | 'orangeFDBA74'
  // coklat
  | 'brown451A03'
  | 'brown78350F'
  | 'brown92400E'
  | 'brownB45309'
  | 'brownD97706'
  | 'brownF59E0B'
  | 'brownFBBF24';

interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  sidebarBg: string;
  sidebarText: string;
  sidebarBorder: string;
  navActive: string;
  navInactive: string;
  headerBg: string;
  headerBorder: string;
  mainBg: string;
}

interface ThemeContextValue {
  theme: ThemeConfig;
  // pilihan granular (sekarang hanya sidebar & header)
  sidebarTheme: PaletteId;
  headerTheme: PaletteId;
  setPalette: (part: 'sidebar' | 'header', value: PaletteId) => void;
  sidebarTextColor: 'black' | 'white';
  headerTextColor: 'black' | 'white';
  setTextColor: (part: 'sidebar' | 'header', value: 'black' | 'white') => void;
  getBgClass: (id: PaletteId) => string;
  availablePalettes: {
    id: PaletteId;
    name: string;
    bgClass: string;
    textClass: string;
  }[];
  loading: boolean;
}

const themes: ThemeConfig[] = [
  {
    id: 'default',
    name: 'Default Cerah',
    description: 'Sidebar putih dengan aksen biru, tampilan bersih dan profesional.',
    sidebarBg: 'bg-white',
    sidebarText: 'text-gray-800',
    sidebarBorder: 'border-gray-200',
    navActive: 'bg-blue-500 text-white',
    navInactive: 'text-gray-700 hover:bg-blue-100 hover:text-blue-600',
    headerBg: 'bg-white',
    headerBorder: 'border-gray-200',
    mainBg: 'bg-gray-50',
  },
  {
    id: 'dark',
    name: 'Gelap Modern',
    description: 'Sidebar gelap dengan aksen biru neon, cocok untuk ruangan redup.',
    sidebarBg: 'bg-slate-900',
    sidebarText: 'text-slate-100',
    sidebarBorder: 'border-slate-800',
    navActive: 'bg-blue-600 text-white',
    navInactive: 'text-slate-300 hover:bg-slate-800 hover:text-white',
    headerBg: 'bg-slate-900',
    headerBorder: 'border-slate-800',
    mainBg: 'bg-slate-900',
  },
  {
    id: 'softBlue',
    name: 'Biru Lembut',
    description: 'Sidebar biru muda dengan konten utama terang dan lembut.',
    sidebarBg: 'bg-blue-50',
    sidebarText: 'text-blue-900',
    sidebarBorder: 'border-blue-100',
    navActive: 'bg-blue-600 text-white',
    navInactive: 'text-blue-800 hover:bg-blue-100 hover:text-blue-700',
    headerBg: 'bg-white',
    headerBorder: 'border-blue-100',
    mainBg: 'bg-slate-50',
  },
];

const palettes: { id: PaletteId; name: string; bgClass: string; textClass: string }[] = [
  // bawaan / netral
  { id: 'white', name: '#FFFFFF (Putih)', bgClass: 'bg-white', textClass: 'text-gray-900' },
  { id: 'black', name: '#000000 (Hitam)', bgClass: 'bg-black', textClass: 'text-white' },

  // Merah
  { id: 'red7F1D1D', name: '#7F1D1D', bgClass: 'bg-red-900', textClass: 'text-white' },
  { id: 'red991B1B', name: '#991B1B', bgClass: 'bg-red-800', textClass: 'text-white' },
  { id: 'redB91C1C', name: '#B91C1C', bgClass: 'bg-red-700', textClass: 'text-white' },
  { id: 'redDC2626', name: '#DC2626', bgClass: 'bg-red-600', textClass: 'text-white' },
  { id: 'redEF4444', name: '#EF4444', bgClass: 'bg-red-500', textClass: 'text-white' },
  { id: 'redF87171', name: '#F87171', bgClass: 'bg-red-400', textClass: 'text-black' },
  { id: 'redFCA5A5', name: '#FCA5A5', bgClass: 'bg-red-300', textClass: 'text-black' },

  // Ungu
  { id: 'purple4C1D95', name: '#4C1D95', bgClass: 'bg-violet-900', textClass: 'text-white' },
  { id: 'purple5B21B6', name: '#5B21B6', bgClass: 'bg-violet-800', textClass: 'text-white' },
  { id: 'purple6D28D9', name: '#6D28D9', bgClass: 'bg-violet-700', textClass: 'text-white' },
  { id: 'purple7C3AED', name: '#7C3AED', bgClass: 'bg-violet-600', textClass: 'text-white' },
  { id: 'purple8B5CF6', name: '#8B5CF6', bgClass: 'bg-violet-500', textClass: 'text-white' },
  { id: 'purpleA78BFA', name: '#A78BFA', bgClass: 'bg-violet-400', textClass: 'text-black' },
  { id: 'purpleC4B5FD', name: '#C4B5FD', bgClass: 'bg-violet-300', textClass: 'text-black' },

  // Biru
  { id: 'blue1E3A8A', name: '#1E3A8A', bgClass: 'bg-blue-900', textClass: 'text-white' },
  { id: 'blue1D4ED8', name: '#1D4ED8', bgClass: 'bg-blue-700', textClass: 'text-white' },
  { id: 'blue2563EB', name: '#2563EB', bgClass: 'bg-blue-600', textClass: 'text-white' },
  { id: 'blue3B82F6', name: '#3B82F6', bgClass: 'bg-blue-500', textClass: 'text-white' },
  { id: 'blue60A5FA', name: '#60A5FA', bgClass: 'bg-blue-400', textClass: 'text-black' },
  { id: 'blue93C5FD', name: '#93C5FD', bgClass: 'bg-blue-300', textClass: 'text-black' },
  { id: 'blueBFDBFE', name: '#BFDBFE', bgClass: 'bg-blue-200', textClass: 'text-black' },

  // Cyan / biru muda
  { id: 'cyan164E63', name: '#164E63', bgClass: 'bg-cyan-900', textClass: 'text-white' },
  { id: 'cyan0E7490', name: '#0E7490', bgClass: 'bg-cyan-700', textClass: 'text-white' },
  { id: 'cyan0891B2', name: '#0891B2', bgClass: 'bg-cyan-600', textClass: 'text-white' },
  { id: 'cyan06B6D4', name: '#06B6D4', bgClass: 'bg-cyan-500', textClass: 'text-white' },
  { id: 'cyan22D3EE', name: '#22D3EE', bgClass: 'bg-cyan-400', textClass: 'text-black' },
  { id: 'cyan67E8F9', name: '#67E8F9', bgClass: 'bg-cyan-300', textClass: 'text-black' },
  { id: 'cyanCFFAFE', name: '#CFFAFE', bgClass: 'bg-cyan-100', textClass: 'text-black' },

  // Hijau
  { id: 'green14532D', name: '#14532D', bgClass: 'bg-green-900', textClass: 'text-white' },
  { id: 'green166534', name: '#166534', bgClass: 'bg-green-700', textClass: 'text-white' },
  { id: 'green15803D', name: '#15803D', bgClass: 'bg-green-600', textClass: 'text-white' },
  { id: 'green16A34A', name: '#16A34A', bgClass: 'bg-green-500', textClass: 'text-white' },
  { id: 'green22C55E', name: '#22C55E', bgClass: 'bg-green-400', textClass: 'text-black' },
  { id: 'green4ADE80', name: '#4ADE80', bgClass: 'bg-green-300', textClass: 'text-black' },
  { id: 'green86EFAC', name: '#86EFAC', bgClass: 'bg-green-200', textClass: 'text-black' },

  // Kuning
  { id: 'yellow713F12', name: '#713F12', bgClass: 'bg-amber-900', textClass: 'text-white' },
  { id: 'yellow854D0E', name: '#854D0E', bgClass: 'bg-amber-800', textClass: 'text-white' },
  { id: 'yellowA16207', name: '#A16207', bgClass: 'bg-amber-700', textClass: 'text-white' },
  { id: 'yellowCA8A04', name: '#CA8A04', bgClass: 'bg-amber-600', textClass: 'text-black' },
  { id: 'yellowEAB308', name: '#EAB308', bgClass: 'bg-yellow-500', textClass: 'text-black' },
  { id: 'yellowFACC15', name: '#FACC15', bgClass: 'bg-yellow-400', textClass: 'text-black' },
  { id: 'yellowFDE047', name: '#FDE047', bgClass: 'bg-yellow-300', textClass: 'text-black' },

  // Orange
  { id: 'orange7C2D12', name: '#7C2D12', bgClass: 'bg-orange-900', textClass: 'text-white' },
  { id: 'orange9A3412', name: '#9A3412', bgClass: 'bg-orange-800', textClass: 'text-white' },
  { id: 'orangeC2410C', name: '#C2410C', bgClass: 'bg-orange-700', textClass: 'text-white' },
  { id: 'orangeEA580C', name: '#EA580C', bgClass: 'bg-orange-600', textClass: 'text-black' },
  { id: 'orangeF97316', name: '#F97316', bgClass: 'bg-orange-500', textClass: 'text-black' },
  { id: 'orangeFB923C', name: '#FB923C', bgClass: 'bg-orange-400', textClass: 'text-black' },
  { id: 'orangeFDBA74', name: '#FDBA74', bgClass: 'bg-orange-300', textClass: 'text-black' },

  // Coklat (menggunakan amber sebagai pendekatan)
  { id: 'brown451A03', name: '#451A03', bgClass: 'bg-amber-950', textClass: 'text-white' },
  { id: 'brown78350F', name: '#78350F', bgClass: 'bg-amber-900', textClass: 'text-white' },
  { id: 'brown92400E', name: '#92400E', bgClass: 'bg-amber-800', textClass: 'text-white' },
  { id: 'brownB45309', name: '#B45309', bgClass: 'bg-amber-700', textClass: 'text-white' },
  { id: 'brownD97706', name: '#D97706', bgClass: 'bg-amber-600', textClass: 'text-black' },
  { id: 'brownF59E0B', name: '#F59E0B', bgClass: 'bg-amber-500', textClass: 'text-black' },
  { id: 'brownFBBF24', name: '#FBBF24', bgClass: 'bg-amber-400', textClass: 'text-black' },

  // Abu-abu
  { id: 'gray111827', name: '#111827', bgClass: 'bg-gray-900', textClass: 'text-white' },
  { id: 'gray1F2937', name: '#1F2937', bgClass: 'bg-gray-800', textClass: 'text-white' },
  { id: 'gray374151', name: '#374151', bgClass: 'bg-gray-700', textClass: 'text-white' },
  { id: 'gray4B5563', name: '#4B5563', bgClass: 'bg-gray-600', textClass: 'text-white' },
  { id: 'gray6B7280', name: '#6B7280', bgClass: 'bg-gray-500', textClass: 'text-white' },
  { id: 'gray9CA3AF', name: '#9CA3AF', bgClass: 'bg-gray-400', textClass: 'text-black' },
  { id: 'grayD1D5DB', name: '#D1D5DB', bgClass: 'bg-gray-300', textClass: 'text-black' },
  { id: 'grayE5E7EB', name: '#E5E7EB', bgClass: 'bg-gray-200', textClass: 'text-black' },
  { id: 'grayF3F4F6', name: '#F3F4F6', bgClass: 'bg-gray-100', textClass: 'text-black' },
  { id: 'grayF9FAFB', name: '#F9FAFB', bgClass: 'bg-gray-50', textClass: 'text-black' },
];

const getPaletteById = (id: PaletteId) => {
  return palettes.find((p) => p.id === id) ?? palettes[0];
};

const getThemeById = (id: ThemeId): ThemeConfig => {
  return themes.find((t) => t.id === id) ?? themes[0];
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>('default');
  const [sidebarTheme, setSidebarTheme] = useState<PaletteId>('white');
  const [headerTheme, setHeaderTheme] = useState<PaletteId>('white');
  const [sidebarTextColor, setSidebarTextColor] = useState<'black' | 'white'>('white');
  const [headerTextColor, setHeaderTextColor] = useState<'black' | 'white'>('black');
  const [loading, setLoading] = useState<boolean>(true);

  // Load current theme from backend on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await settingsAPI.getTheme();
        const serverTheme = data.activeTheme as ThemeId;
        if (mounted && (serverTheme === 'default' || serverTheme === 'dark' || serverTheme === 'softBlue')) {
          setThemeId(serverTheme);
        }
        // granular palettes
        const s = (data.sidebarTheme as PaletteId) || 'white';
        const h = (data.headerTheme as PaletteId) || 'white';
        const st = (data.sidebarTextColor as 'black' | 'white') || 'white';
        const ht = (data.headerTextColor as 'black' | 'white') || 'black';
        if (mounted) {
          setSidebarTheme(s);
          setHeaderTheme(h);
          setSidebarTextColor(st);
          setHeaderTextColor(ht);
        }
      } catch (error) {
        console.error('Failed to load theme setting, fallback to default.', error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSetPalette: ThemeContextValue['setPalette'] = (part, value) => {
    if (part === 'sidebar') setSidebarTheme(value);
    if (part === 'header') setHeaderTheme(value);
    settingsAPI
      .updateTheme({
        sidebarTheme: part === 'sidebar' ? value : sidebarTheme,
        headerTheme: part === 'header' ? value : headerTheme,
        sidebarTextColor,
        headerTextColor,
      })
      .catch((err) => console.error('Failed to persist palette setting', err));
  };

  const handleSetTextColor: ThemeContextValue['setTextColor'] = (part, value) => {
    if (part === 'sidebar') setSidebarTextColor(value);
    if (part === 'header') setHeaderTextColor(value);
    settingsAPI
      .updateTheme({
        sidebarTheme,
        headerTheme,
        sidebarTextColor: part === 'sidebar' ? value : sidebarTextColor,
        headerTextColor: part === 'header' ? value : headerTextColor,
      })
      .catch((err) => console.error('Failed to persist text color setting', err));
  };

  const value: ThemeContextValue = {
    theme: getThemeById(themeId),
    sidebarTheme,
    headerTheme,
    sidebarTextColor,
    headerTextColor,
    setPalette: handleSetPalette,
    setTextColor: handleSetTextColor,
    availablePalettes: palettes,
    getBgClass: (id: PaletteId) => getPaletteById(id).bgClass,
    loading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

