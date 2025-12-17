
export enum UnitType {
  TRAILER = 'Trailer',
  TORTON = 'Torton'
}

export interface RouteInfo {
  distanceKm: number; // This comes from API
  duration: string;
  summary: string;
  mapUrl?: string;
  sourceTitle?: string;
}

export interface CostBreakdown {
  dieselCost: number;
  tollsCost: number;
  operatorSalary: number;
  operatorBonus: number;
  adminCost: number;
  totalExpenses: number;
  profit: number;
  profitPerKm: number;
  litersConsumed: number;
}

export interface CalculationResult {
  route: RouteInfo;
  costs: CostBreakdown;
  inputs: {
    origin: string;
    destination: string;
    hasIntermediatePoint?: boolean;
    intermediatePoint?: string;
    unitType: UnitType;
    freightPrice: number;
    manualDistance: number; // User override
    isRoundTrip: boolean;
    tolls: number;
    tripDays: number;
    dieselPrice: number;
    fuelEfficiency: number;
    generalRate: number;
  };
}

export interface SavedCalculation {
  id: string;
  timestamp: number;
  name: string;
  result: CalculationResult;
  observations?: string;
  user?: string;
}
