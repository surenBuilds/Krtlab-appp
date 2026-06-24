import { Flashcard } from '../types';

export const INITIAL_FLASHCARDS: Flashcard[] = [
  // Business
  {
    id: 'b1',
    term: 'Լիկվիդայնություն',
    definition: 'Ակտիվի ունակությունը՝ արագ վերածվելու կանխիկ դրամի՝ առանց զգալի կորուստների:',
    categoryId: 'business',
    subcategoryId: 'finance',
    level: 'intermediate',
    createdAt: new Date().toISOString()
  },
  {
    id: 'b2',
    term: 'B2B (Business to Business)',
    definition: 'Առևտրային գործունեություն, որն ուղղված է այլ բիզնեսներին, այլոչ անհատ սպառողներին:',
    categoryId: 'business',
    subcategoryId: 'entrepreneurship',
    level: 'beginner',
    createdAt: new Date().toISOString()
  },
  // Marketing
  {
    id: 'm1',
    term: 'CTA (Call to Action)',
    definition: 'Հրահանգ հաճախորդին՝ կատարելու որոշակի գործողություն (օրինակ՝ "Գնել հիմա"):',
    categoryId: 'marketing',
    subcategoryId: 'digital',
    level: 'beginner',
    createdAt: new Date().toISOString()
  },
  {
    id: 'm2',
    term: 'SEO',
    definition: 'Search Engine Optimization - Որոնողական համակարգերում կայքի տեսանելիության բարձրացում:',
    categoryId: 'marketing',
    subcategoryId: 'digital',
    level: 'intermediate',
    createdAt: new Date().toISOString()
  },
  // Technology
  {
    id: 't1',
    term: 'API',
    definition: 'Application Programming Interface - Ծրագրային միջերես, որը թույլ է տալիս տարբեր հավելվածների հաղորդակցվել միմյանց հետ:',
    categoryId: 'technology',
    subcategoryId: 'web',
    level: 'beginner',
    createdAt: new Date().toISOString()
  },
  {
    id: 't2',
    term: 'Docker',
    definition: 'Ծրագրային ապահովում, որը թույլ է տալիս հավելվածները տեղակայել կոնտեյներների մեջ:',
    categoryId: 'technology',
    subcategoryId: 'cloud',
    level: 'advanced',
    createdAt: new Date().toISOString()
  },
  // Psychology
  {
    id: 'p1',
    term: 'Կոգնիտիվ դիսոնանս',
    definition: 'Հոգեբանական անհանգստություն, որն առաջանում է հակասական հայացքների կամ համոզմունքների դեպքում:',
    categoryId: 'psychology',
    subcategoryId: 'cognitive',
    level: 'advanced',
    createdAt: new Date().toISOString()
  },
  {
    id: 'p2',
    term: 'Էմպատիա',
    definition: 'Այլ մարդու հույզերը հասկանալու և դրանց հետ հաղորդակից լինելու ունակություն:',
    categoryId: 'psychology',
    subcategoryId: 'eq',
    level: 'beginner',
    createdAt: new Date().toISOString()
  },
  // Cybersecurity
  {
    id: 'c1',
    term: 'Phishing',
    definition: 'Խաբեությամբ զգայուն տվյալների (գաղտնաբառեր, քարտի տվյալներ) ձեռքբերման փորձ:',
    categoryId: 'cybersecurity',
    subcategoryId: 'hacking',
    level: 'beginner',
    createdAt: new Date().toISOString()
  },
  {
    id: 'c2',
    term: '2FA',
    definition: 'Two-Factor Authentication - Երկփուլանի վավերացում՝ անվտանգության լրացուցիչ շերտ:',
    categoryId: 'cybersecurity',
    subcategoryId: 'privacy',
    level: 'beginner',
    createdAt: new Date().toISOString()
  }
];
