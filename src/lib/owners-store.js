// TODO: replace with real GET/POST/PATCH /owners endpoints once they exist.
// Local, in-memory CRUD store for the Owner onboarding resource — seeded with
// demo data per company, mutated directly so navigating back to the list
// after a save reflects the change (this app's pages remount on navigation,
// so no pub/sub is needed).

const owners = [
  {
    id: 'owner-krnt-1',
    companyId: '6aa3b32e3498aa0d37e4357e',
    name: 'Selvam Logistics',
    pan: 'ABCDP1234F',
    gstin: '33ABCDP1234F1Z5',
    gstClassId: 'gst-18',
    phone: '9843211122',
    email: 'selvam.owner@example.com',
    address: 'No 12, Mill Road, Coimbatore',
    rental: false,
    accountGroup: 'Asset',
    openingBalance: 25000,
    balanceType: 'credit',
    tdsCertificatePath: null,
    tdsArray: ['TN37AB1234', 'TN37AB5678'],
    tdsVariable: 1,
    status: 'active',
    bankAccounts: [
      {
        id: 'bank-owner-krnt-1',
        name: 'Selvam Logistics',
        accountNumber: '11223344556',
        ifscCode: 'HDFC0001234',
        branchName: 'Coimbatore Main',
        active: true,
      },
    ],
  },
  {
    id: 'owner-krnt-2',
    companyId: '6aa3b32e3498aa0d37e4357e',
    name: 'Ramesh Transport Owner',
    pan: 'BFGHR5678K',
    gstin: '',
    gstClassId: 'gst-5',
    phone: '9843299887',
    email: '',
    address: 'Madawarayapuram, Coimbatore',
    rental: true,
    accountGroup: 'Credit',
    openingBalance: 0,
    balanceType: 'debit',
    tdsCertificatePath: null,
    tdsArray: [],
    tdsVariable: 2,
    status: 'active',
    bankAccounts: [],
  },
  {
    id: 'owner-kpnt-1',
    companyId: '6aa43685f34e6afd45a8d031',
    name: 'KPN Fleet Owners Co-op',
    pan: 'ACPFK9012M',
    gstin: '33ACPFK9012M1Z8',
    gstClassId: 'gst-12',
    phone: '8796712345',
    email: 'fleet@kpnt.example.com',
    address: 'Anna Nagar, Chennai',
    rental: false,
    accountGroup: 'Asset',
    openingBalance: 50000,
    balanceType: 'credit',
    tdsCertificatePath: null,
    tdsArray: [],
    tdsVariable: 1,
    status: 'active',
    bankAccounts: [
      {
        id: 'bank-owner-kpnt-1',
        name: 'KPN Fleet Owners Co-op',
        accountNumber: '99887766554',
        ifscCode: 'ICIC0004567',
        branchName: 'Anna Nagar',
        active: true,
      },
    ],
  },
]

export function listOwners(companyId) {
  return owners.filter((owner) => owner.companyId === companyId)
}

export function getOwnerById(ownerId) {
  return owners.find((owner) => owner.id === ownerId) ?? null
}

export function saveOwner(ownerData) {
  if (ownerData.id) {
    const index = owners.findIndex((owner) => owner.id === ownerData.id)
    if (index === -1) {
      throw new Error('Owner not found.')
    }
    const existingPan = ownerData.pan.trim().toUpperCase()
    const duplicate = owners.some(
      (owner) => owner.id !== ownerData.id && owner.companyId === ownerData.companyId && owner.pan.trim().toUpperCase() === existingPan,
    )
    if (duplicate) throw new Error('This PAN is already onboarded for this company.')
    owners[index] = { ...owners[index], ...ownerData }
    return owners[index]
  }

  const pan = ownerData.pan.trim().toUpperCase()
  const duplicate = owners.some((owner) => owner.companyId === ownerData.companyId && owner.pan.trim().toUpperCase() === pan)
  if (duplicate) throw new Error('This PAN is already onboarded for this company.')

  const created = { ...ownerData, id: `owner-${crypto.randomUUID()}` }
  owners.push(created)
  return created
}
