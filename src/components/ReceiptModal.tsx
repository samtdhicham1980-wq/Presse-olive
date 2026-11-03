import React from 'react';
import { Printer, X } from 'lucide-react';
import { ReceiptPayload, CurrencyCode } from '../types';
import { formatDh, formatDateFr } from '../utils/formatters';

interface ReceiptModalProps {
  receipt: ReceiptPayload | null;
  currency?: CurrencyCode;
  millName?: string;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  currency = 'DT',
  millName = 'Ma Presse — Maâsra Al Baraka',
  onClose,
}) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-xl rounded-2xl border border-[#E2E4DC] bg-white p-6 shadow-2xl sm:p-8">
        {/* Top Modal Controls (hidden when printing) */}
        <div className="no-print mb-6 flex items-center justify-between border-b border-[#E6E8E0] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#253019]">Aperçu du Ticket / Reçu Officiel</h3>
            <p className="text-xs text-[#6E7464]">Format prêt pour impression thermique ou A4/A5</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg bg-[#526134] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#414E28] whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimer le reçu
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-[#E2E4DC] p-2 text-[#6E7464] transition-colors hover:bg-[#F5F6F1] hover:text-[#253019] cursor-pointer"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="space-y-5 text-[#22261E]">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-[#D8DCD0] pb-5 sm:flex-row sm:items-start">
            <div>
              <div className="text-lg font-bold tracking-tight text-[#2E3B1F] uppercase">
                {millName}
              </div>
              <div className="mt-0.5 text-xs text-[#5A6250]">
                Gestion de votre moulin à huile d’olive
              </div>
              <div className="mt-1 text-xs text-[#6E7464]">
                Unité Moderne de Trituration & Conditionnement d’Huile d’Olive
              </div>
            </div>
            <div className="sm:text-right">
              <div className="text-xs font-semibold text-[#6E7464]">{receipt.subtitle}</div>
              <div className="mt-0.5 font-mono text-base font-bold text-[#253019] tabular-nums">
                {receipt.reference}
              </div>
              <div className="mt-1 text-xs text-[#5A6250]">
                Date : <span className="font-mono tabular-nums">{formatDateFr(receipt.date)}</span>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="grid grid-cols-1 gap-3 rounded-xl bg-[#F7F6F0] p-4 border border-[#E6E4D8] sm:grid-cols-2">
            <div>
              <div className="text-xs text-[#6E7464]">Client / Raison Sociale</div>
              <div className="mt-0.5 text-sm font-bold text-[#253019]">{receipt.clientName}</div>
              {receipt.phone && (
                <div className="mt-0.5 font-mono text-xs text-[#5A6250] tabular-nums">
                  Tél : {receipt.phone}
                </div>
              )}
            </div>
            {receipt.metaInfo && (
              <div className="sm:text-right">
                <div className="text-xs text-[#6E7464]">Détails Opération</div>
                <div className="mt-0.5 font-mono text-xs font-medium text-[#2E3B1F]">
                  {receipt.metaInfo}
                </div>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="overflow-hidden rounded-xl border border-[#E2E4DC]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E2E4DC] bg-[#F2F3EE] text-[#5A6250]">
                <tr>
                  <th className="px-3.5 py-2.5 font-semibold">Désignation</th>
                  <th className="px-3.5 py-2.5 text-right font-semibold">Quantité</th>
                  <th className="px-3.5 py-2.5 text-right font-semibold">Tarif</th>
                  <th className="px-3.5 py-2.5 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAE2]">
                {receipt.lines.map((line, index) => (
                  <tr key={index}>
                    <td className="px-3.5 py-3 font-medium text-[#22261E]">{line.label}</td>
                    <td className="px-3.5 py-3 text-right font-mono text-[#454C3E] tabular-nums">
                      {line.quantity}
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono text-[#454C3E] tabular-nums">
                      {line.unitPrice}
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono font-bold text-[#253019] tabular-nums">
                      {line.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total, Paid & Remaining */}
          <div className="flex flex-col justify-between gap-4 rounded-xl bg-[#F6F4EC] border border-[#E8E4D4] p-4 sm:flex-row sm:items-center">
            <div className="max-w-xs text-xs text-[#5A6250]">
              {receipt.notes ? (
                <>
                  <span className="font-semibold text-[#253019]">Note : </span>
                  {receipt.notes}
                </>
              ) : (
                <span>Une huile d’exception par un savoir-faire local.</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-5 sm:justify-end">
              <div>
                <div className="text-xs text-[#6E7464]">Total :</div>
                <div className="font-mono text-base font-bold text-[#6B5B27] tabular-nums">
                  {formatDh(receipt.totalDh, currency)}
                </div>
              </div>
              {typeof receipt.paidDh === 'number' && (
                <div className="border-l border-[#DEDAC8] pl-4">
                  <div className="text-xs text-[#6E7464]">Payé :</div>
                  <div className="font-mono text-sm font-semibold text-[#2E3B1F] tabular-nums">
                    {formatDh(receipt.paidDh, currency)}
                  </div>
                </div>
              )}
              {typeof receipt.remainingDh === 'number' && (
                <div className="border-l border-[#DEDAC8] pl-4">
                  <div className="text-xs text-[#6E7464]">Reste :</div>
                  <div className="font-mono text-sm font-bold text-[#9C4221] tabular-nums">
                    {formatDh(receipt.remainingDh, currency)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 text-xs text-[#6E7464]">
            <div className="border-t border-dashed border-[#CFD4C8] pt-2">
              Cachet & Signature du Moulin
            </div>
            <div className="border-t border-dashed border-[#CFD4C8] pt-2 text-right">
              Signature du Client
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
