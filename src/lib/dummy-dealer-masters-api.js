// TODO: remove once the real GET /dealer-masters/client/:clientId backend is
// reachable — lets the demo keep working end-to-end without a running API.

export const DUMMY_DEALER_MASTERS_ACTIVE_RESPONSE = [
  {
    _id: '6aaa74a1a54b760a75c16914',
    clientId: '6aa8fb5e031594ba06993990',
    dealerName: 'ABC Dealers',
    code: 'ABC-001',
    address: {
      type: 'PINCODE',
      pincodeAddress: {
        pincode: '600001',
        state: 'Tamil Nadu',
        district: 'Chennai',
        town: 'Chennai',
        fullAddress: '1 Dealer Street, Chennai, Tamil Nadu 600001',
      },
    },
    isActive: true,
    createdAt: '2026-09-16T10:51:13.422Z',
    updatedAt: '2026-09-16T10:51:13.422Z',
    __v: 0,
  },
  {
    _id: '6aaa74cea54b760a75c16915',
    clientId: '6aa8fb5e031594ba06993990',
    dealerName: 'XYZ Dealers',
    code: 'XYZ-001',
    address: {
      type: 'PINCODE',
      pincodeAddress: {
        pincode: '600001',
        state: 'Tamil Nadu',
        district: 'Chennai',
        town: 'Chennai',
        fullAddress: '2 Dealer Street, Chennai, Tamil Nadu 600001',
      },
    },
    isActive: true,
    createdAt: '2026-09-16T10:51:58.163Z',
    updatedAt: '2026-09-16T10:55:01.270Z',
    __v: 0,
  },
  // `code` matches the "Thoothukudi" branch _id on the MS Transport client
  // (6aa8fb52031594ba0699398f) below — exercises the non-cement DC flow,
  // where the consignee branch id is matched against a dealer's code to
  // auto-pick a single invoice/ship-to address.
  {
    _id: '6aabead58cce47893bb5a1a6',
    clientId: '6aa8fb52031594ba0699398f',
    dealerName: 'Thuthukodi-Updated',
    code: '6aabead58cce47893bb5a1a5',
    address: {
      type: 'PINCODE',
      pincodeAddress: {
        pincode: '600001',
        state: 'Tamil Nadu',
        district: 'Thuthukodi-Updated',
        town: 'George Town',
        fullAddress: '123 Main Street, George Town, Thuthukodi-Updated',
      },
    },
    dealerType: 'COMPANY',
    isActive: true,
    createdAt: '2026-09-17T13:27:49.686Z',
    updatedAt: '2026-09-17T13:39:44.602Z',
    __v: 0,
  },
]

export const DUMMY_DEALER_MASTERS_INACTIVE_RESPONSE = [
  {
    _id: '6aaa75a1a54b760a75c16916',
    clientId: '6aa8fb5e031594ba06993990',
    dealerName: 'Old Dealers (disabled)',
    code: 'OLD-001',
    address: {
      type: 'PINCODE',
      pincodeAddress: {
        pincode: '600028',
        state: 'Tamil Nadu',
        district: 'Chennai',
        town: 'Adyar',
        fullAddress: '3 Dealer Street, Chennai, Tamil Nadu 600028',
      },
    },
    isActive: false,
    createdAt: '2026-06-02T09:20:11.000Z',
    updatedAt: '2026-08-11T10:00:00.000Z',
    __v: 0,
  },
]
