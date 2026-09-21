// Shared business logic for the company-workspace onboarding forms
// (Owners / Drivers / Trucks). Ported from the Doclynk reference app's
// src/lib/onboarding.ts — the TDS rules and bank-account editing rules are
// kept faithful; persistence is simplified to local state (see the
// *-store.js files) since there is no backend for these resources yet.

export const TDS_MAX_TRUCKS = 10

/** PAN's 4th character: "P" = individual, anything else = firm. */
export function panHolderType(pan) {
  const fourthChar = (pan ?? '').trim().toUpperCase()[3]
  return fourthChar === 'P' ? 'individual' : 'firm'
}

/** "Credit" if the owner is a rental owner, else "Asset". */
export function accountGroupFor(rental) {
  return rental ? 'Credit' : 'Asset'
}

export function normaliseTruckNumber(value) {
  return (value ?? '').trim().toUpperCase().replace(/\s+/g, '')
}

/** Splits a newline/comma separated string into a deduped, normalised truck list. */
export function parseTruckList(value) {
  const parts = (value ?? '')
    .split(/[\n,]+/)
    .map((part) => normaliseTruckNumber(part))
    .filter(Boolean)
  return Array.from(new Set(parts))
}

/**
 * 0% if a valid TDS certificate is on file, covers a non-empty list of ≤10
 * trucks; otherwise 1% for an individual owner or 2% for a firm.
 */
export function computeTdsVariable({ pan, hasCertificate, tdsArray }) {
  const covered = hasCertificate && tdsArray.length > 0 && tdsArray.length <= TDS_MAX_TRUCKS
  if (covered) return 0
  return panHolderType(pan) === 'individual' ? 1 : 2
}

/**
 * Re-checks TDS certificate coverage when a truck is newly linked to an owner.
 * Returns { owner, warning } — owner is unchanged unless the certificate no
 * longer covers the truck list (too many trucks), in which case tds_variable
 * is recomputed and a warning message is returned.
 */
export function reconcileOwnerTdsForTruck(owner, truckNumber) {
  if (!owner) return { owner, warning: null }

  const truck = normaliseTruckNumber(truckNumber)
  const hasCertificate = Boolean(owner.tdsCertificatePath)
  const tdsArray = owner.tdsArray ?? []

  if (tdsArray.length > TDS_MAX_TRUCKS) {
    const updated = {
      ...owner,
      tdsVariable: computeTdsVariable({ pan: owner.pan, hasCertificate: false, tdsArray: [] }),
    }
    return {
      owner: updated,
      warning: `${owner.name}'s TDS certificate covers more than ${TDS_MAX_TRUCKS} trucks and is no longer valid.`,
    }
  }

  if (hasCertificate && truck && !tdsArray.includes(truck)) {
    return {
      owner,
      warning: `${truck} is not listed on ${owner.name}'s TDS certificate. It has not been added automatically.`,
    }
  }

  return { owner, warning: null }
}

export function bankHasInput(bank) {
  return Boolean(bank.name || bank.accountNumber || bank.ifscCode || bank.branchName)
}

export const EMPTY_BANK = { name: '', accountNumber: '', ifscCode: '', branchName: '', active: false }

/** Requires ≥1 draft, exactly one active, all fields filled, no duplicate account numbers. */
export function validateBankDrafts(drafts) {
  if (drafts.length === 0) return 'Add at least one bank account.'
  const activeCount = drafts.filter((draft) => draft.active).length
  if (activeCount !== 1) return 'Exactly one bank account must be marked active.'
  for (const draft of drafts) {
    if (!draft.name.trim() || !draft.accountNumber.trim() || !draft.ifscCode.trim() || !draft.branchName.trim()) {
      return 'Fill in every field for each bank account.'
    }
  }
  const accountNumbers = drafts.map((draft) => draft.accountNumber.trim())
  if (new Set(accountNumbers).size !== accountNumbers.length) {
    return 'Bank account numbers must be unique.'
  }
  return null
}
