import { BookReference } from '../types';
import { getAcademicLiterature as getBaseAcademicLiterature } from './academicLiterature';

const OVERRIDES: Record<string, BookReference[]> = {
  law: [
    { title: 'International Law', author: 'Malcolm N. Shaw (University of Cambridge)', description: 'Major academic reference for public international law.' },
    { title: 'The Concept of Law', author: 'H. L. A. Hart (Oxford)', description: 'Foundational jurisprudential work on the nature of law and legal systems.' },
    { title: 'The Oxford Handbook of Comparative Law', author: 'Mathias Reimann & Reinhard Zimmermann', description: 'Advanced comparative-law reference from Oxford University Press.' }
  ],
  humanities: [
    { title: 'The Histories', author: 'Herodotus', description: 'Primary source foundational to historical inquiry and interpretation.' },
    { title: 'The Sociological Imagination', author: 'C. Wright Mills (Columbia University)', description: 'Classic social-science framework connecting personal experience with institutions and history.' },
    { title: 'The Cambridge History series', author: 'Cambridge University Press scholars', description: 'Peer-reviewed scholarly histories across major periods and regions.' }
  ],
  aviation: [
    { title: 'Aerodynamics for Naval Aviators', author: 'H. H. Hurt Jr.', description: 'Technical reference for aerodynamic principles relevant to flight.' },
    { title: 'Aircraft Performance and Design', author: 'John D. Anderson Jr. (University of Maryland)', description: 'University-level treatment of aircraft performance and design.' },
    { title: 'Introduction to Flight', author: 'John D. Anderson Jr.', description: 'Comprehensive academic introduction to aerodynamics, propulsion and flight mechanics.' }
  ],
  transport: [
    { title: 'Transportation: A Global Supply Chain Perspective', author: 'Coyle, Novack, Gibson & Bardi', description: 'University-level framework for transportation and logistics systems.' },
    { title: 'The Geography of Transport Systems', author: 'Jean-Paul Rodrigue (Hofstra University)', description: 'Academic treatment of transport networks, geography and economic activity.' },
    { title: 'Supply Chain Management: Strategy, Planning, and Operation', author: 'Sunil Chopra (Northwestern)', description: 'Core academic reference for supply-chain and logistics management.' }
  ],
  'urban-planning': [
    { title: 'The Image of the City', author: 'Kevin Lynch (MIT)', description: 'Foundational academic work on urban form, legibility and how people perceive cities.' },
    { title: 'Cities for People', author: 'Jan Gehl', description: 'Research-informed approach to human-scale urban design and public space.' },
    { title: 'The Death and Life of Great American Cities', author: 'Jane Jacobs', description: 'Influential urban-studies work on neighborhoods, streets and city vitality.' }
  ],
  arts: [
    { title: 'The Story of Art', author: 'E. H. Gombrich (University of London)', description: 'Accessible scholarly overview of major developments in art history.' },
    { title: 'Ways of Seeing', author: 'John Berger', description: 'Influential critical framework for interpreting visual culture and representation.' },
    { title: 'The Design of Everyday Things', author: 'Don Norman (UC San Diego)', description: 'Foundational human-centered design work on usability and product interaction.' }
  ]
};

export function getAcademicLiterature(categoryId: string, subfieldId: string, title: string) {
  const override = OVERRIDES[categoryId];
  if (!override) return getBaseAcademicLiterature(categoryId, subfieldId, title);
  return {
    beginner: override.slice(0, 2),
    intermediate: override.slice(1, 3),
    advanced: override.slice(0, 3)
  };
}

export function mergeAcademicLiterature(
  categoryId: string,
  subfieldId: string,
  title: string,
  existing: any
) {
  const academic = getAcademicLiterature(categoryId, subfieldId, title);
  const merge = (level: 'beginner' | 'intermediate' | 'advanced') => {
    const seen = new Set<string>();
    return [...academic[level], ...(existing?.[level] || [])].filter((book: BookReference) => {
      const key = `${book.title}::${book.author}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 6);
  };
  return {
    beginner: merge('beginner'),
    intermediate: merge('intermediate'),
    advanced: merge('advanced')
  };
}
