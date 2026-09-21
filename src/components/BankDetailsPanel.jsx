import { useCallback, useEffect, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { SelectField } from '@/components/ui/form-kit'
import {
  ACCOUNT_TYPE_OPTIONS,
  HOLDER_TYPES,
  activateBankDetailApi,
  createBankDetailApi,
  deactivateBankDetailApi,
  listBankDetailsApi,
} from '@/lib/bank-details-service'

const EMPTY_DRAFT = { bankName: '', accountNumber: '', ifscCode: '', branchName: '', accountType: 'SAVINGS' }

/**
 * Lists and adds bank accounts for a holder (a company, owner or driver).
 *
 * A company or a non-rental owner can keep several accounts active at once, so
 * their active accounts get a Deactivate button. Drivers and rental owners keep
 * the single-active flow (activating one replaces the current one). For owners,
 * `isRental` is sent on every create/activate/deactivate request.
 */
export function BankDetailsPanel({ holderType, holderId, companyId, isRental = false }) {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState(null)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [activatingId, setActivatingId] = useState(null)
  const [deactivatingId, setDeactivatingId] = useState(null)

  const allowsMultipleActive = holderType === HOLDER_TYPES.COMPANY || (holderType === HOLDER_TYPES.OWNER && !isRental)
  const ownerFlag = holderType === HOLDER_TYPES.OWNER ? { isRental } : {}

  const refreshAccounts = useCallback(async () => {
    setListError(null)
    try {
      const response = await listBankDetailsApi({ holderId, holderType, companyId })
      setAccounts(response ?? [])
    } catch (fetchError) {
      setListError(fetchError.response?.data?.message ?? 'Unable to load bank accounts.')
      setAccounts([])
    }
  }, [holderId, holderType, companyId])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    refreshAccounts().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [refreshAccounts])

  async function handleActivate(account) {
    setListError(null)
    setActivatingId(account._id)
    try {
      await activateBankDetailApi({ holderId, holderType, companyId, bankDetailsId: account._id, ...ownerFlag })
      await refreshAccounts()
    } catch (activateError) {
      setListError(activateError.response?.data?.message ?? 'Unable to activate this bank account.')
    } finally {
      setActivatingId(null)
    }
  }

  async function handleDeactivate(account) {
    setListError(null)
    setDeactivatingId(account._id)
    try {
      await deactivateBankDetailApi({ holderType, holderId, companyId, bankDetailsId: account._id, ...ownerFlag })
      await refreshAccounts()
    } catch (deactivateError) {
      setListError(deactivateError.response?.data?.message ?? 'Unable to deactivate this bank account.')
    } finally {
      setDeactivatingId(null)
    }
  }

  function cancelAdd() {
    setAdding(false)
    setDraft(EMPTY_DRAFT)
    setFormError(null)
  }

  async function handleAdd() {
    setFormError(null)
    if (!draft.bankName.trim() || !draft.accountNumber.trim() || !draft.ifscCode.trim() || !draft.branchName.trim()) {
      setFormError('Fill in every field before adding this bank account.')
      return
    }

    setSaving(true)
    try {
      await createBankDetailApi({
        bankName: draft.bankName.trim(),
        accountNumber: draft.accountNumber.trim(),
        ifscCode: draft.ifscCode.trim().toUpperCase(),
        branchName: draft.branchName.trim(),
        accountType: draft.accountType,
        holderType,
        holderId,
        companyId,
        ...ownerFlag,
      })
      await refreshAccounts()
      cancelAdd()
    } catch (submitError) {
      setFormError(submitError.response?.data?.message ?? 'Unable to add this bank account.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">Bank accounts</h3>
        <p className="mt-1 text-xs text-muted-foreground">Optional — add one or more bank accounts.</p>
      </div>

      {listError ? (
        <p role="alert" className="text-xs text-destructive">
          {listError}
        </p>
      ) : null}

      {loading ? (
        <div className="py-6 text-center">
          <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground/60" />
        </div>
      ) : accounts.length > 0 ? (
        <ul className="divide-y divide-border rounded-lg border border-border/70">
          {accounts.map((account) => (
            <li key={account._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {account.bankName} · {account.accountNumber}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {account.ifscCode} · {account.branchName}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {account.isActive ? (
                  <>
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-accent">
                      Active
                    </span>
                    {allowsMultipleActive ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeactivate(account)}
                        disabled={deactivatingId === account._id}
                      >
                        {deactivatingId === account._id ? <Loader2 className="size-3.5 animate-spin" /> : null}
                        Deactivate
                      </Button>
                    ) : null}
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                      Inactive
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleActivate(account)}
                      disabled={activatingId === account._id}
                    >
                      {activatingId === account._id ? <Loader2 className="size-3.5 animate-spin" /> : null}
                      Activate
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
          No bank accounts added yet.
        </p>
      )}

      {adding ? (
        <div className="space-y-4 rounded-lg border border-border bg-secondary/30 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Bank name" value={draft.bankName} onChange={(event) => setDraft({ ...draft, bankName: event.target.value })} />
            <TextField
              label="Account number"
              value={draft.accountNumber}
              onChange={(event) => setDraft({ ...draft, accountNumber: event.target.value })}
            />
            <TextField
              label="IFSC code"
              value={draft.ifscCode}
              onChange={(event) => setDraft({ ...draft, ifscCode: event.target.value.toUpperCase() })}
            />
            <TextField label="Branch name" value={draft.branchName} onChange={(event) => setDraft({ ...draft, branchName: event.target.value })} />
            <SelectField
              label="Account type"
              value={draft.accountType}
              onChange={(event) => setDraft({ ...draft, accountType: event.target.value })}
              options={ACCOUNT_TYPE_OPTIONS}
            />
          </div>
          {formError ? <p className="text-xs text-destructive">{formError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={cancelAdd}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAdd} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Add account
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => setAdding(true)}>
          <Plus className="size-4" />
          Add bank account
        </Button>
      )}
    </section>
  )
}
