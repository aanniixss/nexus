import { Habit, VisionArea, AppData } from '../types'

export const DEFAULT_HABITS: Habit[] = [
  { id: 'adhkar', name: 'Adhkar matin et soir', icon: '🤲', type: 'checkbox', isBad: false, order: 1 },
  { id: 'coran', name: 'Lecture Coran', icon: '📖', type: 'pages', isBad: false, objectivePages: 5, order: 2 },
  { id: 'etirements', name: 'Étirements et Posture', icon: '🧘', type: 'checkbox', isBad: false, order: 3 },
  { id: 'eau', name: '2.5L eau', icon: '💧', type: 'checkbox', isBad: false, order: 4 },
  { id: 'sadaka', name: 'Sadaka du jour', icon: '💰', type: 'checkbox', isBad: false, order: 5 },
  { id: 'sport', name: 'Sport / Entraînement', icon: '💪', type: 'checkbox', isBad: false, activeDays: [1, 3, 4, 6], order: 6 },
  { id: 'nutrition', name: 'Nutrition propre', icon: '🥗', type: 'checkbox', isBad: false, order: 7 },
  { id: 'sommeil', name: '7h+ de sommeil', icon: '😴', type: 'checkbox', isBad: false, order: 8 },
  { id: 'anglais', name: '1 leçon anglais', icon: '🇬🇧', type: 'timer', isBad: false, objectiveMinutes: 30, order: 9 },
  { id: 'livre', name: '10 pages de livre', icon: '📚', type: 'pages', isBad: false, objectivePages: 10, order: 10 },
  { id: 'famille', name: 'Parents et famille', icon: '❤️', type: 'checkbox', isBad: false, order: 11 },
  { id: 'journaling', name: 'Journaling', icon: '✏️', type: 'checkbox', isBad: false, order: 12 },
  { id: 'meditation', name: 'Méditation', icon: '🧘‍♂️', type: 'timer', isBad: false, objectiveMinutes: 10, order: 13 },
  { id: 'planning', name: 'Planification lendemain', icon: '📅', type: 'checkbox', isBad: false, order: 14 },
  { id: 'trading', name: 'Analyse Trading', icon: '📊', type: 'timer', isBad: false, objectiveMinutes: 30, order: 15 },
  { id: 'bad_musique', name: 'Musique', icon: '🎵', type: 'checkbox', isBad: true, order: 1 },
  { id: 'bad_reseaux', name: 'Réseaux sociaux excessifs', icon: '📱', type: 'checkbox', isBad: true, order: 2 },
  { id: 'bad_malbouffe', name: 'Malbouffe', icon: '🍔', type: 'checkbox', isBad: true, order: 3 },
  { id: 'bad_procrastination', name: 'Procrastination', icon: '⏳', type: 'checkbox', isBad: true, order: 4 },
  { id: 'bad_contenu', name: 'Contenu interdit', icon: '🚫', type: 'checkbox', isBad: true, order: 5 },
]

export const DEFAULT_VISION_AREAS: VisionArea[] = [
  { id: 'corps', icon: '💪', title: 'Corps & Santé', text: '' },
  { id: 'carriere', icon: '📈', title: 'Carrière & Finances', text: '' },
  { id: 'relations', icon: '❤️', title: 'Relations & Famille', text: '' },
  { id: 'spiritualite', icon: '🤲', title: 'Spiritualité', text: '' },
  { id: 'dev', icon: '🧠', title: 'Développement Personnel', text: '' },
]

export const DEFAULT_DATA: AppData = {
  habits: DEFAULT_HABITS,
  entries: {},
  objectives: [],
  visionAreas: DEFAULT_VISION_AREAS,
  userName: 'ANIS',
}
