import { Document, Page, View, Text, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { LineItem } from '../engine/consultationSelectors';
import type { GeneratedSession } from '../engine/scheduler';
import type { Service } from '../types';
import { formatMoney } from '../utils/format';
import { estimateFinancing } from '../engine/financing';
import { careCreditConfig } from '../data/careCreditConfig';
import { disclaimers } from '../data/disclaimers';
import { calendarColorCycle } from '../data/theme';

Font.register({ family: 'Case', fonts: [{ src: '/brand/fonts/Case-Regular.otf', fontWeight: 400 }, { src: '/brand/fonts/Case-Medium.otf', fontWeight: 500 }, { src: '/brand/fonts/Case-Bold.otf', fontWeight: 700 }] });

const NAVY = '#102C49';
const INK = '#000D1A';
const SLATE = '#5B6B7A';
const FOG = '#D0D8E0';
const MIST = '#F5FAFF';
const PALE = '#E0EFFF';

const styles = StyleSheet.create({
  page: { fontFamily: 'Case', fontSize: 10, color: INK, padding: 36, paddingBottom: 56 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottomWidth: 2, borderBottomColor: NAVY, paddingBottom: 14 },
  logo: { width: 110, height: 26 },
  headerMeta: { textAlign: 'right' },
  h1: { fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 2 },
  metaLine: { fontSize: 9, color: SLATE },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: NAVY, marginTop: 18, marginBottom: 8 },
  card: { borderWidth: 1, borderColor: FOG, borderRadius: 8, padding: 12, marginBottom: 8 },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  serviceName: { fontSize: 11.5, fontWeight: 700, color: INK },
  serviceMeta: { fontSize: 8.5, color: SLATE, marginTop: 1 },
  price: { fontSize: 12, fontWeight: 700, color: NAVY },
  benefitLabel: { fontSize: 8, fontWeight: 700, color: SLATE, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  benefitText: { fontSize: 9.5, color: INK, lineHeight: 1.4, marginTop: 2 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingTop: 8 },
  totalsLabel: { fontSize: 10, color: SLATE },
  totalsValue: { fontSize: 15, fontWeight: 700, color: NAVY },
  financeRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  financeCard: { flex: 1, borderWidth: 1, borderColor: FOG, borderRadius: 8, padding: 10, backgroundColor: MIST, alignItems: 'center' },
  financeMonths: { fontSize: 8.5, color: SLATE },
  financePrice: { fontSize: 13, fontWeight: 700, color: NAVY, marginTop: 2 },
  disclaimer: { fontSize: 7.5, color: SLATE, lineHeight: 1.4, marginTop: 4 },
  timelineRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: FOG, paddingVertical: 5, alignItems: 'center' },
  timelineDate: { width: 90, fontSize: 9, color: INK },
  timelineDot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 6 },
  timelineService: { flex: 1, fontSize: 9, color: INK },
  timelineSession: { fontSize: 8, color: SLATE },
  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, fontSize: 7.5, color: SLATE, textAlign: 'center', borderTopWidth: 1, borderTopColor: FOG, paddingTop: 8 },
  monthHeader: { fontSize: 9.5, fontWeight: 700, color: NAVY, marginTop: 10, marginBottom: 3 },
});

export function PatientPlanPdf({
  patientName,
  consultationDate,
  providerName,
  lineItems,
  grandTotal,
  todaysCost,
  schedule,
  servicesById,
}: {
  patientName: string;
  consultationDate: string;
  providerName: string;
  lineItems: LineItem[];
  grandTotal: number;
  todaysCost: number;
  schedule: GeneratedSession[];
  servicesById: Record<string, Service>;
}) {
  const financing = estimateFinancing(grandTotal, careCreditConfig);
  const serviceIds = lineItems.map((li) => li.service.id);
  const colorFor: Record<string, string> = {};
  serviceIds.forEach((id, i) => (colorFor[id] = calendarColorCycle[i % calendarColorCycle.length]));

  const sortedSchedule = [...schedule].sort((a, b) => a.date.localeCompare(b.date));
  const monthsGrouped: Record<string, GeneratedSession[]> = {};
  for (const s of sortedSchedule) {
    const key = s.date.slice(0, 7);
    (monthsGrouped[key] ??= []).push(s);
  }

  return (
    <Document title={`MOOV Health Treatment Plan — ${patientName || 'Patient'}`}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerRow} fixed>
          <Image src="/brand/logos/MOOV.Horizontal.Logo.Blue.png" style={styles.logo} />
          <View style={styles.headerMeta}>
            <Text style={styles.h1}>Personalized Treatment Plan</Text>
            <Text style={styles.metaLine}>
              Patient: {patientName || '—'}  |  Provider: {providerName || '—'}  |  Date: {consultationDate}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your Recommended Treatments</Text>
        {lineItems.map(({ service, selection, pricing }) => (
          <View key={service.id} style={styles.card} wrap={false}>
            <View style={styles.serviceRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceMeta}>
                  {selection.quantity} session{selection.quantity === 1 ? '' : 's'} · {service.protocol.frequencyLabel}
                  {pricing.matchedPackageLabel ? ` · ${pricing.matchedPackageLabel}` : ''}
                </Text>
              </View>
              <Text style={styles.price}>{pricing.needsConfirmation ? 'Price to be confirmed' : formatMoney(pricing.subtotal)}</Text>
            </View>
            <Text style={styles.benefitLabel}>Why we're recommending it</Text>
            <Text style={styles.benefitText}>{service.standardBenefit}</Text>
            {selection.personalizedRecommendation && (
              <>
                <Text style={styles.benefitLabel}>For your plan</Text>
                <Text style={styles.benefitText}>{selection.personalizedRecommendation}</Text>
              </>
            )}
          </View>
        ))}

        <View style={{ borderTopWidth: 1, borderTopColor: FOG, marginTop: 6 }}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total Treatment Plan Value</Text>
            <Text style={styles.totalsValue}>{formatMoney(grandTotal)}</Text>
          </View>
          {Math.round(todaysCost) !== Math.round(grandTotal) && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Estimated Initial Visit / Today's Cost</Text>
              <Text style={[styles.totalsValue, { fontSize: 12 }]}>{formatMoney(todaysCost)}</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>CareCredit Financing Estimate</Text>
        <View style={styles.financeRow}>
          {financing.map((f) => (
            <View key={f.tier.months} style={styles.financeCard}>
              <Text style={styles.financeMonths}>{f.tier.months} months</Text>
              <Text style={styles.financePrice}>{f.eligible ? `${formatMoney(f.monthlyPayment)}/mo` : 'N/A'}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.disclaimer}>{careCreditConfig.paymentOnlyDisclaimer}</Text>
        <Text style={styles.disclaimer}>{careCreditConfig.disclosure}</Text>

        <Text style={styles.sectionTitle}>Your 12-Month Treatment Timeline</Text>
        {Object.entries(monthsGrouped).map(([monthKey, sessions]) => (
          <View key={monthKey} wrap={false}>
            <Text style={styles.monthHeader}>
              {new Date(`${monthKey}-01T00:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            {sessions.map((s) => {
              const service = servicesById[s.serviceId];
              return (
                <View key={s.id} style={styles.timelineRow}>
                  <Text style={styles.timelineDate}>{new Date(`${s.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                  <View style={[styles.timelineDot, { backgroundColor: colorFor[s.serviceId] }]} />
                  <Text style={styles.timelineService}>{service?.name}</Text>
                  <Text style={styles.timelineSession}>Session {s.sessionNumber} of {lineItems.find((li) => li.service.id === s.serviceId)?.selection.quantity}</Text>
                </View>
              );
            })}
          </View>
        ))}

        <View style={{ marginTop: 16, padding: 10, backgroundColor: PALE, borderRadius: 8 }}>
          <Text style={styles.disclaimer}>{disclaimers.timingEngine}</Text>
          <Text style={[styles.disclaimer, { marginTop: 4 }]}>{disclaimers.general}</Text>
        </View>

        <Text style={styles.footer} fixed>
          MOOV Health · This is a personalized estimate prepared for {patientName || 'the patient'} on {consultationDate}. Individual results and final
          pricing are subject to in-person clinical evaluation and confirmation.
        </Text>
      </Page>
    </Document>
  );
}
