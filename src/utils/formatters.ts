import { ProClient, OilReseller, PassengerClient, PomaceLot, Appointment, CurrencyCode } from '../types';

export function formatCurrency(amount: number, currency: CurrencyCode = 'DT', decimals = 2): string {
  return (
    new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount) + ` ${currency}`
  );
}

export function formatDh(amount: number, currency: CurrencyCode = 'DT'): string {
  return formatCurrency(amount, currency, 2);
}

export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatDateFr(isoDate: string): string {
  if (!isoDate) return '—';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function formatLongDateFr(isoDate: string): string {
  if (!isoDate) return '3 novembre 2026';
  const months = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ];
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const day = parseInt(parts[2], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const year = parts[0];
  return `${day} ${months[monthIdx] ?? parts[1]} ${year}`;
}

export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCsvCell = (cell: string | number) => {
    const str = String(cell ?? '');
    if (str.includes(';') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent =
    '\uFEFF' +
    [headers.map(escapeCsvCell).join(';'), ...rows.map((r) => r.map(escapeCsvCell).join(';'))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAllDataCsv(
  proClients: ProClient[],
  resellers: OilReseller[],
  passengers: PassengerClient[],
  pomaceLots: PomaceLot[],
  appointments: Appointment[],
  currency: CurrencyCode = 'DT'
) {
  const rows: (string | number)[][] = [];

  rows.push(['=== 1. COMPTE CLIENTS PROFESSIONNELS ===', '', '', '', '', '', '', '']);
  rows.push(['ID Pro', 'Nom & Prénom', 'Téléphone', 'Matricule(s) Camions', 'Tonnage (t)', `Prix/kg (${currency})`, `Montant Trituration (${currency})`, 'Date', 'Observations']);
  proClients.forEach((c) => {
    const totalPress = c.oliveTonnage * 1000 * c.pressPricePerKg;
    rows.push([c.id, c.fullName, c.phone, c.truckPlates, c.oliveTonnage, c.pressPricePerKg, totalPress.toFixed(2), c.date, c.observations]);
  });

  rows.push([]);
  rows.push(['=== 2. COMPTE DE REVENDEURS D’HUILE ===', '', '', '', '', '', '', '']);
  rows.push(['ID Revendeur', 'Nom & Prénom / Société', 'Téléphone', 'Quantité (L)', `Prix/L (${currency})`, `Montant Total (${currency})`, 'Date', 'Notes']);
  resellers.forEach((r) => {
    rows.push([r.id, r.nameOrCompany, r.phone, r.oilQuantityLiters, r.pricePerLiter, r.totalAmount.toFixed(2), r.date, r.notes]);
  });

  rows.push([]);
  rows.push(['=== 3. CLIENTS NORMAUX OU PASSAGERS ===', '', '', '', '', '', '']);
  rows.push(['ID Passager', 'Nom & Prénom', 'Téléphone', 'Olives à presser (kg)', 'Huile achetée (L)', 'Mode / Statut', 'Date']);
  passengers.forEach((p) => {
    rows.push([p.id, p.fullName, p.phone, p.oliveQuantityKg, p.oilPurchasedLiters, p.modeStatus, p.date]);
  });

  rows.push([]);
  rows.push(['=== 4. GESTION DES SOUS-PRODUITS (GRIGNON) ===', '', '', '', '', '', '']);
  rows.push(['N° Lot / Bon', 'Client', 'Catégorie', 'Poids Grignon (kg)', 'Destination', `Prix de vente (${currency})`, 'Date']);
  pomaceLots.forEach((g) => {
    rows.push([g.lotNumber, g.clientName, g.clientType, g.pomaceWeightKg, g.destination, g.destination === 'Vendu' ? g.salePriceDh.toFixed(2) : '0.00', g.date]);
  });

  rows.push([]);
  rows.push(['=== 5. PLANNING DES RENDEZ-VOUS ===', '', '', '', '', '', '', '', '']);
  rows.push(['N° RDV', 'Client', 'Catégorie', 'Téléphone', 'Date', 'Créneau Horaire', 'Opération', 'Quantité Prévue', 'Ligne / Unité', 'Statut', 'Notes']);
  appointments.forEach((a) => {
    rows.push([a.id, a.clientName, a.clientType, a.phone, a.date, a.timeSlot, a.operationType, a.estimatedQuantity, a.pressLine, a.status, a.notes]);
  });

  exportToCsv(
    `maasra-al-baraka-rapport-complet-${new Date().toISOString().slice(0, 10)}.csv`,
    ['Rapport Global Maâsra Al Baraka', `Exporté le ${formatDateFr(new Date().toISOString().slice(0, 10))}`],
    rows
  );
}
