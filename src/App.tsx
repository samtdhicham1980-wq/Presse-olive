/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  Users,
  Settings,
  ShoppingCart,
  Package,
  CreditCard,
  BarChart2,
  Sliders,
  Calendar,
  Search,
  Plus,
  Clock,
  FileText,
  Save,
  ChevronRight,
  ChevronDown,
  Printer,
  Trash2,
  Download,
  RotateCcw,
  X,
  Check,
  User,
  Minus,
  Square,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  KeyRound,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  SectionTab,
  CurrencyCode,
  OliveApport,
  ProClient,
  OilReseller,
  PassengerClient,
  PassengerModeStatus,
  PomaceLot,
  PomaceDestination,
  Appointment,
  AppointmentClientType,
  AppointmentOperationType,
  AppointmentPressLine,
  AppointmentStatus,
  ReceiptPayload,
} from './types';
import {
  INITIAL_APPORTS,
  INITIAL_PRO_CLIENTS,
  INITIAL_OIL_RESELLERS,
  INITIAL_PASSENGER_CLIENTS,
  INITIAL_POMACE_LOTS,
  INITIAL_APPOINTMENTS,
} from './data/initialData';
import {
  formatDh,
  formatNumber,
  formatDateFr,
  formatLongDateFr,
  exportToCsv,
  exportAllDataCsv,
} from './utils/formatters';
import { ReceiptModal } from './components/ReceiptModal';
import { MonthlyCalendar } from './components/MonthlyCalendar';
import { PWAInstallButton, OfflineIndicator } from './components/PWAControls';
import { useOnlineStatus } from './hooks/usePWA';

const STORAGE_KEYS = {
  APPORTS: 'maasra_apports_v4',
  PRO: 'maasra_pro_clients_v4',
  RESELLERS: 'maasra_oil_resellers_v4',
  PASSENGERS: 'maasra_passenger_clients_v4',
  POMACE: 'maasra_pomace_lots_v4',
  APPOINTMENTS: 'maasra_appointments_v4',
  SETTINGS: 'maasra_settings_v4',
};

const PASSENGER_STATUSES: PassengerModeStatus[] = [
  'Trituration seule — En cours',
  'Trituration seule — Terminé',
  'Achat direct huile — Payé',
  'Trituration + Achat — Payé',
  'En attente de retrait',
];

const APPOINTMENT_TIME_SLOTS = [
  '08:00 - 10:00',
  '10:00 - 12:00',
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
  '18:00 - 20:00',
  '20:00 - 23:00 (Équipe Nuit)',
];

const APPOINTMENT_OPERATIONS: AppointmentOperationType[] = [
  'Trituration Olives (Tonnage Pro)',
  'Trituration Lot Passager',
  'Enlèvement Huile en Gros',
  'Retrait Grignon',
];

const APPOINTMENT_LINES: AppointmentPressLine[] = [
  'Chaîne 1 (Haut Débit 2 Phases)',
  'Chaîne 2 (Extraction à Froid)',
  'Quai Citerne & Gros',
];

const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'Confirmé',
  'En attente',
  'En cours au moulin',
  'Terminé',
  'Annulé',
];

/** Custom Olive Branch SVG Icon matching the "Ma Presse / Maâsra Al Baraka" brand mark */
const OliveBranchIllustration: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14 52C22 38 34 22 52 10"
      stroke="#B4C284"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
    <path d="M32 24C27 16 30 9 38 8C39 15 36 21 32 24Z" fill="#9FB069" />
    <path d="M40 18C45 11 52 10 57 14C51 19 45 20 40 18Z" fill="#8A9C56" />
    <path d="M23 34C16 28 16 19 23 15C26 22 25 29 23 34Z" fill="#8A9C56" />
    <ellipse
      cx="22"
      cy="44"
      rx="6.5"
      ry="8.5"
      transform="rotate(-18 22 44)"
      fill="#C5D18E"
    />
    <ellipse
      cx="20"
      cy="42"
      rx="2"
      ry="3.5"
      transform="rotate(-18 20 42)"
      fill="#DCE6B0"
    />
    <ellipse
      cx="35"
      cy="39"
      rx="6"
      ry="8"
      transform="rotate(14 35 39)"
      fill="#AEB973"
    />
    <ellipse
      cx="33.5"
      cy="37"
      rx="1.8"
      ry="3"
      transform="rotate(14 33.5 37)"
      fill="#CFD99C"
    />
  </svg>
);

/** Small Olive Icon for Sidebar Nav & KPI Card */
const OliveMiniIcon: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-5 h-5',
  color = 'currentColor',
}) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5 19C8 13 13 7 20 3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M12 9C10 5 12 2 15 2C15.5 5 14 7.5 12 9Z" fill={color} />
    <ellipse cx="9" cy="16" rx="3" ry="4" transform="rotate(-15 9 16)" fill={color} />
    <ellipse
      cx="15.5"
      cy="14"
      rx="2.6"
      ry="3.5"
      transform="rotate(15 15.5 14)"
      fill={color}
      opacity="0.8"
    />
  </svg>
);

/** Coins KPI Icon */
const CoinsKpiIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="10" cy="8" rx="6" ry="2.5" fill="#C89D3C" />
    <path
      d="M4 8V12C4 13.38 6.69 14.5 10 14.5C13.31 14.5 16 13.38 16 12V8"
      fill="#C89D3C"
      opacity="0.75"
    />
    <path d="M4 12V16C4 17.38 6.69 18.5 10 18.5C13.31 18.5 16 17.38 16 16V12" fill="#B5892A" />
    <circle cx="16.5" cy="14.5" r="4.5" fill="#D5AD4E" stroke="#FCF8EB" strokeWidth="1.2" />
  </svg>
);

/** Wallet KPI Icon */
const WalletKpiIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="6" width="18" height="13" rx="2.5" fill="#7D4E2D" />
    <path
      d="M15 10.5H21V14.5H15C13.9 14.5 13 13.6 13 12.5C13 11.4 13.9 10.5 15 10.5Z"
      fill="#A06B44"
    />
    <circle cx="15.5" cy="12.5" r="1" fill="#FBF1EE" />
  </svg>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<SectionTab>('dashboard');
  const [clientsSubTab, setClientsSubTab] = useState<'pro' | 'passagers'>('pro');
  const [searchQuery, setSearchQuery] = useState('');
  const [headerDate, setHeaderDate] = useState('2026-11-03');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<string>('ALL');
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date(2026, 10, 1));
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [appointmentViewMode, setAppointmentViewMode] = useState<'both' | 'calendar' | 'list'>(
    'both'
  );
  const isOnline = useOnlineStatus();

  // Settings State
  const [settings, setSettings] = useState<{
    millTitle: string;
    adminName: string;
    adminRole: string;
    currency: CurrencyCode;
    defaultRatePerKg: string;
    username?: string;
    password?: string;
  }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          millTitle:
            !parsed.millTitle || parsed.millTitle === 'Ma Presse'
              ? 'معصرة الصغير'
              : parsed.millTitle,
          adminName: parsed.adminName || 'Karim',
          adminRole: parsed.adminRole || 'Administrateur',
          currency: parsed.currency || 'DT',
          defaultRatePerKg: parsed.defaultRatePerKg || '0.20',
          username: parsed.username || 'karim',
          password: parsed.password || '1234',
        };
      }
      return {
        millTitle: 'معصرة الصغير',
        adminName: 'Karim',
        adminRole: 'Administrateur',
        currency: 'DT',
        defaultRatePerKg: '0.20',
        username: 'karim',
        password: '1234',
      };
    } catch {
      return {
        millTitle: 'معصرة الصغير',
        adminName: 'Karim',
        adminRole: 'Administrateur',
        currency: 'DT',
        defaultRatePerKg: '0.20',
        username: 'karim',
        password: '1234',
      };
    }
  });

  // Authentication State (shown on site open)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredUser = loginUsername.trim().toLowerCase();
    const enteredPass = loginPassword.trim();
    const expectedUser = (settings.username || 'karim').trim().toLowerCase();
    const expectedPass = (settings.password || '1234').trim();

    const isValidCustom = enteredUser === expectedUser && enteredPass === expectedPass;
    const isValidDefault =
      (enteredUser === 'karim' || enteredUser === 'admin') &&
      (enteredPass === '1234' || enteredPass === 'admin');

    if (isValidCustom || isValidDefault) {
      setLoginError('');
      setIsAuthenticated(true);
    } else {
      setLoginError('Nom d’utilisateur ou mot de passe incorrect.');
    }
  };

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    setLoginPassword('');
    setLoginError('');
    setIsAuthenticated(false);
  };

  const currency = settings.currency;

  // Persistent Data States
  const [apports, setApports] = useState<OliveApport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPORTS);
      return saved ? JSON.parse(saved) : INITIAL_APPORTS;
    } catch {
      return INITIAL_APPORTS;
    }
  });

  const [proClients, setProClients] = useState<ProClient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRO);
      return saved ? JSON.parse(saved) : INITIAL_PRO_CLIENTS;
    } catch {
      return INITIAL_PRO_CLIENTS;
    }
  });

  const [resellers, setResellers] = useState<OilReseller[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESELLERS);
      return saved ? JSON.parse(saved) : INITIAL_OIL_RESELLERS;
    } catch {
      return INITIAL_OIL_RESELLERS;
    }
  });

  const [passengers, setPassengers] = useState<PassengerClient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PASSENGERS);
      return saved ? JSON.parse(saved) : INITIAL_PASSENGER_CLIENTS;
    } catch {
      return INITIAL_PASSENGER_CLIENTS;
    }
  });

  const [pomaceLots, setPomaceLots] = useState<PomaceLot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POMACE);
      return saved ? JSON.parse(saved) : INITIAL_POMACE_LOTS;
    } catch {
      return INITIAL_POMACE_LOTS;
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPORTS, JSON.stringify(apports));
    } catch {}
  }, [apports]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRO, JSON.stringify(proClients));
    } catch {}
  }, [proClients]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RESELLERS, JSON.stringify(resellers));
    } catch {}
  }, [resellers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PASSENGERS, JSON.stringify(passengers));
    } catch {}
  }, [passengers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.POMACE, JSON.stringify(pomaceLots));
    } catch {}
  }, [pomaceLots]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    } catch {}
  }, [appointments]);

  // Dashboard "Nouvel apport d'olives" form state (matching the photo: Ahmed Ben Salah, 03/11/2026, 250 kg, 0,20 DT/kg, Total 50,00 DT, Payé 30,00 DT, Reste 20,00 DT)
  const [apportClient, setApportClient] = useState('Ahmed Ben Salah');
  const [apportCustomClient, setApportCustomClient] = useState('');
  const [isCustomClient, setIsCustomClient] = useState(false);
  const [apportDate, setApportDate] = useState('2026-11-03');
  const [apportWeightKg, setApportWeightKg] = useState('250');
  const [apportRatePerKg, setApportRatePerKg] = useState('0.20');
  const [apportPaidDh, setApportPaidDh] = useState('30.00');

  const apportTotalDh = useMemo(() => {
    const w = parseFloat(apportWeightKg);
    const r = parseFloat(apportRatePerKg);
    if (isNaN(w) || isNaN(r) || w <= 0 || r < 0) return 0;
    return Math.round(w * r * 100) / 100;
  }, [apportWeightKg, apportRatePerKg]);

  const apportRemainingDh = useMemo(() => {
    const paid = parseFloat(apportPaidDh);
    if (isNaN(paid) || paid < 0) return apportTotalDh;
    return Math.max(0, Math.round((apportTotalDh - paid) * 100) / 100);
  }, [apportTotalDh, apportPaidDh]);

  // Modals State
  const [activeReceipt, setActiveReceipt] = useState<ReceiptPayload | null>(null);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isResellerModalOpen, setIsResellerModalOpen] = useState(false);
  const [isPomaceModalOpen, setIsPomaceModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Forms for other sections
  const [proForm, setProForm] = useState({
    fullName: '',
    phone: '',
    truckPlates: '',
    oliveTonnage: '',
    pressPricePerKg: '0.20',
    paidAmountDh: '',
    date: '2026-11-03',
    observations: '',
  });

  const [resellerForm, setResellerForm] = useState({
    nameOrCompany: '',
    phone: '',
    oilQuantityLiters: '',
    pricePerLiter: '25.00',
    paidAmountDh: '',
    date: '2026-11-03',
    notes: '',
  });

  const [passengerForm, setPassengerForm] = useState({
    fullName: '',
    phone: '',
    oliveQuantityKg: '',
    pressRatePerKg: '0.20',
    oilPurchasedLiters: '',
    paidAmountDh: '',
    modeStatus: 'Trituration seule — En cours' as PassengerModeStatus,
    date: '2026-11-03',
  });

  const [pomaceForm, setPomaceForm] = useState({
    clientName: '',
    clientType: 'Pro' as 'Pro' | 'Passager',
    pomaceWeightKg: '',
    destination: 'Vendu' as PomaceDestination,
    salePriceDh: '',
    date: '2026-11-03',
  });

  const [appointmentForm, setAppointmentForm] = useState({
    clientName: '',
    clientType: 'Client Pro' as AppointmentClientType,
    phone: '',
    date: '2026-11-03',
    timeSlot: '10:00 - 12:00',
    operationType: 'Trituration Olives (Tonnage Pro)' as AppointmentOperationType,
    estimatedQuantity: '',
    pressLine: 'Chaîne 1 (Haut Débit 2 Phases)' as AppointmentPressLine,
    status: 'Confirmé' as AppointmentStatus,
    notes: '',
  });

  const allClientNames = useMemo(() => {
    const names = new Set<string>([
      'Ahmed Ben Salah',
      'Fatma Gharbi',
      'Ali Mansour',
      ...passengers.map((p) => p.fullName),
      ...proClients.map((c) => c.fullName),
    ]);
    return Array.from(names);
  }, [passengers, proClients]);

  // Global KPI Calculations
  const stats = useMemo(() => {
    const apportKgTotal = apports.reduce((acc, a) => acc + a.weightKg, 0);
    const proTonnage = proClients.reduce((acc, c) => acc + c.oliveTonnage, 0);
    const passengerKg = passengers.reduce((acc, p) => acc + p.oliveQuantityKg, 0);
    const totalOliveTonnes = proTonnage + passengerKg / 1000;

    const pressagesCount = apports.length;

    const apportRevenueDh = apports.reduce((acc, a) => acc + a.totalAmount, 0);
    const proPressRevenueDh = proClients.reduce(
      (acc, c) => acc + c.oliveTonnage * 1000 * c.pressPricePerKg,
      0
    );

    const apportRemaining = apports.reduce((acc, a) => acc + a.remainingAmount, 0);
    const proRemaining = proClients.reduce((acc, c) => {
      const total = c.oliveTonnage * 1000 * c.pressPricePerKg;
      const paid = c.paidAmountDh ?? total;
      return acc + Math.max(0, total - paid);
    }, 0);
    const resellerRemaining = resellers.reduce((acc, r) => {
      const paid = r.paidAmountDh ?? r.totalAmount;
      return acc + Math.max(0, r.totalAmount - paid);
    }, 0);
    const totalReceivablesDh = apportRemaining + proRemaining + resellerRemaining;

    const resellerOilLiters = resellers.reduce((acc, r) => acc + r.oilQuantityLiters, 0);
    const passengerOilLiters = passengers.reduce((acc, p) => acc + p.oilPurchasedLiters, 0);
    const totalOilSoldLiters = resellerOilLiters + passengerOilLiters;
    const resellerRevenueDh = resellers.reduce((acc, r) => acc + r.totalAmount, 0);
    const pomaceRevenueDh = pomaceLots.reduce(
      (acc, g) => acc + (g.destination === 'Vendu' ? g.salePriceDh : 0),
      0
    );
    const totalPomaceKg = pomaceLots.reduce((acc, g) => acc + g.pomaceWeightKg, 0);

    return {
      apportKgTotal,
      proTonnage,
      passengerKg,
      totalOliveTonnes,
      pressagesCount,
      apportRevenueDh,
      proPressRevenueDh,
      totalPressRevenueDh: apportRevenueDh + proPressRevenueDh,
      apportRemaining,
      proRemaining,
      resellerRemaining,
      totalReceivablesDh,
      resellerOilLiters,
      passengerOilLiters,
      totalOilSoldLiters,
      resellerRevenueDh,
      pomaceRevenueDh,
      totalPomaceKg,
    };
  }, [apports, proClients, resellers, passengers, pomaceLots]);

  // Daily revenue for the last 7 days ending on headerDate (for Recharts LineChart in Rapports)
  const [chartMetricMode, setChartMetricMode] = useState<'all' | 'pressage'>('pressage');

  const last7DaysRevenue = useMemo(() => {
    const baseParts = headerDate.split('-').map(Number);
    const baseDate =
      baseParts.length === 3 && !baseParts.some(isNaN)
        ? new Date(baseParts[0], baseParts[1] - 1, baseParts[2])
        : new Date(2026, 10, 3);

    const shortMonths = [
      'janv.',
      'févr.',
      'mars',
      'avr.',
      'mai',
      'juin',
      'juil.',
      'août',
      'sept.',
      'oct.',
      'nov.',
      'déc.',
    ];

    const days: Array<{
      dateIso: string;
      label: string;
      recettesPressage: number;
      ventesHuileGrignon: number;
      recettesTotales: number;
    }> = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const iso = `${yyyy}-${mm}-${dd}`;
      const label = `${d.getDate()} ${shortMonths[d.getMonth()]}`;

      const dayApportsRev = apports
        .filter((a) => a.date === iso)
        .reduce((sum, a) => sum + a.totalAmount, 0);

      const dayProRev = proClients
        .filter((c) => c.date === iso)
        .reduce((sum, c) => sum + c.oliveTonnage * 1000 * c.pressPricePerKg, 0);

      const dayPassengerOilRev = passengers
        .filter((p) => p.date === iso && p.oilPurchasedLiters > 0)
        .reduce((sum, p) => sum + p.oilPurchasedLiters * 25, 0);

      const dayResellerRev = resellers
        .filter((r) => r.date === iso)
        .reduce((sum, r) => sum + r.totalAmount, 0);

      const dayPomaceRev = pomaceLots
        .filter((g) => g.date === iso && g.destination === 'Vendu')
        .reduce((sum, g) => sum + g.salePriceDh, 0);

      const recettesPressage = Math.round((dayApportsRev + dayProRev) * 100) / 100;
      const ventesHuileGrignon =
        Math.round((dayResellerRev + dayPassengerOilRev + dayPomaceRev) * 100) / 100;
      const recettesTotales = Math.round((recettesPressage + ventesHuileGrignon) * 100) / 100;

      days.push({
        dateIso: iso,
        label,
        recettesPressage,
        ventesHuileGrignon,
        recettesTotales,
      });
    }

    return days;
  }, [headerDate, apports, proClients, passengers, resellers, pomaceLots]);

  // Handler: Enregistrer l'apport from Dashboard Card
  const handleRecordApport = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenName = isCustomClient ? apportCustomClient.trim() : apportClient.trim();
    const weight = parseFloat(apportWeightKg);
    const rate = parseFloat(apportRatePerKg);
    const paid = parseFloat(apportPaidDh || '0');
    if (!chosenName || isNaN(weight) || weight <= 0 || isNaN(rate)) return;

    const total = Math.round(weight * rate * 100) / 100;
    const validPaid = isNaN(paid) ? 0 : Math.min(total, Math.max(0, paid));
    const remaining = Math.max(0, Math.round((total - validPaid) * 100) / 100);

    const nextTicketNum = 118 + apports.length;
    const ticketId = `#${String(Math.max(126, nextTicketNum)).padStart(6, '0')}`;
    const nowTime = new Date().toTimeString().slice(0, 5);

    const newApport: OliveApport = {
      ticketNumber: ticketId,
      clientName: chosenName,
      clientCategory: weight >= 2000 ? 'Client Pro' : 'Passager',
      date: apportDate,
      time: nowTime,
      weightKg: weight,
      ratePerKg: rate,
      totalAmount: total,
      paidAmount: validPaid,
      remainingAmount: remaining,
      status: 'Enregistré',
    };

    setApports((prev) => [newApport, ...prev]);

    const newPassenger: PassengerClient = {
      id: ticketId,
      fullName: chosenName,
      phone: '06 61 00 00 00',
      oliveQuantityKg: weight,
      pressRatePerKg: rate,
      oilPurchasedLiters: 0,
      paidAmountDh: validPaid,
      modeStatus: remaining === 0 ? 'Trituration seule — Terminé' : 'Trituration seule — En cours',
      date: apportDate,
      time: nowTime,
    };
    setPassengers((prev) => [newPassenger, ...prev]);

    if (isCustomClient) {
      setIsCustomClient(false);
      setApportClient(chosenName);
      setApportCustomClient('');
    }
  };

  // Handlers for other modals
  const handleAddProClient = (e: React.FormEvent) => {
    e.preventDefault();
    const tonnage = parseFloat(proForm.oliveTonnage);
    const price = parseFloat(proForm.pressPricePerKg);
    if (!proForm.fullName.trim() || isNaN(tonnage) || tonnage <= 0 || isNaN(price)) return;

    const totalDh = tonnage * 1000 * price;
    const paidDh = proForm.paidAmountDh !== '' ? parseFloat(proForm.paidAmountDh) : totalDh;

    const nextNum = String(proClients.length + 1).padStart(3, '0');
    const newClient: ProClient = {
      id: `PRO-26-${nextNum}`,
      fullName: proForm.fullName.trim(),
      phone: proForm.phone.trim() || 'Non renseigné',
      truckPlates: proForm.truckPlates.trim() || 'Camion direct',
      oliveTonnage: tonnage,
      pressPricePerKg: price,
      paidAmountDh: isNaN(paidDh) ? totalDh : paidDh,
      date: proForm.date,
      observations: proForm.observations.trim() || 'Réception standard validée au pont-bascule.',
    };

    setProClients((prev) => [newClient, ...prev]);
    setProForm({
      fullName: '',
      phone: '',
      truckPlates: '',
      oliveTonnage: '',
      pressPricePerKg: settings.defaultRatePerKg,
      paidAmountDh: '',
      date: '2026-11-03',
      observations: '',
    });
    setIsProModalOpen(false);
  };

  const handleAddReseller = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(resellerForm.oilQuantityLiters);
    const price = parseFloat(resellerForm.pricePerLiter);
    if (!resellerForm.nameOrCompany.trim() || isNaN(qty) || qty <= 0 || isNaN(price)) return;

    const total = Math.round(qty * price * 100) / 100;
    const paid = resellerForm.paidAmountDh !== '' ? parseFloat(resellerForm.paidAmountDh) : total;

    const nextNum = String(resellers.length + 1).padStart(3, '0');
    const newReseller: OilReseller = {
      id: `REV-26-${nextNum}`,
      nameOrCompany: resellerForm.nameOrCompany.trim(),
      phone: resellerForm.phone.trim() || 'Non renseigné',
      oilQuantityLiters: qty,
      pricePerLiter: price,
      totalAmount: total,
      paidAmountDh: isNaN(paid) ? total : paid,
      date: resellerForm.date,
      notes: resellerForm.notes.trim() || 'Vente en gros huile d’olive extra vierge.',
    };

    setResellers((prev) => [newReseller, ...prev]);
    setResellerForm({
      nameOrCompany: '',
      phone: '',
      oilQuantityLiters: '',
      pricePerLiter: '25.00',
      paidAmountDh: '',
      date: '2026-11-03',
      notes: '',
    });
    setIsResellerModalOpen(false);
  };

  const handleAddPassenger = (e: React.FormEvent) => {
    e.preventDefault();
    const kg = parseFloat(passengerForm.oliveQuantityKg || '0');
    const rate = parseFloat(passengerForm.pressRatePerKg || settings.defaultRatePerKg);
    const liters = parseFloat(passengerForm.oilPurchasedLiters || '0');
    if (!passengerForm.fullName.trim() || (kg <= 0 && liters <= 0)) return;

    const totalExpected = kg * rate + liters * 25;
    const paid =
      passengerForm.paidAmountDh !== '' ? parseFloat(passengerForm.paidAmountDh) : totalExpected;

    const nextTicket = `#${String(120 + passengers.length).padStart(6, '0')}`;
    const nowTime = new Date().toTimeString().slice(0, 5);

    const newPassenger: PassengerClient = {
      id: nextTicket,
      fullName: passengerForm.fullName.trim(),
      phone: passengerForm.phone.trim() || 'Non renseigné',
      oliveQuantityKg: isNaN(kg) ? 0 : kg,
      pressRatePerKg: isNaN(rate) ? 0.2 : rate,
      oilPurchasedLiters: isNaN(liters) ? 0 : liters,
      paidAmountDh: isNaN(paid) ? totalExpected : paid,
      modeStatus: passengerForm.modeStatus,
      date: passengerForm.date,
      time: nowTime,
    };

    setPassengers((prev) => [newPassenger, ...prev]);
    if (kg > 0) {
      const pressTotal = Math.round(kg * rate * 100) / 100;
      const pressPaid = Math.min(pressTotal, isNaN(paid) ? pressTotal : paid);
      setApports((prev) => [
        {
          ticketNumber: nextTicket,
          clientName: newPassenger.fullName,
          clientCategory: 'Passager',
          date: passengerForm.date,
          time: nowTime,
          weightKg: kg,
          ratePerKg: rate,
          totalAmount: pressTotal,
          paidAmount: pressPaid,
          remainingAmount: Math.max(0, pressTotal - pressPaid),
          status: 'Enregistré',
        },
        ...prev,
      ]);
    }

    setPassengerForm({
      fullName: '',
      phone: '',
      oliveQuantityKg: '',
      pressRatePerKg: settings.defaultRatePerKg,
      oilPurchasedLiters: '',
      paidAmountDh: '',
      modeStatus: 'Trituration seule — En cours',
      date: '2026-11-03',
    });
  };

  const handleAddPomace = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(pomaceForm.pomaceWeightKg);
    const salePrice =
      pomaceForm.destination === 'Vendu' ? parseFloat(pomaceForm.salePriceDh || '0') : 0;
    if (!pomaceForm.clientName.trim() || isNaN(weight) || weight <= 0) return;

    const nextNum = String(pomaceLots.length + 1).padStart(2, '0');
    const newLot: PomaceLot = {
      lotNumber: `LOT-GR-26${nextNum}`,
      clientName: pomaceForm.clientName.trim(),
      clientType: pomaceForm.clientType,
      pomaceWeightKg: weight,
      destination: pomaceForm.destination,
      salePriceDh: isNaN(salePrice) ? 0 : salePrice,
      date: pomaceForm.date,
    };

    setPomaceLots((prev) => [newLot, ...prev]);
    setPomaceForm({
      clientName: '',
      clientType: 'Pro',
      pomaceWeightKg: '',
      destination: 'Vendu',
      salePriceDh: '',
      date: '2026-11-03',
    });
    setIsPomaceModalOpen(false);
  };

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentForm.clientName.trim() || !appointmentForm.estimatedQuantity.trim()) return;

    const nextNum = String(appointments.length + 1).padStart(3, '0');
    const newRdv: Appointment = {
      id: `RDV-26-${nextNum}`,
      clientName: appointmentForm.clientName.trim(),
      clientType: appointmentForm.clientType,
      phone: appointmentForm.phone.trim() || 'Non renseigné',
      date: appointmentForm.date,
      timeSlot: appointmentForm.timeSlot,
      operationType: appointmentForm.operationType,
      estimatedQuantity: appointmentForm.estimatedQuantity.trim(),
      pressLine: appointmentForm.pressLine,
      status: appointmentForm.status,
      notes:
        appointmentForm.notes.trim() || 'Présentation au pont-bascule 15 min avant le créneau.',
    };

    setAppointments((prev) => [newRdv, ...prev]);
    setAppointmentForm({
      clientName: '',
      clientType: 'Client Pro',
      phone: '',
      date: '2026-11-03',
      timeSlot: '10:00 - 12:00',
      operationType: 'Trituration Olives (Tonnage Pro)',
      estimatedQuantity: '',
      pressLine: 'Chaîne 1 (Haut Débit 2 Phases)',
      status: 'Confirmé',
      notes: '',
    });
    setIsAppointmentModalOpen(false);
  };

  // Settle Remaining Balance Handlers
  const settleApportBalance = (ticketNumber: string) => {
    setApports((prev) =>
      prev.map((a) =>
        a.ticketNumber === ticketNumber
          ? { ...a, paidAmount: a.totalAmount, remainingAmount: 0 }
          : a
      )
    );
  };

  const settleProBalance = (id: string) => {
    setProClients((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, paidAmountDh: c.oliveTonnage * 1000 * c.pressPricePerKg } : c
      )
    );
  };

  const settleResellerBalance = (id: string) => {
    setResellers((prev) =>
      prev.map((r) => (r.id === id ? { ...r, paidAmountDh: r.totalAmount } : r))
    );
  };

  // Filtered Lists
  const filteredApports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return apports;
    return apports.filter(
      (a) =>
        a.ticketNumber.toLowerCase().includes(q) ||
        a.clientName.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q)
    );
  }, [apports, searchQuery]);

  const filteredProClients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return proClients;
    return proClients.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.fullName.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.truckPlates.toLowerCase().includes(q) ||
        c.observations.toLowerCase().includes(q)
    );
  }, [proClients, searchQuery]);

  const filteredResellers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return resellers;
    return resellers.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.nameOrCompany.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.notes.toLowerCase().includes(q)
    );
  }, [resellers, searchQuery]);

  const filteredPassengers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return passengers;
    return passengers.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.fullName.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.modeStatus.toLowerCase().includes(q)
    );
  }, [passengers, searchQuery]);

  const filteredPomace = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return pomaceLots;
    return pomaceLots.filter(
      (g) =>
        g.lotNumber.toLowerCase().includes(q) ||
        g.clientName.toLowerCase().includes(q) ||
        g.destination.toLowerCase().includes(q)
    );
  }, [pomaceLots, searchQuery]);

  const filteredAppointments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return appointments.filter((a) => {
      const matchesStatus =
        appointmentStatusFilter === 'ALL' || a.status === appointmentStatusFilter;
      const matchesDate = !selectedCalendarDate || a.date === selectedCalendarDate;
      const matchesQuery =
        !q ||
        a.id.toLowerCase().includes(q) ||
        a.clientName.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q) ||
        a.operationType.toLowerCase().includes(q) ||
        a.pressLine.toLowerCase().includes(q) ||
        a.notes.toLowerCase().includes(q);
      return matchesStatus && matchesDate && matchesQuery;
    });
  }, [appointments, searchQuery, appointmentStatusFilter, selectedCalendarDate]);

  // Receipt Openers
  const openApportReceipt = (apport: OliveApport) => {
    setActiveReceipt({
      type: 'apport',
      reference: apport.ticketNumber,
      clientName: apport.clientName,
      date: apport.date,
      subtitle: 'TICKET D’APPORT & PRESSAGE D’OLIVES',
      metaInfo: `Heure : ${apport.time} · Statut : ${apport.status}`,
      totalDh: apport.totalAmount,
      paidDh: apport.paidAmount,
      remainingDh: apport.remainingAmount,
      lines: [
        {
          label: 'Trituration et pressage d’olives',
          quantity: `${formatNumber(apport.weightKg, 0)} kg`,
          unitPrice: `${formatNumber(apport.ratePerKg, 2)} ${currency}/kg`,
          total: formatDh(apport.totalAmount, currency),
        },
      ],
    });
  };

  const openProReceipt = (client: ProClient) => {
    const totalKg = client.oliveTonnage * 1000;
    const totalDh = totalKg * client.pressPricePerKg;
    const paidDh = client.paidAmountDh ?? totalDh;
    setActiveReceipt({
      type: 'pro',
      reference: client.id,
      clientName: client.fullName,
      phone: client.phone,
      date: client.date,
      subtitle: 'BON DE PESÉE & TRITURATION PRO',
      metaInfo: `Matricule(s) : ${client.truckPlates}`,
      notes: client.observations,
      totalDh,
      paidDh,
      remainingDh: Math.max(0, totalDh - paidDh),
      lines: [
        {
          label: `Prestation de trituration d'olives (${formatNumber(client.oliveTonnage, 2)} tonnes)`,
          quantity: `${formatNumber(totalKg, 0)} kg`,
          unitPrice: `${formatNumber(client.pressPricePerKg, 2)} ${currency}/kg`,
          total: formatDh(totalDh, currency),
        },
      ],
    });
  };

  const openResellerReceipt = (reseller: OilReseller) => {
    const paidDh = reseller.paidAmountDh ?? reseller.totalAmount;
    setActiveReceipt({
      type: 'reseller',
      reference: reseller.id,
      clientName: reseller.nameOrCompany,
      phone: reseller.phone,
      date: reseller.date,
      subtitle: 'FACTURE / BON DE LIVRAISON HUILE EN GROS',
      notes: reseller.notes,
      totalDh: reseller.totalAmount,
      paidDh,
      remainingDh: Math.max(0, reseller.totalAmount - paidDh),
      lines: [
        {
          label: 'Huile d’olive vierge extra — Vente en gros',
          quantity: `${formatNumber(reseller.oilQuantityLiters, 0)} L`,
          unitPrice: `${formatNumber(reseller.pricePerLiter, 2)} ${currency}/L`,
          total: formatDh(reseller.totalAmount, currency),
        },
      ],
    });
  };

  const openPassengerReceipt = (passenger: PassengerClient) => {
    const lines = [];
    let totalDh = 0;
    const rate = passenger.pressRatePerKg ?? 0.2;

    if (passenger.oliveQuantityKg > 0) {
      const pressCost = passenger.oliveQuantityKg * rate;
      totalDh += pressCost;
      lines.push({
        label: 'Frais de pressage d’olives',
        quantity: `${formatNumber(passenger.oliveQuantityKg, 0)} kg`,
        unitPrice: `${formatNumber(rate, 2)} ${currency}/kg`,
        total: formatDh(pressCost, currency),
      });
    }

    if (passenger.oilPurchasedLiters > 0) {
      const oilCost = passenger.oilPurchasedLiters * 25.0;
      totalDh += oilCost;
      lines.push({
        label: 'Achat direct d’huile d’olive vierge extra',
        quantity: `${formatNumber(passenger.oilPurchasedLiters, 0)} L`,
        unitPrice: `25,00 ${currency}/L`,
        total: formatDh(oilCost, currency),
      });
    }

    const paidDh = passenger.paidAmountDh ?? totalDh;

    setActiveReceipt({
      type: 'passenger',
      reference: passenger.id,
      clientName: passenger.fullName,
      phone: passenger.phone,
      date: passenger.date,
      subtitle: 'TICKET DE CAISSE & PRESSAGE PASSAGER',
      metaInfo: `Statut : ${passenger.modeStatus}`,
      totalDh,
      paidDh,
      remainingDh: Math.max(0, totalDh - paidDh),
      lines,
    });
  };

  const openPomaceReceipt = (lot: PomaceLot) => {
    const unitPrice =
      lot.destination === 'Vendu' && lot.pomaceWeightKg > 0
        ? lot.salePriceDh / lot.pomaceWeightKg
        : 0;
    setActiveReceipt({
      type: 'pomace',
      reference: lot.lotNumber,
      clientName: `${lot.clientName} (${lot.clientType})`,
      date: lot.date,
      subtitle: 'BON DE SORTIE SOUS-PRODUITS (GRIGNON)',
      metaInfo: `Destination : ${lot.destination}`,
      notes:
        lot.destination === 'Récupéré par le client'
          ? 'Grignon remis au propriétaire du lot d’olives.'
          : 'Grignon vendu pour valorisation.',
      totalDh: lot.destination === 'Vendu' ? lot.salePriceDh : 0,
      lines: [
        {
          label: `Grignon d'olive (${lot.destination})`,
          quantity: `${formatNumber(lot.pomaceWeightKg, 0)} kg`,
          unitPrice:
            lot.destination === 'Vendu'
              ? `${formatNumber(unitPrice, 2)} ${currency}/kg`
              : `0,00 ${currency}/kg`,
          total: lot.destination === 'Vendu' ? formatDh(lot.salePriceDh, currency) : `0,00 ${currency}`,
        },
      ],
    });
  };

  const openAppointmentReceipt = (rdv: Appointment) => {
    setActiveReceipt({
      type: 'appointment',
      reference: rdv.id,
      clientName: `${rdv.clientName} (${rdv.clientType})`,
      phone: rdv.phone,
      date: rdv.date,
      subtitle: 'CONVOCATION & BON DE RENDEZ-VOUS MOULIN',
      metaInfo: `Créneau : ${rdv.timeSlot} · ${rdv.pressLine}`,
      notes: `Statut : ${rdv.status}. ${rdv.notes}`,
      totalDh: 0,
      lines: [
        {
          label: `${rdv.operationType} — ${rdv.pressLine}`,
          quantity: rdv.estimatedQuantity,
          unitPrice: rdv.timeSlot,
          total: rdv.status,
        },
      ],
    });
  };

  const handleResetDemoData = () => {
    setApports(INITIAL_APPORTS);
    setProClients(INITIAL_PRO_CLIENTS);
    setResellers(INITIAL_OIL_RESELLERS);
    setPassengers(INITIAL_PASSENGER_CLIENTS);
    setPomaceLots(INITIAL_POMACE_LOTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setConfirmResetOpen(false);
  };

  const resellerCalculatedTotal = useMemo(() => {
    const q = parseFloat(resellerForm.oilQuantityLiters);
    const p = parseFloat(resellerForm.pricePerLiter);
    if (isNaN(q) || isNaN(p) || q < 0 || p < 0) return 0;
    return q * p;
  }, [resellerForm.oilQuantityLiters, resellerForm.pricePerLiter]);

  // Exact 9 Sidebar Menu Items requested
  const navItems: Array<{
    id: SectionTab;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'dashboard', label: 'Tableau de bord', icon: <Home className="h-4 w-4" /> },
    { id: 'clients', label: 'Clients', icon: <Users className="h-4 w-4" /> },
    {
      id: 'apports',
      label: 'Apports d’olives',
      icon: <OliveMiniIcon className="h-4 w-4" />,
    },
    { id: 'pressages', label: 'Pressages', icon: <Settings className="h-4 w-4" /> },
    { id: 'ventes', label: 'Ventes', icon: <ShoppingCart className="h-4 w-4" /> },
    { id: 'stock', label: 'Stock', icon: <Package className="h-4 w-4" /> },
    { id: 'paiements', label: 'Paiements', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'rapports', label: 'Rapports', icon: <BarChart2 className="h-4 w-4" /> },
    { id: 'parametres', label: 'Paramètres', icon: <Sliders className="h-4 w-4" /> },
  ];

  const sectionTitles: Record<SectionTab, string> = {
    dashboard: 'Tableau de bord',
    clients: 'Clients (Professionnels & Passagers)',
    apports: 'Apports d’olives',
    pressages: 'Pressages & Rendez-vous',
    ventes: 'Ventes & Revendeurs d’Huile',
    stock: 'Stock & Sous-Produits (Grignon)',
    paiements: 'Paiements & Restes à recevoir',
    rapports: 'Rapports & Statistiques',
    parametres: 'Paramètres du Moulin',
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F5F0] text-[#22261E] select-none sm:select-auto">
        {/* Top Window Title Bar */}
        <div className="flex h-8 items-center justify-between bg-[#253019] px-3.5 text-xs text-[#D5DEC6] border-b border-[#1D2613]">
          <div className="flex items-center gap-2">
            <OliveMiniIcon className="h-4 w-4 text-[#B4C284]" />
            <span className="font-semibold tracking-wide text-white">{settings.millTitle}</span>
            <span className="text-[11px] text-[#95A37F]">v1.0.0 — Portail d’accès sécurisé</span>
            {!isOnline && (
              <span className="ml-2 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-200">
                Mode Hors-Ligne Actif
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5 text-[#95A37F]">
            <Minus className="h-3 w-3 opacity-70" />
            <Square className="h-2.5 w-2.5 opacity-70" />
            <X className="h-3.5 w-3.5 opacity-70" />
          </div>
        </div>

        {/* Centered Login Split Card */}
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
          <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-[#DFEAD6] bg-white shadow-xl lg:grid-cols-12">
            {/* Left Olive Brand Panel */}
            <div className="flex flex-col justify-between bg-gradient-to-b from-[#2E3B1F] to-[#232E17] p-8 text-white lg:col-span-5">
              <div>
                <div className="flex items-center gap-3.5">
                  <OliveBranchIllustration className="h-14 w-14 shrink-0" />
                  <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-white">
                      {settings.millTitle}
                    </h1>
                    <p className="mt-0.5 text-xs leading-snug text-[#B2BEA0]">
                      Maâsra Al Baraka — Gestion de votre moulin à huile d’olive
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-3 border-t border-[#3A4928] pt-6 text-xs text-[#CDD6BE]">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#B4C284]" />
                    <span>Suivi des apports d’olives & tickets de pesée</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#B4C284]" />
                    <span>Gestion des pressages, rendez-vous & clients pro</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#B4C284]" />
                    <span>Ventes d’huile en gros, stock grignon & paiements</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3 border-t border-[#3A4928] pt-5">
                <OliveBranchIllustration className="h-8 w-8 shrink-0 opacity-85" />
                <p className="text-xs italic leading-relaxed text-[#A3B18E]">
                  Une huile d’exception
                  <br />
                  par un savoir-faire local
                </p>
              </div>
            </div>

            {/* Right Login Form Panel */}
            <div className="flex flex-col justify-center p-8 sm:p-10 lg:col-span-7">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F1F6EC] px-3 py-1 text-xs font-semibold text-[#3B5224] border border-[#DFEAD6]">
                  <Lock className="h-3.5 w-3.5" />
                  Authentification requise
                </div>
                <h2 className="mt-3 font-display text-2xl font-bold text-[#1E2418]">
                  Connexion à votre espace
                </h2>
                <p className="mt-1 text-xs text-[#6E7464]">
                  Veuillez saisir votre nom d’utilisateur et votre mot de passe pour accéder au tableau de bord.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#454C3E]">
                    Nom d’utilisateur
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9282]" />
                    <input
                      type="text"
                      required
                      autoFocus
                      value={loginUsername}
                      onChange={(e) => {
                        setLoginUsername(e.target.value);
                        if (loginError) setLoginError('');
                      }}
                      placeholder="Ex: karim ou admin"
                      className="w-full rounded-xl border border-[#DCDFD5] bg-[#FAFAF7] py-2.5 pl-10 pr-4 text-sm text-[#1E2418] placeholder:text-[#9AA090] focus:border-[#566739] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#454C3E]">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9282]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (loginError) setLoginError('');
                      }}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[#DCDFD5] bg-[#FAFAF7] py-2.5 pl-10 pr-10 text-sm text-[#1E2418] placeholder:text-[#9AA090] focus:border-[#566739] focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C9282] hover:text-[#22261E] cursor-pointer"
                      title={showPassword ? 'Masquer' : 'Afficher'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#526134] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#44522A] transition-colors cursor-pointer"
                >
                  <Lock className="h-4 w-4" />
                  Se connecter au moulin
                </button>
              </form>

              {/* Quick Demo Credentials Helper */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#EAE6D7] bg-[#F6F4EC] px-4 py-3 text-xs text-[#5A5648]">
                <div>
                  <span className="font-semibold text-[#1E2418]">Accès Administrateur :</span>{' '}
                  Utilisateur <code className="font-mono font-bold text-[#3B5224]">{settings.username || 'karim'}</code> • Mot de passe{' '}
                  <code className="font-mono font-bold text-[#3B5224]">{settings.password || '1234'}</code>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLoginUsername(settings.username || 'karim');
                    setLoginPassword(settings.password || '1234');
                    setLoginError('');
                  }}
                  className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-[#526134] border border-[#DCDFD5] hover:bg-[#F1F6EC] cursor-pointer"
                >
                  Remplir
                </button>
              </div>
            </div>
          </div>
        </div>

        <OfflineIndicator />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0] text-[#22261E] select-none sm:select-auto">
      {/* Top Window Title Bar matching "Ma Presse v1.0.0" */}
      <div className="no-print flex h-8 items-center justify-between bg-[#253019] px-3.5 text-xs text-[#D5DEC6] border-b border-[#1D2613]">
        <div className="flex items-center gap-2">
          <OliveMiniIcon className="h-4 w-4 text-[#B4C284]" />
          <span className="font-semibold tracking-wide text-white">{settings.millTitle}</span>
          <span className="text-[11px] text-[#95A37F]">v1.0.0</span>
          {!isOnline && (
            <span className="ml-2 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-200">
              Mode Hors-Ligne Actif
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[#95A37F]">
          <button
            onClick={() =>
              exportAllDataCsv(
                proClients,
                resellers,
                passengers,
                pomaceLots,
                appointments,
                currency
              )
            }
            className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#C5D1A8] hover:text-white cursor-pointer"
            title="Exporter toutes les données en CSV"
          >
            <Download className="h-3 w-3" />
            Exporter CSV
          </button>
          <div className="flex items-center gap-2.5 pl-2">
            <Minus className="h-3 w-3 opacity-70" />
            <Square className="h-2.5 w-2.5 opacity-70" />
            <X className="h-3.5 w-3.5 opacity-70" />
          </div>
        </div>
      </div>

      {/* Main Split Workspace: Permanent Left Deep-Olive Sidebar + Right Cream/White Viewport */}
      <div className="no-print flex flex-1 flex-row min-h-[calc(100vh-2rem)]">
        {/* 1. Barre latérale (Sidebar) fixe à gauche */}
        <aside className="flex w-[220px] sm:w-[250px] shrink-0 flex-col justify-between bg-gradient-to-b from-[#2E3B1F] to-[#232E17] text-white border-r border-[#1D2613]">
          <div>
            {/* Brand Header inside Sidebar */}
            <div className="flex items-center gap-3 px-5 pt-6 pb-5">
              <OliveBranchIllustration className="h-11 w-11 shrink-0" />
              <div className="min-w-0">
                <div className="font-display text-lg sm:text-xl font-bold tracking-tight text-white truncate">
                  {settings.millTitle || 'معصرة الصغير'}
                </div>
                <div className="mt-0.5 text-[11px] sm:text-xs leading-snug text-[#B2BEA0]">
                  Gestion de votre moulin
                  <br />à huile d’olive
                </div>
              </div>
            </div>

            {/* Menu de navigation vertical à gauche (9 items) */}
            <nav className="flex flex-col gap-1 px-3.5 pb-6">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-2.5 text-left text-sm transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#566739] font-semibold text-white shadow-sm ring-1 ring-[#71844E]/50'
                        : 'font-medium text-[#CDD6BE] hover:bg-[#384726] hover:text-white'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-[#B4C29E]'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* En bas de la barre latérale : icône d'olive + mention textuelle */}
          <div className="flex items-center gap-3 border-t border-[#3A4928] px-5 py-5">
            <OliveBranchIllustration className="h-8 w-8 shrink-0 opacity-85" />
            <p className="text-xs italic leading-relaxed text-[#A3B18E]">
              Une huile d’exception
              <br />
              par un savoir-faire local
            </p>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col bg-[#F7F7F3] min-w-0 overflow-x-hidden">
          {/* 2. En-tête (Header) */}
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6E7E0] bg-white px-6 py-4">
            {/* Titre principal à gauche */}
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#1E2418]">
              {sectionTitles[activeTab]}
            </h1>

            {/* Barre de recherche globale au centre */}
            <div className="relative flex-1 max-w-md min-w-[220px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9282]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un client ou un ticket..."
                className="w-full rounded-full border border-[#E2E4DC] bg-[#F7F8F5] py-2 pl-10 pr-8 text-xs text-[#22261E] placeholder:text-[#8C9282] focus:border-[#566739] focus:bg-white focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C9282] hover:text-[#22261E] cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sélecteur de date interactif & Profil administrateur à droite */}
            <div className="flex items-center gap-4 text-xs text-[#454C3E]">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium text-[#22261E] hover:bg-[#F2F3EE] cursor-pointer"
                  title="Changer la date du jour"
                >
                  <Calendar className="h-4 w-4 text-[#566739]" />
                  <span>{formatLongDateFr(headerDate)}</span>
                </button>
                {isDatePickerOpen && (
                  <div className="absolute right-0 top-full z-40 mt-1.5 rounded-xl border border-[#E2E4DC] bg-white p-3 shadow-lg">
                    <label className="mb-1 block text-[11px] font-medium text-[#6E7464]">
                      Sélectionner la date :
                    </label>
                    <input
                      type="date"
                      value={headerDate}
                      onChange={(e) => {
                        setHeaderDate(e.target.value);
                        setApportDate(e.target.value);
                        setIsDatePickerOpen(false);
                      }}
                      className="rounded-lg border border-[#DCDFD5] px-2.5 py-1.5 font-mono text-xs text-[#1E2418] focus:border-[#566739] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="hidden sm:block h-5 w-px bg-[#E2E4DC]" />

              {/* Profil administrateur interactif */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1 hover:bg-[#F2F3EE] cursor-pointer"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#566739] text-white">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-[#22261E]">
                    {settings.adminName} —{' '}
                    <span className="font-normal text-[#6E7464]">{settings.adminRole}</span>
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#8C9282]" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full z-40 mt-1.5 w-52 rounded-xl border border-[#E2E4DC] bg-white py-1.5 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('parametres');
                        setIsProfileMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-[#22261E] hover:bg-[#F5F6F1] cursor-pointer"
                    >
                      <Sliders className="h-3.5 w-3.5 text-[#566739]" />
                      Paramètres du moulin
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        exportAllDataCsv(
                          proClients,
                          resellers,
                          passengers,
                          pomaceLots,
                          appointments,
                          currency
                        );
                        setIsProfileMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-[#22261E] hover:bg-[#F5F6F1] cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5 text-[#566739]" />
                      Exporter toutes les données
                    </button>
                    <div className="my-1 border-t border-[#E6E7E0]" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-medium text-[#9C4221] hover:bg-[#FCF3EE] cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>

              <PWAInstallButton />
            </div>
          </header>

          {/* Main Inner Canvas */}
          <main className="flex-1 p-5 sm:p-6 space-y-5 max-w-[1400px] w-full mx-auto">
            {/* =================================================================
                3. CARTES DE STATISTIQUES (4 KPI Cards sur une seule ligne)
               ================================================================= */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {/* KPI 1: Olives reçues (ex: 1 250 kg) */}
              <div className="flex items-center gap-4 rounded-2xl border border-[#DFEAD6] bg-[#F1F6EC] px-5 py-4 shadow-2xs">
                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-[#DFECD3] text-[#3B5224]">
                  <OliveMiniIcon className="h-7 w-7" color="#3B5224" />
                </div>
                <div>
                  <div className="text-xs font-medium text-[#4A5542]">Olives reçues</div>
                  <div className="mt-0.5 font-display text-2xl font-bold tracking-tight text-[#182012] tabular-nums">
                    {formatNumber(stats.apportKgTotal, 0)} kg
                  </div>
                </div>
              </div>

              {/* KPI 2: Pressages du jour (ex: 8) */}
              <div className="flex items-center gap-4 rounded-2xl border border-[#EAE4D2] bg-[#F8F6EE] px-5 py-4 shadow-2xs">
                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-[#EBE4CD] text-[#5C5332]">
                  <Settings className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs font-medium text-[#524E40]">Pressages du jour</div>
                  <div className="mt-0.5 font-display text-2xl font-bold tracking-tight text-[#1E1C14] tabular-nums">
                    {stats.pressagesCount}
                  </div>
                </div>
              </div>

              {/* KPI 3: Recettes pressage (ex: 420 DT) */}
              <div className="flex items-center gap-4 rounded-2xl border border-[#EFE4C4] bg-[#FCF8EB] px-5 py-4 shadow-2xs">
                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-[#F5E6B8]">
                  <CoinsKpiIcon className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-xs font-medium text-[#5C5238]">Recettes pressage</div>
                  <div className="mt-0.5 font-display text-2xl font-bold tracking-tight text-[#201A0C] tabular-nums">
                    {formatNumber(stats.apportRevenueDh, 0)} {currency}
                  </div>
                </div>
              </div>

              {/* KPI 4: Montants à recevoir (ex: 185 DT) */}
              <div className="flex items-center gap-4 rounded-2xl border border-[#F0DCD5] bg-[#FBF1EE] px-5 py-4 shadow-2xs">
                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-[#F4D6CC]">
                  <WalletKpiIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs font-medium text-[#5E4740]">Montants à recevoir</div>
                  <div className="mt-0.5 font-display text-2xl font-bold tracking-tight text-[#241612] tabular-nums">
                    {formatNumber(stats.apportRemaining, 0)} {currency}
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================================
                VIEW 1: TABLEAU DE BORD (4. Section centrale + 5. Tableau du bas)
               ================================================================= */}
            {activeTab === 'dashboard' && (
              <div className="space-y-5">
                {/* 4. Section centrale (Grille principale : Gauche "Nouvel apport d'olives" + Droite "Activité récente") */}
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                  {/* À gauche : Formulaire "Nouvel apport d'olives" */}
                  <div className="xl:col-span-8 rounded-2xl border border-[#E5E6DF] bg-white p-6 shadow-2xs">
                    <div className="flex items-center justify-between gap-2 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#566739] text-white">
                          <Plus className="h-4 w-4 stroke-[2.5]" />
                        </div>
                        <h2 className="font-display text-lg font-bold text-[#1E2418]">
                          Nouvel apport d’olives
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCustomClient(!isCustomClient)}
                        className="text-xs font-medium text-[#566739] hover:underline cursor-pointer"
                      >
                        {isCustomClient ? 'Choisir dans la liste' : '+ Nouveau client'}
                      </button>
                    </div>

                    <form onSubmit={handleRecordApport} className="space-y-4">
                      {/* Row 1: Client (menu déroulant) & Date */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-[#3A4034]">
                            Client
                          </label>
                          {!isCustomClient ? (
                            <div className="relative">
                              <select
                                value={apportClient}
                                onChange={(e) => setApportClient(e.target.value)}
                                className="w-full appearance-none rounded-lg border border-[#DCDFD5] bg-white px-3.5 py-2.5 pr-9 text-sm text-[#1E2418] focus:border-[#566739] focus:outline-none"
                              >
                                {allClientNames.map((name) => (
                                  <option key={name} value={name}>
                                    {name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E7464]" />
                            </div>
                          ) : (
                            <input
                              type="text"
                              required
                              value={apportCustomClient}
                              onChange={(e) => setApportCustomClient(e.target.value)}
                              placeholder="Nom et prénom du client..."
                              className="w-full rounded-lg border border-[#DCDFD5] bg-white px-3.5 py-2.5 text-sm text-[#1E2418] focus:border-[#566739] focus:outline-none"
                            />
                          )}
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-[#3A4034]">
                            Date
                          </label>
                          <div className="relative">
                            <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E7464]" />
                            <input
                              type="date"
                              required
                              value={apportDate}
                              onChange={(e) => setApportDate(e.target.value)}
                              className="w-full rounded-lg border border-[#DCDFD5] bg-white py-2.5 pl-10 pr-3.5 font-mono text-sm text-[#1E2418] focus:border-[#566739] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Poids des olives (kg) & Tarif au kilo (en DT/kg) */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-[#3A4034]">
                            Poids des olives
                          </label>
                          <div className="flex overflow-hidden rounded-lg border border-[#DCDFD5] bg-white focus-within:border-[#566739]">
                            <input
                              type="number"
                              required
                              min="1"
                              step="1"
                              value={apportWeightKg}
                              onChange={(e) => setApportWeightKg(e.target.value)}
                              className="w-full px-3.5 py-2.5 font-mono text-sm text-[#1E2418] focus:outline-none tabular-nums"
                            />
                            <span className="flex items-center border-l border-[#DCDFD5] bg-[#EFEFE9] px-4 text-xs font-medium text-[#4A5043]">
                              kg
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-[#3A4034]">
                            Tarif au kilo
                          </label>
                          <div className="flex overflow-hidden rounded-lg border border-[#DCDFD5] bg-white focus-within:border-[#566739]">
                            <input
                              type="number"
                              required
                              min="0.05"
                              step="0.05"
                              value={apportRatePerKg}
                              onChange={(e) => setApportRatePerKg(e.target.value)}
                              className="w-full px-3.5 py-2.5 font-mono text-sm text-[#1E2418] focus:outline-none tabular-nums"
                            />
                            <span className="flex items-center border-l border-[#DCDFD5] bg-[#EFEFE9] px-3.5 text-xs font-medium text-[#4A5043] whitespace-nowrap">
                              {currency} / kg
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Row 3: Blocs de calcul automatique (Total pressage, Payé, Reste) & bouton d'enregistrement vert */}
                      <div className="pt-2 flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex-1 grid grid-cols-1 gap-4 rounded-xl bg-[#F6F4EC] border border-[#EAE6D7] px-4 py-3 sm:grid-cols-3 sm:items-center">
                          {/* Total pressage */}
                          <div>
                            <div className="text-xs text-[#5A5648]">Total pressage :</div>
                            <div className="mt-0.5 font-display text-xl font-bold text-[#6A5A28] tabular-nums">
                              {formatDh(apportTotalDh, currency)}
                            </div>
                          </div>

                          {/* Payé */}
                          <div className="sm:border-l sm:border-[#E2DEC9] sm:pl-4">
                            <label className="mb-1 block text-xs text-[#5A5648]">Payé :</label>
                            <div className="flex overflow-hidden rounded-md border border-[#D8D4C2] bg-white">
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={apportPaidDh}
                                onChange={(e) => setApportPaidDh(e.target.value)}
                                className="w-full px-2.5 py-1.5 font-mono text-xs font-semibold text-[#1E2418] focus:outline-none tabular-nums"
                              />
                              <span className="flex items-center border-l border-[#D8D4C2] bg-[#EFEFE9] px-2 text-[11px] font-medium text-[#5A5648]">
                                {currency}
                              </span>
                            </div>
                          </div>

                          {/* Reste */}
                          <div>
                            <label className="mb-1 block text-xs text-[#5A5648]">Reste :</label>
                            <div className="flex overflow-hidden rounded-md border border-[#D8D4C2] bg-white">
                              <input
                                type="text"
                                readOnly
                                value={formatNumber(apportRemainingDh, 2)}
                                className="w-full bg-white px-2.5 py-1.5 font-mono text-xs font-semibold text-[#1E2418] focus:outline-none tabular-nums"
                              />
                              <span className="flex items-center border-l border-[#D8D4C2] bg-[#EFEFE9] px-2 text-[11px] font-medium text-[#5A5648]">
                                {currency}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bouton d'enregistrement vert */}
                        <button
                          type="submit"
                          className="flex items-center justify-center gap-2.5 rounded-xl bg-[#526134] px-6 py-4 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#424F29] whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Save className="h-4 w-4" />
                          Enregistrer l’apport
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* À droite : Panneau "Activité récente" */}
                  <div className="xl:col-span-4 flex flex-col justify-between rounded-2xl border border-[#E5E6DF] bg-white p-6 shadow-2xs">
                    <div>
                      <div className="flex items-center gap-2.5 pb-4 border-b border-[#EFEFE9]">
                        <Clock className="h-5 w-5 text-[#4A5A2E]" />
                        <h2 className="font-display text-base font-bold text-[#1E2418]">
                          Activité récente
                        </h2>
                      </div>

                      <div className="divide-y divide-[#EFEFE9]">
                        {apports.slice(0, 2).map((item) => (
                          <div
                            key={item.ticketNumber}
                            className="flex items-center justify-between py-4 text-xs"
                          >
                            <div>
                              <div className="font-bold text-sm text-[#1E2418]">
                                {item.clientName}
                              </div>
                              <div className="mt-1 font-mono text-[11px] text-[#7A8070] tabular-nums">
                                {formatDateFr(item.date)} &nbsp; {item.time}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-medium text-[#3A4034] tabular-nums">
                                {formatNumber(item.weightKg, 0)} kg
                              </span>
                              <span className="h-4 w-px bg-[#E2E4DC]" />
                              <span className="font-mono text-sm font-bold text-[#6A5A28] tabular-nums">
                                {formatDh(item.totalAmount, currency)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('apports')}
                      className="mt-4 flex w-full items-center justify-between rounded-lg border border-[#E5E6DF] bg-[#F7F7F3] px-4 py-2.5 text-xs font-medium text-[#4A5043] transition-colors hover:bg-[#EFEFE8] cursor-pointer"
                    >
                      <span>Voir toute l’activité</span>
                      <ChevronRight className="h-4 w-4 text-[#7A8070]" />
                    </button>
                  </div>
                </div>

                {/* 5. Tableau du bas : Section "Derniers apports" */}
                <div className="rounded-2xl border border-[#E5E6DF] bg-white p-6 shadow-2xs">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#566739] text-white">
                        <FileText className="h-4 w-4" />
                      </div>
                      <h2 className="font-display text-base font-bold text-[#1E2418]">
                        Derniers apports
                      </h2>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-[#E6E7E0]">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-[#E6E7E0] bg-[#F2F3EE] text-[#4A5043]">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Ticket</th>
                          <th className="px-4 py-3 font-semibold">Client</th>
                          <th className="px-4 py-3 font-semibold">Poids</th>
                          <th className="px-4 py-3 font-semibold">Tarif/kg</th>
                          <th className="px-4 py-3 font-semibold">Total</th>
                          <th className="px-4 py-3 font-semibold">Payé</th>
                          <th className="px-4 py-3 font-semibold">Reste</th>
                          <th className="px-4 py-3 font-semibold">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFEFE9]">
                        {filteredApports.slice(0, 4).map((apport) => (
                          <tr
                            key={apport.ticketNumber}
                            onClick={() => openApportReceipt(apport)}
                            title="Cliquer pour afficher et imprimer le ticket"
                            className="hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                          >
                            <td className="px-4 py-3.5 font-mono font-semibold text-[#22261E] tabular-nums">
                              {apport.ticketNumber}
                            </td>
                            <td className="px-4 py-3.5 font-medium text-[#22261E]">
                              {apport.clientName}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-[#3A4034] tabular-nums">
                              {formatNumber(apport.weightKg, 0)} kg
                            </td>
                            <td className="px-4 py-3.5 font-mono text-[#3A4034] tabular-nums">
                              {formatNumber(apport.ratePerKg, 2)} {currency}
                            </td>
                            <td className="px-4 py-3.5 font-mono font-bold text-[#1E2418] tabular-nums">
                              {formatDh(apport.totalAmount, currency)}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-[#3A4034] tabular-nums">
                              {formatDh(apport.paidAmount, currency)}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-[#3A4034] tabular-nums">
                              {formatDh(apport.remainingAmount, currency)}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="inline-block rounded-md bg-[#E3F0D8] px-3 py-1 text-xs font-semibold text-[#3C5A24]">
                                {apport.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Bouton "Voir tous les apports" aligné à droite en bas du tableau */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setActiveTab('apports')}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#DCDFD5] bg-[#F7F7F3] px-4 py-2 text-xs font-medium text-[#3A4034] hover:bg-[#EFEFE8] cursor-pointer"
                    >
                      <span>Voir tous les apports</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================
                VIEW 2: CLIENTS (Clients Professionnels & Clients Passagers)
               ================================================================= */}
            {activeTab === 'clients' && (
              <div className="space-y-5">
                {/* Sub-nav between Clients Pro and Clients Passagers */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5E6DF] bg-white px-5 py-4 shadow-2xs">
                  <div className="flex items-center gap-2 rounded-xl bg-[#F2F3EE] p-1">
                    <button
                      onClick={() => setClientsSubTab('pro')}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        clientsSubTab === 'pro'
                          ? 'bg-[#526134] text-white'
                          : 'text-[#4A5043] hover:text-[#1E2418]'
                      }`}
                    >
                      Compte Clients Professionnels ({proClients.length})
                    </button>
                    <button
                      onClick={() => setClientsSubTab('passagers')}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        clientsSubTab === 'passagers'
                          ? 'bg-[#526134] text-white'
                          : 'text-[#4A5043] hover:text-[#1E2418]'
                      }`}
                    >
                      Clients Normaux ou Passagers ({passengers.length})
                    </button>
                  </div>

                  {clientsSubTab === 'pro' && (
                    <button
                      onClick={() => setIsProModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-[#526134] px-4 py-2 text-xs font-semibold text-white hover:bg-[#424F29] cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Nouveau Client Professionnel
                    </button>
                  )}
                </div>

                {clientsSubTab === 'pro' ? (
                  <div className="rounded-2xl border border-[#E5E6DF] bg-white p-6 shadow-2xs space-y-4">
                    <div className="overflow-x-auto rounded-xl border border-[#E6E7E0]">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-[#E6E7E0] bg-[#F2F3EE] text-[#4A5043]">
                          <tr>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">ID Pro</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">Nom & Prénom</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">Téléphone</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">Matricule(s) des camions</th>
                            <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Tonnage (t)</th>
                            <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Prix/kg</th>
                            <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Total Presse</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">Date</th>
                            <th className="px-4 py-3 font-semibold">Observations</th>
                            <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFEFE9]">
                          {filteredProClients.map((client) => {
                            const totalDh = client.oliveTonnage * 1000 * client.pressPricePerKg;
                            return (
                              <tr key={client.id} className="hover:bg-[#FAF9F5]">
                                <td className="px-4 py-3.5 font-mono font-semibold text-[#1E2418] whitespace-nowrap">
                                  {client.id}
                                </td>
                                <td className="px-4 py-3.5 font-medium text-[#1E2418] whitespace-nowrap">
                                  {client.fullName}
                                </td>
                                <td className="px-4 py-3.5 font-mono text-[#4A5043] whitespace-nowrap">
                                  {client.phone}
                                </td>
                                <td className="px-4 py-3.5 font-mono text-[#3A4034] whitespace-nowrap">
                                  {client.truckPlates}
                                </td>
                                <td className="px-4 py-3.5 text-right font-mono font-semibold text-[#1E2418] whitespace-nowrap tabular-nums">
                                  {formatNumber(client.oliveTonnage, 2)} t
                                </td>
                                <td className="px-4 py-3.5 text-right font-mono text-[#4A5043] whitespace-nowrap tabular-nums">
                                  {formatNumber(client.pressPricePerKg, 2)} {currency}/kg
                                </td>
                                <td className="px-4 py-3.5 text-right font-mono font-bold text-[#6A5A28] whitespace-nowrap tabular-nums">
                                  {formatDh(totalDh, currency)}
                                </td>
                                <td className="px-4 py-3.5 font-mono text-[#6E7464] whitespace-nowrap tabular-nums">
                                  {formatDateFr(client.date)}
                                </td>
                                <td className="px-4 py-3.5 max-w-xs text-[#4A5043]">
                                  <div className="line-clamp-2" title={client.observations}>
                                    {client.observations}
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      onClick={() => openProReceipt(client)}
                                      className="inline-flex items-center gap-1 rounded-md border border-[#DCDFD5] px-2.5 py-1 text-xs font-medium text-[#3A4034] hover:bg-[#F2F3EE] cursor-pointer"
                                    >
                                      <Printer className="h-3 w-3" />
                                      Reçu
                                    </button>
                                    <button
                                      onClick={() =>
                                        setProClients((prev) =>
                                          prev.filter((item) => item.id !== client.id)
                                        )
                                      }
                                      className="rounded-md p-1.5 text-[#8C9282] hover:bg-red-50 hover:text-red-600 cursor-pointer"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <form
                      onSubmit={handleAddPassenger}
                      className="rounded-2xl border border-[#E5E6DF] bg-white p-6 shadow-2xs"
                    >
                      <div className="mb-4 flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#566739] text-white">
                          <Plus className="h-4 w-4" />
                        </div>
                        <h2 className="font-display text-base font-bold text-[#1E2418]">
                          Enregistrement Rapide — Client Passager
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-6">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                            Nom & Prénom *
                          </label>
                          <input
                            type="text"
                            required
                            value={passengerForm.fullName}
                            onChange={(e) =>
                              setPassengerForm({ ...passengerForm, fullName: e.target.value })
                            }
                            placeholder="Ex: Fatma Gharbi"
                            className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 text-xs text-[#1E2418]"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                            Téléphone
                          </label>
                          <input
                            type="text"
                            value={passengerForm.phone}
                            onChange={(e) =>
                              setPassengerForm({ ...passengerForm, phone: e.target.value })
                            }
                            placeholder="06 61 XX XX XX"
                            className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 font-mono text-xs text-[#1E2418]"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                            Olives à presser (kg)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={passengerForm.oliveQuantityKg}
                            onChange={(e) =>
                              setPassengerForm({
                                ...passengerForm,
                                oliveQuantityKg: e.target.value,
                              })
                            }
                            placeholder="250"
                            className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 font-mono text-xs text-[#1E2418]"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                            Huile achetée (L)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={passengerForm.oilPurchasedLiters}
                            onChange={(e) =>
                              setPassengerForm({
                                ...passengerForm,
                                oilPurchasedLiters: e.target.value,
                              })
                            }
                            placeholder="0"
                            className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 font-mono text-xs text-[#1E2418]"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                            Mode / Statut
                          </label>
                          <select
                            value={passengerForm.modeStatus}
                            onChange={(e) =>
                              setPassengerForm({
                                ...passengerForm,
                                modeStatus: e.target.value as PassengerModeStatus,
                              })
                            }
                            className="w-full rounded-lg border border-[#DCDFD5] bg-white px-2.5 py-2 text-xs text-[#1E2418]"
                          >
                            {PASSENGER_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            type="submit"
                            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#526134] px-4 py-2 text-xs font-semibold text-white hover:bg-[#424F29] cursor-pointer"
                          >
                            <Save className="h-3.5 w-3.5" />
                            Enregistrer
                          </button>
                        </div>
                      </div>
                    </form>

                    <div className="rounded-2xl border border-[#E5E6DF] bg-white p-6 shadow-2xs">
                      <div className="overflow-x-auto rounded-xl border border-[#E6E7E0]">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-[#E6E7E0] bg-[#F2F3EE] text-[#4A5043]">
                            <tr>
                              <th className="px-4 py-3 font-semibold">ID Passager</th>
                              <th className="px-4 py-3 font-semibold">Nom & Prénom</th>
                              <th className="px-4 py-3 font-semibold">Téléphone</th>
                              <th className="px-4 py-3 text-right font-semibold">Olives à presser (kg)</th>
                              <th className="px-4 py-3 text-right font-semibold">Huile achetée (L)</th>
                              <th className="px-4 py-3 font-semibold">Mode / Statut</th>
                              <th className="px-4 py-3 font-semibold">Date</th>
                              <th className="px-4 py-3 text-right font-semibold">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#EFEFE9]">
                            {filteredPassengers.map((p) => (
                              <tr key={p.id} className="hover:bg-[#FAF9F5]">
                                <td className="px-4 py-3.5 font-mono font-semibold text-[#1E2418]">
                                  {p.id}
                                </td>
                                <td className="px-4 py-3.5 font-medium text-[#1E2418]">
                                  {p.fullName}
                                </td>
                                <td className="px-4 py-3.5 font-mono text-[#4A5043]">{p.phone}</td>
                                <td className="px-4 py-3.5 text-right font-mono font-semibold text-[#1E2418]">
                                  {p.oliveQuantityKg > 0
                                    ? `${formatNumber(p.oliveQuantityKg, 0)} kg`
                                    : '—'}
                                </td>
                                <td className="px-4 py-3.5 text-right font-mono font-semibold text-[#6A5A28]">
                                  {p.oilPurchasedLiters > 0
                                    ? `${formatNumber(p.oilPurchasedLiters, 0)} L`
                                    : '—'}
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className="inline-block rounded-md bg-[#E3F0D8] px-2.5 py-1 text-xs font-semibold text-[#3C5A24]">
                                    {p.modeStatus}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 font-mono text-[#6E7464]">
                                  {formatDateFr(p.date)}
                                </td>
                                <td className="px-4 py-3.5 text-right">
                                  <button
                                    onClick={() => openPassengerReceipt(p)}
                                    className="inline-flex items-center gap-1 rounded-md border border-[#DCDFD5] px-2.5 py-1 text-xs font-medium text-[#3A4034] hover:bg-[#F2F3EE] cursor-pointer"
                                  >
                                    <Printer className="h-3 w-3" />
                                    Ticket
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =================================================================
                VIEW 3: APPORTS D'OLIVES (Registre complet des tickets d'apports)
               ================================================================= */}
            {activeTab === 'apports' && (
              <div className="rounded-2xl border border-[#E5E6DF] bg-white p-6 shadow-2xs space-y-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="font-display text-base font-bold text-[#1E2418]">
                      Tous les Apports d’Olives ({filteredApports.length} tickets)
                    </h2>
                    <p className="text-xs text-[#6E7464]">
                      Historique complet des réceptions d’olives avec calcul automatique des montants payés et restants.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="flex items-center gap-1.5 rounded-lg bg-[#526134] px-4 py-2 text-xs font-semibold text-white hover:bg-[#424F29] cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Nouvel apport d’olives
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#E6E7E0]">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#E6E7E0] bg-[#F2F3EE] text-[#4A5043]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Ticket</th>
                        <th className="px-4 py-3 font-semibold">Client</th>
                        <th className="px-4 py-3 font-semibold">Date & Heure</th>
                        <th className="px-4 py-3 font-semibold">Poids</th>
                        <th className="px-4 py-3 font-semibold">Tarif/kg</th>
                        <th className="px-4 py-3 font-semibold">Total</th>
                        <th className="px-4 py-3 font-semibold">Payé</th>
                        <th className="px-4 py-3 font-semibold">Reste</th>
                        <th className="px-4 py-3 font-semibold">Statut</th>
                        <th className="px-4 py-3 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFEFE9]">
                      {filteredApports.map((apport) => (
                        <tr key={apport.ticketNumber} className="hover:bg-[#FAF9F5]">
                          <td className="px-4 py-3.5 font-mono font-semibold text-[#22261E]">
                            {apport.ticketNumber}
                          </td>
                          <td className="px-4 py-3.5 font-medium text-[#22261E]">
                            {apport.clientName}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[#6E7464]">
                            {formatDateFr(apport.date)} {apport.time}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[#3A4034] tabular-nums">
                            {formatNumber(apport.weightKg, 0)} kg
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[#3A4034] tabular-nums">
                            {formatNumber(apport.ratePerKg, 2)} {currency}
                          </td>
                          <td className="px-4 py-3.5 font-mono font-bold text-[#1E2418] tabular-nums">
                            {formatDh(apport.totalAmount, currency)}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[#3A4034] tabular-nums">
                            {formatDh(apport.paidAmount, currency)}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[#3A4034] tabular-nums">
                            {formatDh(apport.remainingAmount, currency)}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-block rounded-md bg-[#E3F0D8] px-3 py-1 text-xs font-semibold text-[#3C5A24]">
                              {apport.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => openApportReceipt(apport)}
                              className="inline-flex items-center gap-1 rounded-md border border-[#DCDFD5] px-2.5 py-1 text-xs font-medium text-[#3A4034] hover:bg-[#F2F3EE] cursor-pointer"
                            >
                              <Printer className="h-3 w-3" />
                              Imprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =================================================================
                VIEW 4: PRESSAGES (Calendrier Mensuel + Planning RDV)
               ================================================================= */}
            {activeTab === 'pressages' && (
              <div className="space-y-5">
                <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[#E5E6DF] bg-white px-5 py-4 shadow-2xs sm:flex-row sm:items-center">
                  <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#F2F3EE] p-1">
                    <button
                      onClick={() => setAppointmentViewMode('both')}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        appointmentViewMode === 'both'
                          ? 'bg-[#526134] text-white'
                          : 'text-[#4A5043] hover:text-[#1E2418]'
                      }`}
                    >
                      Calendrier + Liste
                    </button>
                    <button
                      onClick={() => setAppointmentViewMode('calendar')}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        appointmentViewMode === 'calendar'
                          ? 'bg-[#526134] text-white'
                          : 'text-[#4A5043] hover:text-[#1E2418]'
                      }`}
                    >
                      Calendrier Mensuel Seul
                    </button>
                    <button
                      onClick={() => setAppointmentViewMode('list')}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        appointmentViewMode === 'list'
                          ? 'bg-[#526134] text-white'
                          : 'text-[#4A5043] hover:text-[#1E2418]'
                      }`}
                    >
                      Tableau Seul
                    </button>
                  </div>

                  <button
                    onClick={() => setIsAppointmentModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#526134] px-4 py-2 text-xs font-semibold text-white hover:bg-[#424F29] cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Nouveau Rendez-vous de Pressage
                  </button>
                </div>

                {(appointmentViewMode === 'both' || appointmentViewMode === 'calendar') && (
                  <MonthlyCalendar
                    appointments={appointments}
                    currentMonthDate={calendarMonth}
                    selectedDate={selectedCalendarDate}
                    onChangeMonth={setCalendarMonth}
                    onSelectDate={setSelectedCalendarDate}
                    onQuickAddForDate={(isoDate) => {
                      setAppointmentForm((prev) => ({ ...prev, date: isoDate }));
                      setIsAppointmentModalOpen(true);
                    }}
                  />
                )}

                {(appointmentViewMode === 'both' || appointmentViewMode === 'list') && (
                  <div className="rounded-2xl border border-[#E5E6DF] bg-white p-6 shadow-2xs space-y-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#F2F3EE] p-1">
                        <button
                          onClick={() => setAppointmentStatusFilter('ALL')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            appointmentStatusFilter === 'ALL'
                              ? 'bg-[#526134] text-white'
                              : 'text-[#4A5043] hover:text-[#1E2418]'
                          }`}
                        >
                          Tous ({appointments.length})
                        </button>
                        {APPOINTMENT_STATUSES.map((st) => (
                          <button
                            key={st}
                            onClick={() => setAppointmentStatusFilter(st)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                              appointmentStatusFilter === st
                                ? 'bg-[#526134] text-white'
                                : 'text-[#4A5043] hover:text-[#1E2418]'
                            }`}
                          >
                            {st} ({appointments.filter((a) => a.status === st).length})
                          </button>
                        ))}
                      </div>

                      {selectedCalendarDate && (
                        <div className="flex items-center gap-2 rounded-lg bg-[#F1F6EC] border border-[#DFEAD6] px-3 py-1.5 text-xs text-[#2E4B19]">
                          <span>
                            Jour sélectionné :{' '}
                            <strong className="font-mono">{formatDateFr(selectedCalendarDate)}</strong>
                          </span>
                          <button
                            onClick={() => setSelectedCalendarDate(null)}
                            className="ml-1 rounded p-0.5 hover:bg-[#DCE9CE] cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-[#E6E7E0]">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-[#E6E7E0] bg-[#F2F3EE] text-[#4A5043]">
                          <tr>
                            <th className="px-4 py-3 font-semibold">N° RDV</th>
                            <th className="px-4 py-3 font-semibold">Date & Créneau</th>
                            <th className="px-4 py-3 font-semibold">Client</th>
                            <th className="px-4 py-3 font-semibold">Téléphone</th>
                            <th className="px-4 py-3 font-semibold">Opération & Chaîne</th>
                            <th className="px-4 py-3 text-right font-semibold">Quantité Prévue</th>
                            <th className="px-4 py-3 font-semibold">Statut</th>
                            <th className="px-4 py-3 font-semibold">Notes</th>
                            <th className="px-4 py-3 text-right font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFEFE9]">
                          {filteredAppointments.map((rdv) => (
                            <tr key={rdv.id} className="hover:bg-[#FAF9F5]">
                              <td className="px-4 py-3.5 font-mono font-semibold text-[#1E2418]">
                                {rdv.id}
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <div className="font-mono font-semibold text-[#1E2418]">
                                  {formatDateFr(rdv.date)}
                                </div>
                                <div className="font-mono text-[11px] text-[#6E7464]">
                                  {rdv.timeSlot}
                                </div>
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="font-medium text-[#1E2418]">{rdv.clientName}</div>
                                <div className="text-[11px] text-[#6E7464]">{rdv.clientType}</div>
                              </td>
                              <td className="px-4 py-3.5 font-mono text-[#4A5043]">{rdv.phone}</td>
                              <td className="px-4 py-3.5">
                                <div className="font-medium text-[#1E2418]">{rdv.operationType}</div>
                                <div className="text-[11px] text-[#6E7464]">{rdv.pressLine}</div>
                              </td>
                              <td className="px-4 py-3.5 text-right font-mono font-bold text-[#6A5A28]">
                                {rdv.estimatedQuantity}
                              </td>
                              <td className="px-4 py-3.5">
                                <select
                                  value={rdv.status}
                                  onChange={(e) => {
                                    const next = e.target.value as AppointmentStatus;
                                    setAppointments((prev) =>
                                      prev.map((item) =>
                                        item.id === rdv.id ? { ...item, status: next } : item
                                      )
                                    );
                                  }}
                                  className="rounded-md border border-[#DCDFD5] bg-[#E3F0D8] px-2.5 py-1 text-xs font-semibold text-[#3C5A24]"
                                >
                                  {APPOINTMENT_STATUSES.map((st) => (
                                    <option key={st} value={st}>
                                      {st}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3.5 max-w-xs text-[#4A5043]">
                                <div className="line-clamp-2" title={rdv.notes}>
                                  {rdv.notes}
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                <button
                                  onClick={() => openAppointmentReceipt(rdv)}
                                  className="inline-flex items-center gap-1 rounded-md border border-[#DCDFD5] px-2.5 py-1 text-xs font-medium text-[#3A4034] hover:bg-[#F2F3EE] cursor-pointer"
                                >
                                  <Printer className="h-3 w-3" />
                                  Bon RDV
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =================================================================
                VIEW 5: VENTES (Compte de Revendeurs d'Huile)
               ================================================================= */}
            {activeTab === 'ventes' && (
              <div className="rounded-2xl border border-[#E5E6DF] bg-white p-6 shadow-2xs space-y-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="font-display text-base font-bold text-[#1E2418]">
                      Compte de Revendeurs d’Huile & Ventes en Gros
                    </h2>
                    <p className="text-xs text-[#6E7464]">
                      Volume total :{' '}
                      <span className="font-mono font-bold text-[#1E2418]">
                        {formatNumber(stats.resellerOilLiters, 0)} Litres
                      </span>{' '}
                      · Total ventes :{' '}
                      <span className="font-mono font-bold text-[#6A5A28]">
                        {formatDh(stats.resellerRevenueDh, currency)}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => setIsResellerModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#526134] px-4 py-2 text-xs font-semibold text-white hover:bg-[#424F29] cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Nouvelle Vente Revendeur
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#E6E7E0]">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#E6E7E0] bg-[#F2F3EE] text-[#4A5043]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">ID Revendeur</th>
                        <th className="px-4 py-3 font-semibold">Nom & Prénom / Société</th>
                        <th className="px-4 py-3 font-semibold">Téléphone</th>
                        <th className="px-4 py-3 text-right font-semibold">Quantité (Litres)</th>
                        <th className="px-4 py-3 text-right font-semibold">Prix/L</th>
                        <th className="px-4 py-3 text-right font-semibold">Montant Total (Auto)</th>
                        <th className="px-4 py-3 font-semibold">Date</th>
                        <th className="px-4 py-3 font-semibold">Notes</th>
                        <th className="px-4 py-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFEFE9]">
                      {filteredResellers.map((r) => (
                        <tr key={r.id} className="hover:bg-[#FAF9F5]">
                          <td className="px-4 py-3.5 font-mono font-semibold text-[#1E2418]">
                            {r.id}
                          </td>
                          <td className="px-4 py-3.5 font-medium text-[#1E2418]">
                            {r.nameOrCompany}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[#4A5043]">{r.phone}</td>
                          <td className="px-4 py-3.5 text-right font-mono font-semibold text-[#1E2418]">
                            {formatNumber(r.oilQuantityLiters, 0)} L
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-[#4A5043]">
                            {formatNumber(r.pricePerLiter, 2)} {currency}/L
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-[#6A5A28]">
                            {formatDh(r.totalAmount, currency)}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[#6E7464]">
                            {formatDateFr(r.date)}
                          </td>
                          <td className="px-4 py-3.5 max-w-xs text-[#4A5043]">
                            <div className="line-clamp-2" title={r.notes}>
                              {r.notes}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => openResellerReceipt(r)}
                              className="inline-flex items-center gap-1 rounded-md border border-[#DCDFD5] px-2.5 py-1 text-xs font-medium text-[#3A4034] hover:bg-[#F2F3EE] cursor-pointer"
                            >
                              <Printer className="h-3 w-3" />
                              Facture
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =================================================================
                VIEW 6: STOCK (Gestion des Sous-Produits Grignon / Pomace)
               ================================================================= */}
            {activeTab === 'stock' && (
              <div className="rounded-2xl border border-[#E5E6DF] bg-white p-6 shadow-2xs space-y-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="font-display text-base font-bold text-[#1E2418]">
                      Stock & Gestion des Sous-Produits (Grignon / Pomace)
                    </h2>
                    <p className="text-xs text-[#6E7464]">
                      Poids total produit :{' '}
                      <span className="font-mono font-bold text-[#1E2418]">
                        {formatNumber(stats.totalPomaceKg, 0)} kg
                      </span>{' '}
                      · Recettes grignon vendu :{' '}
                      <span className="font-mono font-bold text-[#6A5A28]">
                        {formatDh(stats.pomaceRevenueDh, currency)}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPomaceModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#526134] px-4 py-2 text-xs font-semibold text-white hover:bg-[#424F29] cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Nouveau Lot de Grignon
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#E6E7E0]">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#E6E7E0] bg-[#F2F3EE] text-[#4A5043]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">N° Lot / Bon</th>
                        <th className="px-4 py-3 font-semibold">Client (Pro ou Passager)</th>
                        <th className="px-4 py-3 text-right font-semibold">Poids de Grignon Produit (kg)</th>
                        <th className="px-4 py-3 font-semibold">Destination</th>
                        <th className="px-4 py-3 text-right font-semibold">Prix de vente (si vendu)</th>
                        <th className="px-4 py-3 font-semibold">Date</th>
                        <th className="px-4 py-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFEFE9]">
                      {filteredPomace.map((lot) => (
                        <tr key={lot.lotNumber} className="hover:bg-[#FAF9F5]">
                          <td className="px-4 py-3.5 font-mono font-semibold text-[#1E2418]">
                            {lot.lotNumber}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-medium text-[#1E2418]">{lot.clientName}</span>
                            <span className="ml-2 text-[11px] text-[#6E7464]">
                              ({lot.clientType})
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-semibold text-[#1E2418]">
                            {formatNumber(lot.pomaceWeightKg, 0)} kg
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${
                                lot.destination === 'Vendu'
                                  ? 'bg-[#E3F0D8] text-[#3C5A24]'
                                  : 'bg-[#F2F3EE] text-[#4A5043]'
                              }`}
                            >
                              {lot.destination}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-[#6A5A28]">
                            {lot.destination === 'Vendu'
                              ? formatDh(lot.salePriceDh, currency)
                              : '—'}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[#6E7464]">
                            {formatDateFr(lot.date)}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => openPomaceReceipt(lot)}
                              className="inline-flex items-center gap-1 rounded-md border border-[#DCDFD5] px-2.5 py-1 text-xs font-medium text-[#3A4034] hover:bg-[#F2F3EE] cursor-pointer"
                            >
                              <Printer className="h-3 w-3" />
                              Bon
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =================================================================
                VIEW 7: PAIEMENTS
               ================================================================= */}
            {activeTab === 'paiements' && (
              <div className="rounded-2xl border border-[#E5E6DF] bg-white p-6 shadow-2xs space-y-5">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="font-display text-base font-bold text-[#1E2418]">
                      Suivi des Paiements & Encaissements des Restes à Recevoir
                    </h2>
                    <p className="text-xs text-[#6E7464]">
                      Encaissez en un clic les soldes restants sur les tickets d’apports, clients professionnels et revendeurs.
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FBF1EE] border border-[#F0DCD5] px-4 py-2 text-xs font-semibold text-[#7D4E2D]">
                    Montants à recevoir (Apports) :{' '}
                    <span className="font-mono font-bold">
                      {formatDh(stats.apportRemaining, currency)}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#E6E7E0]">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#E6E7E0] bg-[#F2F3EE] text-[#4A5043]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Ticket / Réf</th>
                        <th className="px-4 py-3 font-semibold">Catégorie</th>
                        <th className="px-4 py-3 font-semibold">Client</th>
                        <th className="px-4 py-3 text-right font-semibold">Total</th>
                        <th className="px-4 py-3 text-right font-semibold">Payé</th>
                        <th className="px-4 py-3 text-right font-semibold">Reste</th>
                        <th className="px-4 py-3 text-right font-semibold">Statut / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFEFE9]">
                      {apports.map((a) => (
                        <tr key={a.ticketNumber} className="hover:bg-[#FAF9F5]">
                          <td className="px-4 py-3 font-mono font-semibold text-[#1E2418]">
                            {a.ticketNumber}
                          </td>
                          <td className="px-4 py-3 text-[#6E7464]">Apport d’olives</td>
                          <td className="px-4 py-3 font-medium text-[#1E2418]">{a.clientName}</td>
                          <td className="px-4 py-3 text-right font-mono font-semibold">
                            {formatDh(a.totalAmount, currency)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[#3C5A24]">
                            {formatDh(a.paidAmount, currency)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-[#9C4221]">
                            {formatDh(a.remainingAmount, currency)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {a.remainingAmount > 0 ? (
                              <button
                                onClick={() => settleApportBalance(a.ticketNumber)}
                                className="rounded-md bg-[#526134] px-3 py-1 text-xs font-semibold text-white hover:bg-[#424F29] cursor-pointer"
                              >
                                Encaisser
                              </button>
                            ) : (
                              <span className="inline-block rounded-md bg-[#E3F0D8] px-2.5 py-1 text-xs font-semibold text-[#3C5A24]">
                                Enregistré
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {proClients.map((c) => {
                        const total = c.oliveTonnage * 1000 * c.pressPricePerKg;
                        const paid = c.paidAmountDh ?? total;
                        const rem = Math.max(0, total - paid);
                        return (
                          <tr key={c.id} className="hover:bg-[#FAF9F5]">
                            <td className="px-4 py-3 font-mono font-semibold text-[#1E2418]">
                              {c.id}
                            </td>
                            <td className="px-4 py-3 text-[#6E7464]">Client Pro</td>
                            <td className="px-4 py-3 font-medium text-[#1E2418]">{c.fullName}</td>
                            <td className="px-4 py-3 text-right font-mono font-semibold">
                              {formatDh(total, currency)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-[#3C5A24]">
                              {formatDh(paid, currency)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-[#9C4221]">
                              {formatDh(rem, currency)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {rem > 0 ? (
                                <button
                                  onClick={() => settleProBalance(c.id)}
                                  className="rounded-md bg-[#526134] px-3 py-1 text-xs font-semibold text-white hover:bg-[#424F29] cursor-pointer"
                                >
                                  Encaisser
                                </button>
                              ) : (
                                <span className="inline-block rounded-md bg-[#E3F0D8] px-2.5 py-1 text-xs font-semibold text-[#3C5A24]">
                                  Enregistré
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {resellers.map((r) => {
                        const paid = r.paidAmountDh ?? r.totalAmount;
                        const rem = Math.max(0, r.totalAmount - paid);
                        return (
                          <tr key={r.id} className="hover:bg-[#FAF9F5]">
                            <td className="px-4 py-3 font-mono font-semibold text-[#1E2418]">
                              {r.id}
                            </td>
                            <td className="px-4 py-3 text-[#6E7464]">Vente Huile</td>
                            <td className="px-4 py-3 font-medium text-[#1E2418]">
                              {r.nameOrCompany}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-semibold">
                              {formatDh(r.totalAmount, currency)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-[#3C5A24]">
                              {formatDh(paid, currency)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-[#9C4221]">
                              {formatDh(rem, currency)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {rem > 0 ? (
                                <button
                                  onClick={() => settleResellerBalance(r.id)}
                                  className="rounded-md bg-[#526134] px-3 py-1 text-xs font-semibold text-white hover:bg-[#424F29] cursor-pointer"
                                >
                                  Encaisser
                                </button>
                              ) : (
                                <span className="inline-block rounded-md bg-[#E3F0D8] px-2.5 py-1 text-xs font-semibold text-[#3C5A24]">
                                  Enregistré
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =================================================================
                VIEW 8: RAPPORTS
               ================================================================= */}
            {activeTab === 'rapports' && (
              <div className="rounded-2xl border border-[#E5E6DF] bg-white p-6 shadow-2xs space-y-6">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#1E2418]">
                    Rapports & Synthèse Générale d’Exploitation
                  </h2>
                  <p className="text-xs text-[#6E7464]">
                    Exportation des registres en format Excel (.CSV) et récapitulatif financier.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-[#E5E6DF] bg-[#F7F7F3] p-4">
                    <div className="text-xs text-[#6E7464]">Recettes Pressage (Apports + Pro)</div>
                    <div className="mt-1 font-mono text-xl font-bold text-[#1E2418]">
                      {formatDh(stats.totalPressRevenueDh, currency)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#E5E6DF] bg-[#F7F7F3] p-4">
                    <div className="text-xs text-[#6E7464]">
                      Ventes d’Huile en Gros ({formatNumber(stats.resellerOilLiters, 0)} L)
                    </div>
                    <div className="mt-1 font-mono text-xl font-bold text-[#526134]">
                      {formatDh(stats.resellerRevenueDh, currency)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#E5E6DF] bg-[#F7F7F3] p-4">
                    <div className="text-xs text-[#6E7464]">
                      Sous-Produits Grignon ({formatNumber(stats.totalPomaceKg, 0)} kg)
                    </div>
                    <div className="mt-1 font-mono text-xl font-bold text-[#6A5A28]">
                      {formatDh(stats.pomaceRevenueDh, currency)}
                    </div>
                  </div>
                </div>

                {/* Graphique linéaire Recharts : Recettes quotidiennes des 7 derniers jours */}
                <div className="rounded-2xl border border-[#E5E6DF] bg-[#FAFAF7] p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3ECD8] text-[#3B5224]">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-[#1E2418]">
                          Évolution des Recettes Quotidiennes (7 derniers jours)
                        </h3>
                        <p className="text-xs text-[#6E7464]">
                          Période du {last7DaysRevenue[0]?.label} au{' '}
                          {last7DaysRevenue[last7DaysRevenue.length - 1]?.label} ({currency})
                        </p>
                      </div>
                    </div>

                    <div className="inline-flex rounded-xl border border-[#DCDFD5] bg-white p-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setChartMetricMode('pressage')}
                        className={`rounded-lg px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                          chartMetricMode === 'pressage'
                            ? 'bg-[#526134] text-white'
                            : 'text-[#5A6250] hover:bg-[#F2F3EE]'
                        }`}
                      >
                        Recettes Pressage
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartMetricMode('all')}
                        className={`rounded-lg px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                          chartMetricMode === 'all'
                            ? 'bg-[#526134] text-white'
                            : 'text-[#5A6250] hover:bg-[#F2F3EE]'
                        }`}
                      >
                        Toutes les Recettes (Pressage + Ventes)
                      </button>
                    </div>
                  </div>

                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={last7DaysRevenue}
                        margin={{ top: 12, right: 24, left: 10, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E6DF" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: '#5A6250', fontSize: 12 }}
                          axisLine={{ stroke: '#DCDFD5' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: '#5A6250', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(val: number) => `${formatNumber(val, 0)} ${currency}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            borderColor: '#DCDFD5',
                            borderRadius: '12px',
                            boxShadow: '0 8px 20px rgba(30,36,24,0.08)',
                            fontSize: '12px',
                          }}
                          formatter={(value: any, name: any) => [
                            formatDh(Number(value) || 0, currency),
                            String(name),
                          ]}
                          labelStyle={{ fontWeight: 700, color: '#1E2418', marginBottom: '4px' }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                          iconType="circle"
                        />
                        <Line
                          type="monotone"
                          dataKey="recettesPressage"
                          name={`Recettes Pressage (${currency})`}
                          stroke="#526134"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#526134', strokeWidth: 2, stroke: '#FFFFFF' }}
                          activeDot={{ r: 6, fill: '#2E3B1F' }}
                        />
                        {chartMetricMode === 'all' && (
                          <>
                            <Line
                              type="monotone"
                              dataKey="ventesHuileGrignon"
                              name={`Ventes Huile & Grignon (${currency})`}
                              stroke="#C89D3C"
                              strokeWidth={2.5}
                              dot={{ r: 4, fill: '#C89D3C', strokeWidth: 2, stroke: '#FFFFFF' }}
                              activeDot={{ r: 6, fill: '#9A7420' }}
                            />
                            <Line
                              type="monotone"
                              dataKey="recettesTotales"
                              name={`Recettes Totales (${currency})`}
                              stroke="#2E3B1F"
                              strokeWidth={2.5}
                              strokeDasharray="5 5"
                              dot={{ r: 4, fill: '#2E3B1F', strokeWidth: 2, stroke: '#FFFFFF' }}
                            />
                          </>
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Mini synthèse quotidienne sur 7 jours */}
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#E6E7E0] pt-4 sm:grid-cols-7">
                    {last7DaysRevenue.map((day) => (
                      <div
                        key={day.dateIso}
                        className="rounded-xl border border-[#E6E7E0] bg-white px-3 py-2 text-center"
                      >
                        <div className="text-[11px] font-medium text-[#6E7464]">{day.label}</div>
                        <div className="mt-0.5 font-mono text-xs font-bold text-[#3B5224]">
                          {formatDh(
                            chartMetricMode === 'pressage'
                              ? day.recettesPressage
                              : day.recettesTotales,
                            currency
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E6E7E0] pt-5">
                  <button
                    onClick={() =>
                      exportAllDataCsv(
                        proClients,
                        resellers,
                        passengers,
                        pomaceLots,
                        appointments,
                        currency
                      )
                    }
                    className="flex items-center gap-2 rounded-xl bg-[#526134] px-5 py-3 text-xs font-semibold text-white hover:bg-[#424F29] cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    Exporter le Rapport Complet (.CSV)
                  </button>
                </div>
              </div>
            )}

            {/* =================================================================
                VIEW 9: PARAMÈTRES
               ================================================================= */}
            {activeTab === 'parametres' && (
              <div className="rounded-2xl border border-[#E5E6DF] bg-white p-6 shadow-2xs space-y-6">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#1E2418]">
                    Paramètres de l’Application & Configuration du Moulin
                  </h2>
                  <p className="text-xs text-[#6E7464]">
                    Personnalisez le nom de l’huilerie, l’administrateur, la devise (DT / DH) et le tarif de pressage par défaut.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-2xl">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                      Nom affiché du moulin
                    </label>
                    <input
                      type="text"
                      value={settings.millTitle}
                      onChange={(e) => setSettings({ ...settings, millTitle: e.target.value })}
                      className="w-full rounded-lg border border-[#DCDFD5] px-3.5 py-2 text-sm text-[#1E2418]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                      Nom de l’administrateur
                    </label>
                    <input
                      type="text"
                      value={settings.adminName}
                      onChange={(e) => setSettings({ ...settings, adminName: e.target.value })}
                      className="w-full rounded-lg border border-[#DCDFD5] px-3.5 py-2 text-sm text-[#1E2418]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                      Devise utilisée
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) =>
                        setSettings({ ...settings, currency: e.target.value as CurrencyCode })
                      }
                      className="w-full rounded-lg border border-[#DCDFD5] bg-white px-3.5 py-2 text-sm text-[#1E2418]"
                    >
                      <option value="DT">DT (Dinar — affichage par défaut)</option>
                      <option value="DH">DH (Dirham Marocain)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                      Tarif de pressage par défaut ({currency} / kg)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={settings.defaultRatePerKg}
                      onChange={(e) => {
                        setSettings({ ...settings, defaultRatePerKg: e.target.value });
                        setApportRatePerKg(e.target.value);
                      }}
                      className="w-full rounded-lg border border-[#DCDFD5] px-3.5 py-2 font-mono text-sm text-[#1E2418]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                      Nom d’utilisateur de connexion
                    </label>
                    <input
                      type="text"
                      value={settings.username || 'karim'}
                      onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                      className="w-full rounded-lg border border-[#DCDFD5] px-3.5 py-2 font-mono text-sm text-[#1E2418]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                      Mot de passe d’accès
                    </label>
                    <input
                      type="text"
                      value={settings.password || '1234'}
                      onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                      className="w-full rounded-lg border border-[#DCDFD5] px-3.5 py-2 font-mono text-sm text-[#1E2418]"
                    />
                  </div>
                </div>

                <div className="border-t border-[#E6E7E0] pt-5 flex items-center justify-between">
                  {!confirmResetOpen ? (
                    <button
                      onClick={() => setConfirmResetOpen(true)}
                      className="flex items-center gap-1.5 rounded-xl border border-[#DCDFD5] px-4 py-2.5 text-xs font-medium text-[#5A6250] hover:bg-[#F2F3EE] cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restaurer les données d’exemple initiales (1 250 kg / 8 pressages / 420 DT)
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#1E2418]">
                        Confirmer la réinitialisation ?
                      </span>
                      <button
                        onClick={handleResetDemoData}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#2E3B1F] px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Oui, réinitialiser
                      </button>
                      <button
                        onClick={() => setConfirmResetOpen(false)}
                        className="rounded-lg border border-[#DCDFD5] px-3 py-1.5 text-xs text-[#5A6250] cursor-pointer"
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* =====================================================================
          MODALS (Pro, Reseller, Pomace, Appointment)
         ===================================================================== */}
      {isProModalOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg rounded-2xl border border-[#E2E4DC] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E6E7E0] pb-4">
              <h2 className="font-display text-base font-bold text-[#1E2418]">
                Nouveau Client Professionnel
              </h2>
              <button
                onClick={() => setIsProModalOpen(false)}
                className="rounded-lg p-1.5 text-[#8C9282] hover:bg-[#F2F3EE] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddProClient} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                    Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={proForm.fullName}
                    onChange={(e) => setProForm({ ...proForm, fullName: e.target.value })}
                    className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                    Téléphone *
                  </label>
                  <input
                    type="text"
                    required
                    value={proForm.phone}
                    onChange={(e) => setProForm({ ...proForm, phone: e.target.value })}
                    className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                  Matricule(s) des camions *
                </label>
                <input
                  type="text"
                  required
                  value={proForm.truckPlates}
                  onChange={(e) => setProForm({ ...proForm, truckPlates: e.target.value })}
                  className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 font-mono text-xs"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                    Tonnage (t) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="0.1"
                    value={proForm.oliveTonnage}
                    onChange={(e) => setProForm({ ...proForm, oliveTonnage: e.target.value })}
                    className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                    Prix/kg ({currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.05"
                    value={proForm.pressPricePerKg}
                    onChange={(e) => setProForm({ ...proForm, pressPricePerKg: e.target.value })}
                    className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3A4034]">Date *</label>
                  <input
                    type="date"
                    required
                    value={proForm.date}
                    onChange={(e) => setProForm({ ...proForm, date: e.target.value })}
                    className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                  Observations
                </label>
                <textarea
                  rows={2}
                  value={proForm.observations}
                  onChange={(e) => setProForm({ ...proForm, observations: e.target.value })}
                  className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-[#E6E7E0] pt-4">
                <button
                  type="button"
                  onClick={() => setIsProModalOpen(false)}
                  className="rounded-lg border border-[#DCDFD5] px-4 py-2 text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#526134] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isResellerModalOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg rounded-2xl border border-[#E2E4DC] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E6E7E0] pb-4">
              <h2 className="font-display text-base font-bold text-[#1E2418]">
                Nouvelle Vente Revendeur
              </h2>
              <button
                onClick={() => setIsResellerModalOpen(false)}
                className="rounded-lg p-1.5 text-[#8C9282] hover:bg-[#F2F3EE] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddReseller} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                    Nom / Société *
                  </label>
                  <input
                    type="text"
                    required
                    value={resellerForm.nameOrCompany}
                    onChange={(e) =>
                      setResellerForm({ ...resellerForm, nameOrCompany: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                    Téléphone *
                  </label>
                  <input
                    type="text"
                    required
                    value={resellerForm.phone}
                    onChange={(e) => setResellerForm({ ...resellerForm, phone: e.target.value })}
                    className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                    Quantité (L) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={resellerForm.oilQuantityLiters}
                    onChange={(e) =>
                      setResellerForm({ ...resellerForm, oilQuantityLiters: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                    Prix/L ({currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.5"
                    value={resellerForm.pricePerLiter}
                    onChange={(e) =>
                      setResellerForm({ ...resellerForm, pricePerLiter: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3A4034]">Date *</label>
                  <input
                    type="date"
                    required
                    value={resellerForm.date}
                    onChange={(e) => setResellerForm({ ...resellerForm, date: e.target.value })}
                    className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#EAE6D7] bg-[#F6F4EC] px-4 py-3">
                <span className="text-xs font-medium text-[#5A5648]">
                  Montant Total (Quantité × Prix) :
                </span>
                <span className="font-mono text-base font-bold text-[#6A5A28]">
                  {formatDh(resellerCalculatedTotal, currency)}
                </span>
              </div>
              <div className="flex justify-end gap-2 border-t border-[#E6E7E0] pt-4">
                <button
                  type="button"
                  onClick={() => setIsResellerModalOpen(false)}
                  className="rounded-lg border border-[#DCDFD5] px-4 py-2 text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#526134] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPomaceModalOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg rounded-2xl border border-[#E2E4DC] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E6E7E0] pb-4">
              <h2 className="font-display text-base font-bold text-[#1E2418]">
                Nouveau Lot de Grignon
              </h2>
              <button
                onClick={() => setIsPomaceModalOpen(false)}
                className="rounded-lg p-1.5 text-[#8C9282] hover:bg-[#F2F3EE] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddPomace} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#3A4034]">Client *</label>
                <input
                  type="text"
                  required
                  value={pomaceForm.clientName}
                  onChange={(e) => setPomaceForm({ ...pomaceForm, clientName: e.target.value })}
                  className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 text-xs"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                    Poids Grignon (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={pomaceForm.pomaceWeightKg}
                    onChange={(e) =>
                      setPomaceForm({ ...pomaceForm, pomaceWeightKg: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                    Destination
                  </label>
                  <select
                    value={pomaceForm.destination}
                    onChange={(e) =>
                      setPomaceForm({
                        ...pomaceForm,
                        destination: e.target.value as PomaceDestination,
                      })
                    }
                    className="w-full rounded-lg border border-[#DCDFD5] bg-white px-3 py-2 text-xs"
                  >
                    <option value="Vendu">Vendu</option>
                    <option value="Récupéré par le client">Récupéré par le client</option>
                  </select>
                </div>
              </div>
              {pomaceForm.destination === 'Vendu' && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                    Prix de vente ({currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={pomaceForm.salePriceDh}
                    onChange={(e) => setPomaceForm({ ...pomaceForm, salePriceDh: e.target.value })}
                    className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 font-mono text-xs"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 border-t border-[#E6E7E0] pt-4">
                <button
                  type="button"
                  onClick={() => setIsPomaceModalOpen(false)}
                  className="rounded-lg border border-[#DCDFD5] px-4 py-2 text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#526134] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAppointmentModalOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg rounded-2xl border border-[#E2E4DC] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E6E7E0] pb-4">
              <h2 className="font-display text-base font-bold text-[#1E2418]">
                Planifier un Rendez-vous
              </h2>
              <button
                onClick={() => setIsAppointmentModalOpen(false)}
                className="rounded-lg p-1.5 text-[#8C9282] hover:bg-[#F2F3EE] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddAppointment} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3A4034]">Client *</label>
                  <input
                    type="text"
                    required
                    value={appointmentForm.clientName}
                    onChange={(e) =>
                      setAppointmentForm({ ...appointmentForm, clientName: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                    Téléphone *
                  </label>
                  <input
                    type="text"
                    required
                    value={appointmentForm.phone}
                    onChange={(e) =>
                      setAppointmentForm({ ...appointmentForm, phone: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3A4034]">Date *</label>
                  <input
                    type="date"
                    required
                    value={appointmentForm.date}
                    onChange={(e) =>
                      setAppointmentForm({ ...appointmentForm, date: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3A4034]">Créneau *</label>
                  <select
                    value={appointmentForm.timeSlot}
                    onChange={(e) =>
                      setAppointmentForm({ ...appointmentForm, timeSlot: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#DCDFD5] bg-white px-2.5 py-2 font-mono text-xs"
                  >
                    {APPOINTMENT_TIME_SLOTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3A4034]">
                    Quantité *
                  </label>
                  <input
                    type="text"
                    required
                    value={appointmentForm.estimatedQuantity}
                    onChange={(e) =>
                      setAppointmentForm({
                        ...appointmentForm,
                        estimatedQuantity: e.target.value,
                      })
                    }
                    placeholder="Ex: 15 t / 500 kg"
                    className="w-full rounded-lg border border-[#DCDFD5] px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-[#E6E7E0] pt-4">
                <button
                  type="button"
                  onClick={() => setIsAppointmentModalOpen(false)}
                  className="rounded-lg border border-[#DCDFD5] px-4 py-2 text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#526134] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  Confirmer le Rendez-vous
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal
        receipt={activeReceipt}
        currency={currency}
        millName={`${settings.millTitle} — Maâsra Al Baraka`}
        onClose={() => setActiveReceipt(null)}
      />

      {/* Offline Banner */}
      <OfflineIndicator />
    </div>
  );
}
