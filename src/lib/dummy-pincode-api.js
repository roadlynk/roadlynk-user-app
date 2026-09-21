// TODO: remove once the real GET /pincode backend is reachable — lets the
// demo keep working end-to-end without a running API.

export const DUMMY_PINCODES = {
  517102: {
    statename: 'ANDHRA PRADESH',
    district: 'Tirupati',
    pincode: '517102',
    officename: [
      'Kotala B.O',
      'Mangapuram B.O',
      'Seshapuram B.O',
      'Bopparajupalle B.O',
      'Buchinaidupalle B.O',
      'Bhimavaram B.O',
      'Mungilipattu B.O',
      'Ayithepalle B.O',
      'Dornakambala B.O',
      'Rangampet B.O',
      'Narasingapuram S.O (Chittoor)',
    ],
  },
  600001: {
    statename: 'TAMIL NADU',
    district: 'Chennai',
    pincode: '600001',
    officename: ['Chennai GPO H.O', 'Parrys S.O', 'High Court S.O'],
  },
  600028: {
    statename: 'TAMIL NADU',
    district: 'Chennai',
    pincode: '600028',
    officename: ['Adyar S.O', 'Kotturpuram B.O'],
  },
  641114: {
    statename: 'TAMIL NADU',
    district: 'Coimbatore',
    pincode: '641114',
    officename: ['Madawarayapuram B.O', 'Podanur S.O'],
  },
  636001: {
    statename: 'TAMIL NADU',
    district: 'Salem',
    pincode: '636001',
    officename: ['Salem Town H.O', 'Hasthampatti S.O'],
  },
  110001: {
    statename: 'DELHI',
    district: 'New Delhi',
    pincode: '110001',
    officename: ['Connaught Place S.O', 'Parliament Street S.O'],
  },
  400001: {
    statename: 'MAHARASHTRA',
    district: 'Mumbai',
    pincode: '400001',
    officename: ['Mumbai GPO H.O', 'Fort Market S.O'],
  },
  560001: {
    statename: 'KARNATAKA',
    district: 'Bangalore',
    pincode: '560001',
    officename: ['Bangalore GPO H.O', 'Cubbon Park S.O'],
  },
  500001: {
    statename: 'TELANGANA',
    district: 'Hyderabad',
    pincode: '500001',
    officename: ['Hyderabad GPO H.O', 'Abids S.O'],
  },
  700001: {
    statename: 'WEST BENGAL',
    district: 'Kolkata',
    pincode: '700001',
    officename: ['Kolkata GPO H.O', 'Dalhousie Square S.O'],
  },
}

export function lookupDummyPincode(pincode) {
  return DUMMY_PINCODES[pincode] ?? null
}
