import { Session, Metric, User } from '@prisma/client';

export class FhirService {
  /**
   * Converts a JoGait Session and its Metrics into a standard HL7 FHIR Bundle of Observations.
   * This is essential for Enterprise EMR integrations (Epic, Cerner, etc.).
   */
  static convertToFhirBundle(patient: User, sessions: Session[], metrics: Metric[]) {
    const bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [] as any[]
    };

    // 1. Add FHIR Patient Resource
    bundle.entry.push({
      resource: {
        resourceType: 'Patient',
        id: patient.id,
        name: [{ text: patient.name }],
        telecom: [{ system: 'email', value: patient.email }]
      }
    });

    // A dictionary mapping your internal JoGait metrics to official LOINC or SNOMED CT codes
    const CLINICAL_CODE_MAP: Record<string, { system: string; code: string; display: string }> = {
      'kneeAngle': { system: 'http://loinc.org', code: '891-9', display: 'Range of motion' },
      'stepCount': { system: 'http://loinc.org', code: '41950-7', display: 'Number of steps in 24 hour Measured' },
      'walkingSpeed': { system: 'http://loinc.org', code: '88056-7', display: 'Gait speed' },
      // Fallback for custom metrics that don't have a specific LOINC code yet
      'default': { system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'activity', display: 'Physical Activity' }
    };

    // 2. Map metrics to FHIR Observation Resources
    metrics.forEach(metric => {
      // Look up the real clinical code, or use the fallback
      const clinicalCode = CLINICAL_CODE_MAP[metric.metricType] || CLINICAL_CODE_MAP['default'];
      
      bundle.entry.push({
        resource: {
          resourceType: 'Observation',
          id: metric.id,
          status: 'final',
          code: {
            coding: [{
              system: clinicalCode.system,
              code: clinicalCode.code,
              display: clinicalCode.display
            }]
          },
          subject: { reference: `Patient/${patient.id}` },
          effectiveDateTime: metric.timestamp.toISOString(),
          valueQuantity: {
            value: metric.value,
            unit: metric.unit
          }
        }
      });
    });

    return bundle;
  }
}
