import { api } from './api-client'

// GET {{apiBaseUrl}}/pincode?pincode=XXXXXX
// -> { statename, district, pincode, officename: string[] }
// A pincode with no records throws (error.response.data is
// { message: "No records found for the given pincode", error_code }).
export async function lookupPincodeApi(pincode) {
  const { data } = await api.get('/pincode', { params: { pincode } })
  return data
}
