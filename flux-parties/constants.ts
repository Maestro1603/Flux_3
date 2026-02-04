import { Wave } from './types.ts';

export const INITIAL_WAVES: Wave[] = [
  {
    id: 'wave-1',
    name: 'Wave 1',
    price: 1100,
    deduction: 100,
    max_tickets: 50,
    sold_count: 0,
    active: true,
  },
  {
    id: 'wave-2',
    name: 'Wave 2',
    price: 1600,
    deduction: 200,
    max_tickets: 100,
    sold_count: 0,
    active: false,
  },
  {
    id: 'wave-3',
    name: 'Wave 3',
    price: 2200,
    deduction: 300,
    max_tickets: 50,
    sold_count: 0,
    active: false,
  },
  {
    id: 'wave-4',
    name: 'On Door',
    price: 3000,
    deduction: 400,
    max_tickets: 100,
    sold_count: 0,
    active: false,
  }
];

export const TERMS_AND_CONDITIONS = [
  "Alcohol is for only people over 18 years old.",
  "Fighting or aggressive behavior will get you kicked out and you will have to pay 200 EGP.",
  "Weapons are not allowed; if security sees one, it will be confiscated and can be returned at the end of the party for a 50 EGP fee.",
  "Listen to staff and security at all times.",
  "Respect other guests and maintain a safe environment.",
  "Do not engage in illegal activity or vandalism.",
  "Lost or stolen items are your responsibility.",
  "We are not liable for any injuries or incidents that happen in the party.",
  "No refunds will be given under any circumstances."
];