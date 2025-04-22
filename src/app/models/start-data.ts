import {
  IEmploymentHistory,
  IUnemploymentHistory,
  ISchoolHistory,
  IMilitaryServiceHistory,
  IStartData,
} from './data.model';

export const START_DATA_1: IStartData = {
  sampleCmpName: 'GOOD NEWS CARRIER',
  felonyConvictions: 7,
  sampleCmpAddress: '13450 KING RD., LEMONT, IL 630439',
  homeHistory: 10,
  driveLicHistory: 4,
  empHistory: 10,
  phone: '', //Client phone
  personPhoneOrg: '708-252-3829', //Company Phone
  age: 23, // Min driver age
  trafficAccidents: 6,
};


export const trailerLengths: string[] = [
  '10 ft', '15 ft', '20 ft', '24 ft', '28 ft', '40 ft',
  '45 ft', '48 ft', '53 ft', '57 ft', '60+ ft', '75+ ft',
];

export const mostCommonTrailers: string[] = [
  'Flatbed', 'Dry Van', 'Reefer', 'Tanker', 'Step Deck', 'Double Trailers',
  'Lowboy', 'Container Chassis', 'Livestock', 'Car Carrier', 'Extendable Flatbed',
  'Dump Trailer', 'Beverage Trailer', 'Grain Hopper', 'Logging Trailer',
  'Chemical Tanker', 'Food-Grade Tanker', 'Furniture Van', 'Pup Trailer',
  'Side Dump Trailer', 'Belt Trailer', 'Tilt Trailer', 'Specialized Heavy Haul', 'Other',
];

export const mostCommonTrucks: string[] = [
  'Class 8: Freightliner Cascadia', 'Class 8: Kenworth T680', 'Class 8: Volvo VNL',
  'Class 8: Peterbilt 579', 'Class 8: International LT', 'Class 8: Mack Anthem',
  'Class 7: International DuraStar', 'Class 7: Freightliner M2 106',
  'Class 7: Ford F-750', 'Class 7: Hino 338', 'Box Truck: Isuzu NPR',
  'Box Truck: Chevrolet LCF', 'Box Truck: Ford E-Series Box Truck',
  'Box Truck: GMC Savana Box Truck', 'Flatbed Truck: Standard Flatbed',
  'Flatbed Truck: Step Deck Flatbed', 'Flatbed Truck: Extendable Flatbed',
  'Reefer Truck: Thermo King Reefer Truck', 'Reefer Truck: Carrier Reefer Truck',
  'Reefer Truck: Freightliner Reefer Truck', 'Tanker Truck: Milk Tanker',
  'Tanker Truck: Fuel Tanker', 'Tanker Truck: Chemical Tanker',
  'Tanker Truck: Food-Grade Tanker', 'Tanker Truck: Water Tanker',
  'Dump Truck: Standard Dump Truck', 'Dump Truck: Side Dump Truck',
  'Dump Truck: Transfer Dump Truck', 'Dump Truck: Super Dump Truck',
  'Dump Truck: Belly Dump Truck', 'Specialized Truck: Logging Truck',
  'Specialized Truck: Tow Truck', 'Specialized Truck: Car Carrier',
  'Specialized Truck: Beverage Truck', 'Specialized Truck: Grain Hopper Truck',
  'Specialized Truck: Cement Mixer Truck', 'Specialized Truck: Utility Service Truck',
  'Specialized Truck: Heavy Hauler', 'Other',
];


export const NULL_DATA = {
  employmentHistory: [
    {
      id: 0,
      companyName: '',
      startDate: new Date(0),
      endDate: new Date(0),
      city: '',
      state: '',
      country: '',
      lineAddress1: '',
      lineAddress2: '',
      zipCode: '',
      telephone: '',
      positionHeld: '',
      reasonForLeaving: '',
      terminated: false,
      isCurrentEmployer: false,
      contactPermission: undefined,
      operatedCommercialVehicle: undefined,
      federalRegulationsSubject: undefined,
      performedSafetyFunctions: undefined,
      areasDriven: [], // Исправлено на массив строк
      payRange: '',
      truckType: '',
      trailerType: '',
      trailerLength: '',
      payPerMile: '',
    },
  ] as IEmploymentHistory[],

  unemploymentHistory: [
    {
      id: 0,
      startDate: new Date(0),
      endDate: new Date(0),
      reason: '',
      comments: '',
    },
  ] as IUnemploymentHistory[],

  schoolHistory: [
    {
      id: 0,
      schoolName: '',
      startDate: new Date(0),
      endDate: new Date(0),
      countrySchool: '',
      stateSchool: '',
      city: '',
      phoneSchool: '',
      fieldOfStudy: '',
      graduationDate: new Date(0), // Новое поле для даты выпуска
    },
  ] as ISchoolHistory[],

  militaryServiceHistory: [
    {
      id: 0,
      startDate: new Date(0),
      endDate: new Date(0),
      countryMilit: '',
      stateMilit: '',
      branch: '',
      rank: '',
      canObtainDD214: false,
    },
  ] as IMilitaryServiceHistory[],
};
