export type SectionTab =
  | 'dashboard'
  | 'clients'
  | 'apports'
  | 'pressages'
  | 'ventes'
  | 'stock'
  | 'paiements'
  | 'rapports'
  | 'parametres';

export type CurrencyCode = 'DT' | 'DH';

export interface OliveApport {
  ticketNumber: string; // ex: #000125
  clientName: string;
  clientCategory: 'Passager' | 'Client Pro';
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  weightKg: number;
  ratePerKg: number; // DT/kg
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'Enregistré' | 'En cours' | 'En attente';
}

export interface ProClient {
  id: string; // e.g., PRO-26-001
  fullName: string; // Nom & Prénom
  phone: string; // Téléphone
  truckPlates: string; // Matricule(s) des camions (ex: 45821-A-15, 19204-B-26)
  oliveTonnage: number; // Tonnage d'olives à presser (t)
  pressPricePerKg: number; // Prix de presse au kilo
  paidAmountDh?: number; // Montant payé
  date: string; // YYYY-MM-DD
  observations: string; // Observations
}

export interface OilReseller {
  id: string; // e.g., REV-26-001
  nameOrCompany: string; // Nom & Prénom / Société
  phone: string; // Téléphone
  oilQuantityLiters: number; // Quantité d'huile (Litres)
  pricePerLiter: number; // Prix d'achat par litre
  totalAmount: number; // Calculé automatiquement : Quantité × Prix
  paidAmountDh?: number; // Montant payé
  date: string; // YYYY-MM-DD
  notes: string; // Notes
}

export type PassengerModeStatus =
  | 'Trituration seule — Terminé'
  | 'Trituration seule — En cours'
  | 'Achat direct huile — Payé'
  | 'Trituration + Achat — Payé'
  | 'En attente de retrait';

export interface PassengerClient {
  id: string; // e.g., #000125 or PAS-26-001
  fullName: string; // Nom & Prénom
  phone: string; // Téléphone
  oliveQuantityKg: number; // Quantité d'olives à presser (kg)
  pressRatePerKg?: number; // Tarif au kilo
  oilPurchasedLiters: number; // Quantité d'huile achetée (L)
  paidAmountDh?: number; // Payé
  modeStatus: PassengerModeStatus; // Mode / Statut
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
}

export type PomaceDestination = 'Récupéré par le client' | 'Vendu';

export interface PomaceLot {
  lotNumber: string; // N° Lot / Bon (ex: LOT-GR-2601)
  clientName: string; // Client (Pro ou Passager)
  clientType: 'Pro' | 'Passager';
  pomaceWeightKg: number; // Poids de Grignon Produit (kg)
  destination: PomaceDestination; // Récupéré par le client ou Vendu
  salePriceDh: number; // Prix de vente total (0 si récupéré par le client)
  date: string; // YYYY-MM-DD
}

export type AppointmentClientType = 'Client Pro' | 'Passager' | 'Revendeur';

export type AppointmentOperationType =
  | 'Trituration Olives (Tonnage Pro)'
  | 'Trituration Lot Passager'
  | 'Enlèvement Huile en Gros'
  | 'Retrait Grignon';

export type AppointmentPressLine =
  | 'Chaîne 1 (Haut Débit 2 Phases)'
  | 'Chaîne 2 (Extraction à Froid)'
  | 'Quai Citerne & Gros';

export type AppointmentStatus =
  | 'Confirmé'
  | 'En attente'
  | 'En cours au moulin'
  | 'Terminé'
  | 'Annulé';

export interface Appointment {
  id: string; // e.g., RDV-26-001
  clientName: string;
  clientType: AppointmentClientType;
  phone: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // ex: '08:00 - 10:00'
  operationType: AppointmentOperationType;
  estimatedQuantity: string; // ex: '16 tonnes' ou '500 kg' ou '1 500 L'
  pressLine: AppointmentPressLine;
  status: AppointmentStatus;
  notes: string;
}

export interface ReceiptPayload {
  type: 'pro' | 'reseller' | 'passenger' | 'pomace' | 'appointment' | 'apport';
  reference: string;
  clientName: string;
  phone?: string;
  date: string;
  lines: Array<{
    label: string;
    quantity: string;
    unitPrice: string;
    total: string;
  }>;
  totalDh: number;
  paidDh?: number;
  remainingDh?: number;
  subtitle: string;
  metaInfo?: string;
  notes?: string;
}
