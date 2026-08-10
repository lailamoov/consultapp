import { pdf } from '@react-pdf/renderer';
import { createElement } from 'react';
import { PatientPlanPdf } from './PatientPlanPdf';
import type { LineItem } from '../engine/consultationSelectors';
import type { GeneratedSession } from '../engine/scheduler';
import type { Service } from '../types';

export async function downloadPatientPlanPdf(args: {
  patientName: string;
  consultationDate: string;
  providerName: string;
  lineItems: LineItem[];
  grandTotal: number;
  todaysCost: number;
  schedule: GeneratedSession[];
  servicesById: Record<string, Service>;
}) {
  const doc = createElement(PatientPlanPdf, args);
  const blob = await pdf(doc as Parameters<typeof pdf>[0]).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (args.patientName || 'patient').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  a.download = `moov-health-treatment-plan-${safeName}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
