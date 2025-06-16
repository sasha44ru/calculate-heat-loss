export interface Material {
  id: number;
  name: string;
  conductivity: number; // λ, Вт/(м·°C)
  image?: string; // путь к изображению материала
  category?: 'wall' | 'insulation' | 'window' | 'floor' | 'roof';
  uValue?: number; // Для окон
}

export const MATERIALS: Material[] = [
  // Базовые материалы
  { id: 1, name: 'Железобетон', conductivity: 1.69, category: 'wall' },
  { id: 2, name: 'Кирпич керамический', conductivity: 0.56, category: 'wall' },
  { id: 3, name: 'Пеноплекс', conductivity: 0.033, category: 'insulation' },
  { id: 4, name: 'Минеральная вата', conductivity: 0.045, category: 'insulation' },
  { id: 5, name: 'Каменная вата', conductivity: 0.039, category: 'insulation' },
  { id: 6, name: 'Гипсокартон', conductivity: 0.22, category: 'wall' },
  { id: 7, name: 'ПГП', conductivity: 0.32, category: 'wall' },
  { id: 8, name: 'Дерево (сосна)', conductivity: 0.14, category: 'wall' },
  { id: 9, name: 'Гипсовая штукатурка', conductivity: 0.25, category: 'wall' },

  // Материалы для окон
  { id: 10, name: 'Однокамерный стеклопакет', conductivity: 2.8, category: 'window', uValue: 1.1 },
  { id: 11, name: 'Двухкамерный стеклопакет', conductivity: 1.9, category: 'window', uValue: 1.1 },
  { id: 12, name: 'Трехкамерный стеклопакет', conductivity: 0.9, category: 'window', uValue: 1.1 },

  // Материалы для полов
  { id: 20, name: 'Цементная стяжка', conductivity: 1.4, category: 'floor' },
  { id: 21, name: 'Деревянный пол', conductivity: 0.15, category: 'floor' },
  { id: 22, name: 'Линолеум', conductivity: 0.17, category: 'floor' },
  { id: 23, name: 'КНАУФ Защита / МДВП', conductivity: 0.042, category: 'floor' },
  { id: 24, name: 'АкустиКНАУФ / МДВП', conductivity: 0.046, category: 'floor' },

  // Материалы для потолков
  { id: 30, name: 'Железобетонное перекрытие', conductivity: 1.69, category: 'roof' },
  { id: 31, name: 'Деревянное перекрытие', conductivity: 0.15, category: 'roof' }
];
