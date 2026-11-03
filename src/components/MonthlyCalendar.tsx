import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Appointment } from '../types';
import { formatDateFr } from '../utils/formatters';

interface MonthlyCalendarProps {
  appointments: Appointment[];
  currentMonthDate: Date;
  selectedDate: string | null; // YYYY-MM-DD or null for all
  onChangeMonth: (newDate: Date) => void;
  onSelectDate: (isoDate: string | null) => void;
  onQuickAddForDate: (isoDate: string) => void;
}

const FRENCH_MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

const FRENCH_DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  appointments,
  currentMonthDate,
  selectedDate,
  onChangeMonth,
  onSelectDate,
  onQuickAddForDate,
}) => {
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  // Group appointments by YYYY-MM-DD
  const appointmentsByDate = useMemo(() => {
    const map: Record<
      string,
      {
        all: Appointment[];
        confirmedCount: number;
        inProgressCount: number;
        pendingCount: number;
      }
    > = {};

    appointments.forEach((rdv) => {
      if (!map[rdv.date]) {
        map[rdv.date] = {
          all: [],
          confirmedCount: 0,
          inProgressCount: 0,
          pendingCount: 0,
        };
      }
      map[rdv.date].all.push(rdv);
      if (rdv.status === 'Confirmé') {
        map[rdv.date].confirmedCount += 1;
      } else if (rdv.status === 'En cours au moulin') {
        map[rdv.date].inProgressCount += 1;
      } else if (rdv.status === 'En attente') {
        map[rdv.date].pendingCount += 1;
      }
    });

    return map;
  }, [appointments]);

  // Build calendar cells (Monday-first week)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Convert JS Sunday=0..Saturday=6 to Monday=0..Sunday=6
    const startWeekday = (firstDayOfMonth.getDay() + 6) % 7;

    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: Array<{
      isoDate: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    // Leading days from previous month
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, d);
      const iso = formatIso(prevDate);
      cells.push({
        isoDate: iso,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: iso === '2026-11-03',
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(year, month, d);
      const iso = formatIso(curDate);
      cells.push({
        isoDate: iso,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: iso === '2026-11-03',
      });
    }

    // Trailing days to complete 35 or 42 grid cells
    const totalCells = cells.length <= 35 ? 35 : 42;
    const remaining = totalCells - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const iso = formatIso(nextDate);
      cells.push({
        isoDate: iso,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: iso === '2026-11-03',
      });
    }

    return cells;
  }, [year, month]);

  const handlePrevMonth = () => {
    onChangeMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onChangeMonth(new Date(year, month + 1, 1));
  };

  const handleGoToToday = () => {
    onChangeMonth(new Date(2026, 10, 1)); // Novembre 2026
    onSelectDate(null);
  };

  // Monthly summary statistics
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthlyConfirmedTotal = useMemo(() => {
    return appointments.filter(
      (a) => a.date.startsWith(monthPrefix) && a.status === 'Confirmé'
    ).length;
  }, [appointments, monthPrefix]);

  const monthlyTotal = useMemo(() => {
    return appointments.filter((a) => a.date.startsWith(monthPrefix)).length;
  }, [appointments, monthPrefix]);

  return (
    <div className="rounded-2xl border border-[#E5E6DF] bg-white p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Calendar Header Bar */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#EFEFE9] pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F1F6EC] text-[#3B5224] border border-[#DFEAD6]">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-lg font-bold text-[#1E2418]">
                Calendrier Mensuel — {FRENCH_MONTHS[month]} {year}
              </h2>
              <span className="rounded-md bg-[#E3F0D8] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#3C5A24] tabular-nums">
                {monthlyConfirmedTotal} RDV confirmé{monthlyConfirmedTotal > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-[#6E7464]">
              Cliquez sur un jour pour filtrer les créneaux ({monthlyTotal} rendez-vous sur le mois)
              {selectedDate && (
                <>
                  {' '}
                  · Filtre actif :{' '}
                  <strong className="font-mono text-[#2E3B1F]">
                    {formatDateFr(selectedDate)}
                  </strong>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedDate && (
            <button
              type="button"
              onClick={() => onSelectDate(null)}
              className="rounded-lg border border-[#DCDFD5] bg-[#F7F7F3] px-3 py-1.5 text-xs font-medium text-[#3A4034] hover:bg-[#EFEFE8] cursor-pointer"
            >
              Afficher tout le mois
            </button>
          )}
          <button
            type="button"
            onClick={handleGoToToday}
            className="rounded-lg border border-[#DCDFD5] bg-white px-3 py-1.5 text-xs font-medium text-[#3A4034] hover:bg-[#F2F3EE] cursor-pointer"
          >
            Novembre 2026
          </button>
          <div className="flex items-center overflow-hidden rounded-lg border border-[#DCDFD5] bg-white">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 text-[#4A5043] hover:bg-[#F2F3EE] cursor-pointer"
              aria-label="Mois précédent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="border-x border-[#E6E7E0] px-3 py-1 text-xs font-semibold text-[#1E2418] min-w-[115px] text-center">
              {FRENCH_MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 text-[#4A5043] hover:bg-[#F2F3EE] cursor-pointer"
              aria-label="Mois suivant"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 7-Column CSS Grid Calendar */}
      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {FRENCH_DAYS_SHORT.map((dayName) => (
              <div
                key={dayName}
                className="rounded-lg bg-[#F2F3EE] py-2 text-center text-xs font-semibold text-[#4A5043]"
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((cell) => {
              const dayData = appointmentsByDate[cell.isoDate];
              const confirmedCount = dayData?.confirmedCount ?? 0;
              const inProgressCount = dayData?.inProgressCount ?? 0;
              const pendingCount = dayData?.pendingCount ?? 0;
              const totalDayCount = dayData?.all.length ?? 0;
              const isSelected = selectedDate === cell.isoDate;

              return (
                <div
                  key={cell.isoDate}
                  onClick={() =>
                    onSelectDate(isSelected ? null : cell.isoDate)
                  }
                  className={`group relative flex min-h-[108px] flex-col justify-between rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                    !cell.isCurrentMonth
                      ? 'border-[#EFEFE9] bg-[#FAF9F6] opacity-55 hover:opacity-90'
                      : isSelected
                      ? 'border-[#526134] bg-[#F1F6EC] ring-2 ring-[#526134]/25'
                      : cell.isToday
                      ? 'border-[#B4C284] bg-[#FCF8EB]/60 hover:border-[#526134]'
                      : totalDayCount > 0
                      ? 'border-[#DCE4D0] bg-white hover:border-[#526134]'
                      : 'border-[#E6E7E0] bg-white hover:border-[#C5CCB8] hover:bg-[#FAF9F5]'
                  }`}
                >
                  {/* Top Row: Day Number + Quick Add Button on Hover */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-bold tabular-nums ${
                        cell.isToday
                          ? 'bg-[#526134] text-white'
                          : isSelected
                          ? 'bg-[#2E3B1F] text-white'
                          : 'text-[#22261E]'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAddForDate(cell.isoDate);
                      }}
                      title={`Ajouter un RDV le ${formatDateFr(cell.isoDate)}`}
                      className="opacity-0 group-hover:opacity-100 flex h-5 w-5 items-center justify-center rounded-md bg-[#526134]/15 text-[#3B5224] hover:bg-[#526134] hover:text-white transition-opacity cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Middle/Bottom: Confirmed Appointments Counter & Preview */}
                  {totalDayCount > 0 ? (
                    <div className="mt-1.5 space-y-1">
                      {/* Confirmed count indicator */}
                      {confirmedCount > 0 && (
                        <div className="flex items-center justify-between rounded-md bg-[#E3F0D8] px-2 py-0.5 text-[11px] font-semibold text-[#2E4B19]">
                          <span>
                            {confirmedCount} confirmé{confirmedCount > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}

                      {/* Other statuses (En cours / En attente) */}
                      {(inProgressCount > 0 || pendingCount > 0) && (
                        <div className="flex items-center justify-between rounded-md bg-[#F6F4EC] border border-[#E8E2CE] px-2 py-0.5 text-[10px] font-medium text-[#6A5A28]">
                          <span>
                            {inProgressCount > 0
                              ? `${inProgressCount} en cours`
                              : `${pendingCount} en attente`}
                          </span>
                        </div>
                      )}

                      {/* First client preview */}
                      <div className="truncate pt-0.5 text-[10px] font-medium text-[#4A5043]">
                        {dayData.all[0].timeSlot.split(' ')[0]} · {dayData.all[0].clientName}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-auto text-[10px] text-[#9CA392] group-hover:text-[#6E7464]">
                      Aucun RDV
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EFEFE9] pt-3 text-xs text-[#6E7464]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-[#E3F0D8] border border-[#B8D4A0]" />
            <span>Rendez-vous confirmés</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-[#F6F4EC] border border-[#E0D8BE]" />
            <span>En cours / En attente</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#526134]" />
            <span>Aujourd’hui (03/11/2026)</span>
          </span>
        </div>
        <div>
          Astuce : Survolez une case et cliquez sur <strong>+</strong> pour planifier un créneau à cette date.
        </div>
      </div>
    </div>
  );
};

function formatIso(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
