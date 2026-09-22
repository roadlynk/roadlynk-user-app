// Preview data for the Bunk Data masters page — a flat, company-wide list of
// named fuel bunks (matches the real GET /bunks?companyId and POST /bunks
// shapes exactly: { _id, companyId, name, createdAt, updatedAt }). Used while
// designing the list UI against a realistic volume of records; swap the page
// over to listBunksApi/createBunkApi from bunk-service.js when ready.

const DUMMY_COMPANY_ID = '6aacfc2d04cb1684b36b72f7'

const BRANDS = ['Indian Oil', 'Bharat Petroleum', 'Hindustan Petroleum', 'Reliance', 'Shell', 'Nayara Energy', 'Essar', 'Jio-bp', 'IBP', 'MRPL']

const PLACES = [
  'Ariyalur', 'Mettur', 'Salem', 'Trichy', 'Dindigul', 'Erode', 'Karur', 'Namakkal', 'Perambalur', 'Thanjavur',
  'Coimbatore', 'Madurai', 'Villupuram', 'Cuddalore', 'Chidambaram', 'Sivagangai', 'Tenkasi', 'Tirunelveli', 'Tuticorin', 'Pollachi',
]

function pad(num, size) {
  return num.toString(16).padStart(size, '0')
}

function makeObjectId(index) {
  return `6ab2${pad(index, 20)}`
}

const BASE_TIME = Date.parse('2026-08-01T00:00:00.000Z')

const NAMES = PLACES.flatMap((place) => BRANDS.map((brand) => `${brand} - ${place}`)).slice(0, 100)

export const DUMMY_BUNKS = NAMES.map((name, index) => {
  const timestamp = new Date(BASE_TIME + index * 6 * 60 * 60 * 1000).toISOString()
  return {
    _id: makeObjectId(index + 1),
    companyId: DUMMY_COMPANY_ID,
    name,
    createdAt: timestamp,
    updatedAt: timestamp,
    __v: 0,
  }
})

let bunksStore = [...DUMMY_BUNKS]

export function dummyListBunksApi({ companyId }) {
  return Promise.resolve(bunksStore.filter((bunk) => bunk.companyId === companyId))
}

export function dummyCreateBunkApi({ companyId, name }) {
  const now = new Date().toISOString()
  const created = {
    _id: makeObjectId(bunksStore.length + 1),
    companyId,
    name,
    createdAt: now,
    updatedAt: now,
    __v: 0,
  }
  bunksStore = [...bunksStore, created]
  return Promise.resolve(created)
}
