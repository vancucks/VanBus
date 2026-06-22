export type BusStatus = 'AR_GELANDO' | 'VENTANDO' | 'QUENTE';

export type Bus = {
  id: string;
  busNumber: string;
  lineNumber: string;
  status: BusStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
};
