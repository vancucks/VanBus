export type BusStatus = 'AR_GELANDO' | 'VENTANDO' | 'QUENTE';

export type Bus = {
  id: string;
  busNumber: string;
  lineNumber: string;
  status: BusStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
  creatorName?: string;
  creatorEmail?: string;
};

export type BusRow = {
  id: string;
  bus_number: string;
  line_number: string;
  status: BusStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
};
