// ==========================================
// ThreadFlow — Risk Engine Service
// ==========================================
// Pure calculation functions — NO AI, fully transparent.

import { IRiskAssessment, RiskLevel } from '@/types';

/**
 * Calculate business hours between now and a deadline.
 * Assumes 10-hour work days (8am-6pm), 6 days/week (Mon-Sat).
 */
export function getBusinessHoursUntilDeadline(deadline: Date | string): number {
  const now = new Date();
  const deadlineDate = new Date(deadline);

  if (deadlineDate <= now) return 0;

  let hours = 0;
  const current = new Date(now);

  while (current < deadlineDate) {
    const dayOfWeek = current.getDay(); // 0=Sun, 1=Mon...6=Sat
    const hour = current.getHours();

    // Count if it's a work day (Mon-Sat) and work hours (8am-6pm)
    if (dayOfWeek >= 1 && dayOfWeek <= 6 && hour >= 8 && hour < 18) {
      hours++;
    }

    current.setHours(current.getHours() + 1);
  }

  return hours;
}

/**
 * Calculate risk assessment for an order.
 *
 * Formula:
 *   total stitches = stitches/item × quantity
 *   hours needed = total stitches ÷ machine stitches/hour
 *   compare with available business hours until deadline
 *
 * Risk Levels:
 *   Low:    utilization ≤ 70%
 *   Medium: utilization 70-90%
 *   High:   utilization > 90%
 */
export function calculateRisk(
  stitchesPerItem: number,
  quantity: number,
  machineStitchesPerHour: number,
  deadline: Date | string
): IRiskAssessment {
  const totalStitches = stitchesPerItem * quantity;
  const hoursNeeded = machineStitchesPerHour > 0
    ? totalStitches / machineStitchesPerHour
    : Infinity;
  const hoursAvailable = getBusinessHoursUntilDeadline(deadline);

  const utilizationPercent = hoursAvailable > 0
    ? (hoursNeeded / hoursAvailable) * 100
    : hoursNeeded > 0 ? 100 : 0;

  const capacityShortfall = Math.max(0, hoursNeeded - hoursAvailable);

  let risk: RiskLevel;
  if (utilizationPercent > 90) {
    risk = 'high';
  } else if (utilizationPercent > 70) {
    risk = 'medium';
  } else {
    risk = 'low';
  }

  return {
    totalStitches,
    hoursNeeded: Math.round(hoursNeeded * 10) / 10,
    hoursAvailable: Math.round(hoursAvailable * 10) / 10,
    capacityShortfall: Math.round(capacityShortfall * 10) / 10,
    risk,
    utilizationPercent: Math.round(utilizationPercent),
  };
}

/**
 * Get a human-readable risk explanation.
 */
export function getRiskExplanation(assessment: IRiskAssessment): string {
  if (assessment.risk === 'low') {
    return `Sufficient capacity. ${assessment.hoursAvailable}h available, ${assessment.hoursNeeded}h needed.`;
  }
  if (assessment.risk === 'medium') {
    return `Moderate load. ${assessment.utilizationPercent}% capacity used. Consider prioritizing.`;
  }
  return `Capacity shortfall of ${assessment.capacityShortfall}h. Needs ${assessment.hoursNeeded}h but only ${assessment.hoursAvailable}h available.`;
}
