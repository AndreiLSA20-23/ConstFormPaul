// Common Date Range Interface
export interface IDateRange {
  startDate: Date;
  endDate: Date;
}

// Common Address Interface
export interface IAddress {
  city: string;
  state: string; // Simplified to match IAddressData
  country: string;
  zipCode: string; // Renamed to match IAddressData
}

// Employment History Interface
export interface IEmploymentHistory extends IDateRange {
  id: number;
  companyName: string;
  country: string;
  state: string;
  city: string;
  lineAddress1: string;
  lineAddress2?: string;
  zipCode: string;
  telephone: string;
  positionHeld: string;
  reasonForLeaving?: string;
  terminated?: boolean;
  isCurrentEmployer?: boolean;
  contactPermission?: boolean | null; // Добавлено null как допустимое значение
  operatedCommercialVehicle?: boolean;
  federalRegulationsSubject?: boolean;
  performedSafetyFunctions?: boolean;
  areasDriven?: string[];
  payRange?: string;
  truckType?: string;
  trailerType?: string;
  trailerLength?: string;
  payPerMile?: string;
}


// Unemployment History Interface
export interface IUnemploymentHistory extends IDateRange {
  id: number;
  reason: string;
  comments?: string;
}

// School History Interface
export interface ISchoolHistory extends IDateRange, IAddress {
  id: number;
  schoolName: string;
  countrySchool: string;
  stateSchool: string;
  city: string;
  phoneSchool: string;
  degree?: string;
  fieldOfStudy: string;
  graduationDate?: Date | null;
}

// Military Service History Interface
export interface IMilitaryServiceHistory extends IDateRange {
  id: number;
  countryMilit: string,
  stateMilit: string,
  branch: string;
  rank: string;
  canObtainDD214?: boolean;
}


// Интерфейс для компонента Start
export interface IStartData {
  sampleCmpName: string;
  sampleCmpAddress: string;
  homeHistory: number;
  driveLicHistory: number;
  empHistory: number;
  phone: string;
  personPhoneOrg: string;
  age: number;
  felonyConvictions: number; 
  trafficAccidents: number;
}

// Интерфейс для данных адреса
export interface IAddressData extends IAddress {
  startDate: Date;
  endDate: Date;
  addressLine1: string;
  addressLine2: string;
}

// Интерфейс для деталей лицензии
export interface LicenseDetails {
  licenseNumber: string;
  country: string;
  state?: string; // State is now optional
  expirationDate: string;
  medicalExpirationDate?: string;
  currentLicense: boolean;
  commercialLicense: boolean;
  licenseType?: string;
  noneEndorsement: boolean;
  otherEndorsement: boolean;
  tankerEndorsement: boolean;
  doublesTriplesEndorsement: boolean;
  xEndorsement: boolean;
  hazmatEndorsement: boolean;
  hazmatExpirationDate?: string;
}
