import type { Reservation, PrescriptionRequest, Notification } from '../types/pharmacy';

// Reservations, prescription requests and notifications are not in the backend yet (Step 4).
// These stay in-memory so the portal keeps working end to end until those endpoints exist.

const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'RES-801',
    medicineName: 'Paracetamol 500mg',
    quantity: 2,
    scheduledTime: '14:30 Today',
    patientName: 'Abebe Kebede',
    patientId: 'P-9011',
    patientPhone: '+251 91 123 4567',
    pickupDeadline: 'Expires in 45 mins',
    pickupDeadlineMinutes: 45,
    pickupCode: '1234',
    distanceKm: 2.3,
    status: 'Ready for Pickup',
    amountETB: 30.0
  },
  {
    id: 'RES-802',
    medicineName: 'Amoxicillin 500mg',
    quantity: 1,
    scheduledTime: '15:00 Today',
    patientName: 'Tigist Haile',
    patientId: 'P-4412',
    patientPhone: '+251 92 888 9911',
    pickupDeadline: 'Expires in 2 hours',
    pickupDeadlineMinutes: 120,
    pickupCode: '5678',
    distanceKm: 8.5,
    status: 'Ready for Pickup',
    amountETB: 120.0
  },
  {
    id: 'RES-803',
    medicineName: 'Metformin 850mg',
    quantity: 3,
    scheduledTime: '15:45 Today',
    patientName: 'Dawit Yohannes',
    patientId: 'P-7734',
    patientPhone: '+251 94 555 1212',
    pickupDeadline: 'Expires in 1 hour',
    pickupDeadlineMinutes: 60,
    pickupCode: '9012',
    distanceKm: 12.0,
    status: 'Ready for Pickup',
    amountETB: 256.5
  }
];

const MOCK_PRESCRIPTIONS: PrescriptionRequest[] = [
  {
    id: 'RX-1024',
    patientId: 'P-9281',
    receivedAt: '10:30 AM · Jul 25',
    source: 'OCR',
    ocrConfidence: 87,
    status: 'New',
    medicines: [
      { name: 'Amoxicillin 500mg', requestedQuantity: 2, available: null },
      { name: 'Paracetamol 500mg', requestedQuantity: 1, available: null },
    ],
  },
  {
    id: 'RX-1025',
    patientId: 'P-4412',
    receivedAt: '09:14 AM · Jul 25',
    source: 'Direct Broadcast',
    ocrConfidence: undefined,
    status: 'Under Review',
    medicines: [
      { name: 'Metformin 850mg', requestedQuantity: 3, available: null },
    ],
  },
  {
    id: 'RX-1023',
    patientId: 'P-7734',
    receivedAt: '08:00 AM · Jul 25',
    source: 'OCR',
    ocrConfidence: 92,
    status: 'Available',
    medicines: [
      { name: 'Atorvastatin 20mg', requestedQuantity: 1, available: true },
      { name: 'Aspirin 81mg', requestedQuantity: 1, available: true },
    ],
  },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'N-001',
    type: 'Inventory',
    title: 'Amoxicillin 500mg is low in stock',
    description: 'Only 3 units remaining. Minimum threshold is 50. Consider placing a restock order.',
    isRead: false,
    createdAt: '2 minutes ago',
    icon: 'inventory_2',
    linkTab: 'inventory',
    linkMedicineId: 'MED-101',
  },
  {
    id: 'N-002',
    type: 'Inventory',
    title: 'Expiry Alert: 3 medicines expire within 30 days',
    description: 'Amoxicillin 500mg, Ibuprofen 200mg, and Insulin NPH are nearing expiry.',
    isRead: false,
    createdAt: '14 minutes ago',
    icon: 'event_busy',
    linkTab: 'inventory',
  },
  {
    id: 'N-003',
    type: 'Prescription',
    title: 'New prescription request received',
    description: 'Patient #P-9281 sent a prescription for review. Source: OCR (87% confidence).',
    isRead: false,
    createdAt: '28 minutes ago',
    icon: 'smart_toy',
    linkTab: 'prescriptions',
  },
];


export { MOCK_RESERVATIONS, MOCK_PRESCRIPTIONS, MOCK_NOTIFICATIONS };
