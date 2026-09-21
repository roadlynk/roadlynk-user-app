// TODO: remove once the real GET /materials?companyId=&active= backend is
// reachable — lets the demo keep working end-to-end without a running API.

export const DUMMY_MATERIALS_ACTIVE_RESPONSE = [
  {
    _id: '6aa9749ec044cc76a5ff6610',
    companyId: '6aa3b2553498aa0d37e43579',
    material: 'Ash',
    category: ['Pond Ash', 'Dry Fly Ash', 'Bottom Ash', 'Mound Ash'],
    quantityType: 'MT',
    materialSpecificFields: [{ fieldName: 'Moisture %', fieldType: 'number' }],
    isActive: true,
    createdAt: '2026-09-15T16:38:54.235Z',
    updatedAt: '2026-09-15T16:38:54.235Z',
    __v: 0,
  },
  {
    _id: '6aaa70ebef1575e87f2ddfb7',
    companyId: '6aa3b2553498aa0d37e43579',
    material: 'Cement',
    category: ['Trade', 'Non-Trade', 'STO'],
    quantityType: 'MT',
    materialSpecificFields: [
      { fieldName: 'Bag Count', fieldType: 'number' },
      // NOTE: the real response this was copied from had fieldType
      // "dropdwon" (typo) — corrected to "dropdown" here since that's what
      // this app's dropdown-field rendering actually checks for.
      { fieldName: 'Grade', fieldType: 'dropdown', values: ['OPC', 'PPC', 'DIP', 'DSP', 'INSTAPRO'] },
    ],
    isActive: true,
    createdAt: '2026-09-16T10:35:23.775Z',
    updatedAt: '2026-09-16T10:35:23.775Z',
    __v: 0,
  },
]

export const DUMMY_MATERIALS_INACTIVE_RESPONSE = [
  {
    _id: '6aa9750fc044cc76a5ff6611',
    companyId: '6aa3b2553498aa0d37e43579',
    material: 'Gypsum (disabled)',
    category: ['Chemical Gypsum'],
    quantityType: 'MT',
    materialSpecificFields: [],
    isActive: false,
    createdAt: '2026-06-02T09:20:11.000Z',
    updatedAt: '2026-08-11T10:00:00.000Z',
    __v: 0,
  },
]
