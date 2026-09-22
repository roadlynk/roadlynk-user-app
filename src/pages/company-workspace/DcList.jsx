import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  Building2,
  CalendarRange,
  ChevronDown,
  FileDown,
  FileSpreadsheet,
  FileText,
  Loader2,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Route,
  Search,
  SlidersHorizontal,
  Truck as TruckIcon,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { CheckboxField, EmptyState, SelectField, TableShell } from '@/components/ui/form-kit'
import { cn } from '@/lib/utils'
import { downloadDeliveryChallanPdfApi, exportDeliveryChallansExcelApi, filterDeliveryChallansApi } from '@/lib/delivery-challan-service'
import { listClientsApi } from '@/lib/client-service'
import { listTrucksApi } from '@/lib/truck-service'
import { listMaterialsApi } from '@/lib/material-service'
import { listDriversApi } from '@/lib/driver-service'
import { listDealersApi } from '@/lib/dealer-service'

const PAGE_SIZE = 20
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// yyyy-mm-dd in local time, `daysAgo` days before today (0 = today).
function isoDateDaysAgo(daysAgo) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toLocaleDateString('en-CA')
}

const DEFAULT_DC_DATE_FROM = isoDateDaysAgo(2)
const DEFAULT_DC_DATE_TO = isoDateDaysAgo(0)

const EMPTY_FILTERS = {
  dcDateFrom: DEFAULT_DC_DATE_FROM,
  dcDateTo: DEFAULT_DC_DATE_TO,

  invoice: '',
  shipmentNumber: '',
  companyFromDate: '',
  companyToDate: '',

  consignorId: '',
  consignorBranchId: '',
  consigneeId: '',
  consigneeBranchId: '',

  invoiceDealerId: '',
  shipToDealerId: '',

  materialId: '',
  deliveryCategory: '',
  materialFieldValues: {},

  truckId: '',
  driverId: '',

  activeOnly: true,
}

const DEFAULT_OPEN_GROUPS = {
  companyDetails: true,
  consignment: true,
  dealerDetails: true,
  material: true,
  truckDetails: true,
}

// Mirrors CompanyDetailsFilterDto / ConsignmentFilterDto / DealerDetailsFilterDto /
// MaterialDetailsFilterDto / TruckDetailsFilterDto / FilterDeliveryChallansDto —
// each nested object is only sent once it has at least one field set.
function buildFilterPayload(companyId, filters, materials) {
  const payload = { companyId }

  const companyDetails = {}
  if (filters.invoice.trim()) companyDetails.invoice = filters.invoice.trim()
  if (filters.shipmentNumber.trim()) companyDetails.shipmentNumber = filters.shipmentNumber.trim()
  if (filters.companyFromDate) companyDetails.fromDate = filters.companyFromDate
  if (filters.companyToDate) companyDetails.toDate = filters.companyToDate
  if (Object.keys(companyDetails).length) payload.companyDetails = companyDetails

  const consignment = {}
  if (filters.consignorId) consignment.consignorId = filters.consignorId
  if (filters.consignorBranchId) consignment.consignorBranchId = filters.consignorBranchId
  if (filters.consigneeId) consignment.consigneeId = filters.consigneeId
  if (filters.consigneeBranchId) consignment.consigneeBranchId = filters.consigneeBranchId
  if (Object.keys(consignment).length) payload.consignment = consignment

  const dealerDetails = {}
  if (filters.invoiceDealerId) dealerDetails.invoiceDealerId = filters.invoiceDealerId
  if (filters.shipToDealerId) dealerDetails.shipToDealerId = filters.shipToDealerId
  if (Object.keys(dealerDetails).length) payload.dealerDetails = dealerDetails

  const selectedMaterial = materials.find((item) => item._id === filters.materialId) ?? null
  const material = {}
  if (filters.materialId) material.materialId = filters.materialId
  if (filters.deliveryCategory) material.deliveryCategory = filters.deliveryCategory
  const dynamicFields = Object.fromEntries(
    Object.entries(filters.materialFieldValues)
      .filter(([, value]) => value !== '')
      .map(([fieldName, value]) => {
        const fieldDef = selectedMaterial?.materialSpecificFields?.find((field) => field.fieldName === fieldName)
        return [fieldName, fieldDef?.fieldType === 'number' ? Number(value) || 0 : value]
      }),
  )
  if (Object.keys(dynamicFields).length) material.dynamicFields = dynamicFields
  if (Object.keys(material).length) payload.material = material

  const truckDetails = {}
  if (filters.truckId) truckDetails.truckId = filters.truckId
  if (filters.driverId) truckDetails.driverId = filters.driverId
  if (Object.keys(truckDetails).length) payload.truckDetails = truckDetails

  if (filters.dcDateFrom) payload.dcDateFrom = filters.dcDateFrom
  if (filters.dcDateTo) payload.dcDateTo = filters.dcDateTo

  payload.isActive = filters.activeOnly

  return payload
}

function countActiveFilters(filters) {
  const simpleKeys = [
    'invoice',
    'shipmentNumber',
    'companyFromDate',
    'companyToDate',
    'consignorId',
    'consignorBranchId',
    'consigneeId',
    'consigneeBranchId',
    'invoiceDealerId',
    'shipToDealerId',
    'materialId',
    'deliveryCategory',
    'truckId',
    'driverId',
    'dcDateFrom',
    'dcDateTo',
  ]
  const simpleCount = simpleKeys.filter((key) => Boolean(filters[key])).length
  const dynamicCount = Object.values(filters.materialFieldValues).filter((value) => value !== '').length
  return simpleCount + dynamicCount
}

function formatChipDate(iso) {
  if (!iso) return null
  const [year, month, day] = iso.split('-')
  return { day: Number(day), month: MONTH_LABELS[Number(month) - 1], year }
}

function formatDateRangeChip(fromIso, toIso) {
  const from = formatChipDate(fromIso)
  const to = formatChipDate(toIso)
  if (from && to) {
    if (from.month === to.month && from.year === to.year) return `${from.day}-${to.day} ${from.month}`
    return `${from.day} ${from.month} – ${to.day} ${to.month}`
  }
  if (from) return `From ${from.day} ${from.month}`
  if (to) return `Until ${to.day} ${to.month}`
  return ''
}

function matchesSearch(searchTerm, title, extraTerms = []) {
  const q = searchTerm.trim().toLowerCase()
  if (!q) return true
  if (title.toLowerCase().includes(q)) return true
  return extraTerms.some((term) => term.toLowerCase().includes(q))
}

// A non-collapsible section header — used only for "DC date range", which is
// always visible since it's the primary filter.
function FilterGroup({ icon: Icon, title, active, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <h3 className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-foreground">{title}</h3>
        {active ? <span className="size-1.5 shrink-0 rounded-full bg-accent" /> : null}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

// A collapsible accordion section — icon, title, an active-state dot, and a
// "N fields" summary that also serves as the expand/collapse control.
function CollapsibleFilterGroup({ icon: Icon, title, fieldCount, active, open, onToggle, children }) {
  return (
    <div className="space-y-3">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-2 text-left">
        <span className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-foreground">{title}</span>
          {active ? <span className="size-1.5 shrink-0 rounded-full bg-accent" /> : null}
        </span>
        <span className="flex shrink-0 items-center gap-1 text-[0.7rem] text-muted-foreground">
          {fieldCount} field{fieldCount === 1 ? '' : 's'}
          <ChevronDown className={cn('size-3.5 transition-transform duration-200', open ? 'rotate-180' : '')} />
        </span>
      </button>
      {open ? <div className="space-y-3">{children}</div> : null}
    </div>
  )
}

function FilterChip({ label, onClear }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 py-1 pl-2.5 pr-1.5 text-xs font-medium text-accent">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Remove filter: ${label}`}
        className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-accent/70 transition-colors hover:bg-accent/20 hover:text-accent"
      >
        <X className="size-3" />
      </button>
    </span>
  )
}

export default function DcList() {
  const { company } = useOutletContext()
  const companyId = company._id

  const [clients, setClients] = useState([])
  const [trucks, setTrucks] = useState([])
  const [materials, setMaterials] = useState([])
  const [drivers, setDrivers] = useState([])
  const [optionsLoading, setOptionsLoading] = useState(true)

  const [dealers, setDealers] = useState([])
  const [dealersLoading, setDealersLoading] = useState(false)
  const [dealersById, setDealersById] = useState({})
  const [downloadingId, setDownloadingId] = useState(null)
  const [exportingExcel, setExportingExcel] = useState(false)

  const [showFilters, setShowFilters] = useState(true)
  const [filterSearch, setFilterSearch] = useState('')
  const [openGroups, setOpenGroups] = useState(DEFAULT_OPEN_GROUPS)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(null)

  const [page, setPage] = useState(1)
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Consignor/consignee/material/truck/driver names — the list endpoint only
  // returns ids, so resolve them against the same option lists DC creation
  // uses. Also doubles as the filter dropdown options.
  useEffect(() => {
    let cancelled = false
    setOptionsLoading(true)

    Promise.all([
      listClientsApi({ companyId, active: true }),
      listTrucksApi({ companyId, active: true }),
      listMaterialsApi({ companyId, active: true }),
      listDriversApi({ companyId, active: true }),
    ])
      .then(([clientsResponse, trucksResponse, materialsResponse, driversResponse]) => {
        if (cancelled) return
        setClients(clientsResponse ?? [])
        setTrucks(trucksResponse ?? [])
        setMaterials(materialsResponse ?? [])
        setDrivers(driversResponse ?? [])
      })
      .catch((fetchError) => {
        if (cancelled) return
        setError(fetchError.response?.data?.message ?? 'Unable to load filter options.')
      })
      .finally(() => {
        if (!cancelled) setOptionsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [companyId])

  // The dealer filters depend on the selected consignee (same as DC creation).
  useEffect(() => {
    setDealers([])
    if (!filters.consigneeId) return

    let cancelled = false
    setDealersLoading(true)

    listDealersApi({ clientId: filters.consigneeId, active: true })
      .then((response) => {
        if (cancelled) return
        setDealers(response ?? [])
      })
      .catch(() => {
        // Leave dealers empty — the dealer selects below already handle
        // an empty options list.
      })
      .finally(() => {
        if (!cancelled) setDealersLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [filters.consigneeId])

  useEffect(() => {
    const payload = appliedFilters ?? buildFilterPayload(companyId, EMPTY_FILTERS, materials)

    let cancelled = false
    setLoading(true)
    setError(null)

    filterDeliveryChallansApi(payload, { page, limit: PAGE_SIZE })
      .then((response) => {
        if (cancelled) return
        // The endpoint returns a bare array for the requested page (no total
        // or page count), so infer them: a full page means there may be more.
        const list = response ?? []
        setRecords(list)
        setTotal((page - 1) * PAGE_SIZE + list.length)
        setTotalPages(list.length >= PAGE_SIZE ? page + 1 : page)

        // Previous handling for a paginated { data, total, totalPages } response:
        // setRecords(response?.data ?? [])
        // setTotal(response?.total ?? 0)
        // setTotalPages(response?.totalPages ?? 1)
      })
      .catch((fetchError) => {
        if (cancelled) return
        setError(fetchError.response?.data?.message ?? 'Unable to load delivery challans.')
        setRecords([])
        setTotal(0)
        setTotalPages(1)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, page, appliedFilters])

  // The invoice-dealer column only has an id — resolve it against the
  // dealers of every consignee present on this page (accumulated across
  // pages so names already resolved don't flicker back to "—").
  useEffect(() => {
    const consigneeIds = [...new Set(records.map((record) => record.consignment?.consigneeId).filter(Boolean))]
    if (consigneeIds.length === 0) return

    let cancelled = false

    Promise.all(consigneeIds.map((clientId) => listDealersApi({ clientId, active: true }).catch(() => []))).then((results) => {
      if (cancelled) return
      setDealersById((prev) => {
        const next = { ...prev }
        results.flat().forEach((dealer) => {
          next[dealer._id] = dealer
        })
        return next
      })
    })

    return () => {
      cancelled = true
    }
  }, [records])

  async function handleDownloadPdf(record) {
    setDownloadingId(record._id)
    try {
      const blob = await downloadDeliveryChallanPdfApi(record._id)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${record.dcNumber}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (downloadError) {
      setError(downloadError.response?.data?.message ?? 'Unable to generate the PDF for this challan.')
    } finally {
      setDownloadingId(null)
    }
  }

  // Exports every record matching the currently applied filters (not just
  // the current page) — same payload the filter listing itself uses.
  async function handleExportExcel() {
    const payload = appliedFilters ?? buildFilterPayload(companyId, EMPTY_FILTERS, materials)
    setExportingExcel(true)
    try {
      const blob = await exportDeliveryChallansExcelApi(payload)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `delivery-challans-${isoDateDaysAgo(0)}.xlsx`
      link.click()
      URL.revokeObjectURL(url)
    } catch (exportError) {
      setError(exportError.response?.data?.message ?? 'Unable to export delivery challans to Excel.')
    } finally {
      setExportingExcel(false)
    }
  }

  function updateFilter(patch) {
    setFilters((prev) => ({ ...prev, ...patch }))
  }

  function updateMaterialFilterField(fieldName, value) {
    updateFilter({ materialFieldValues: { ...filters.materialFieldValues, [fieldName]: value } })
  }

  function toggleGroup(key) {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function handleApplyFilters() {
    setPage(1)
    setAppliedFilters(buildFilterPayload(companyId, filters, materials))
  }

  function handleResetFilters() {
    setFilters(EMPTY_FILTERS)
    setPage(1)
    setAppliedFilters(null)
  }

  const consignor = clients.find((client) => client._id === filters.consignorId) ?? null
  const consignee = clients.find((client) => client._id === filters.consigneeId) ?? null
  const consignorBranches = (consignor?.branches ?? []).filter((branch) => branch.isActive)
  const consigneeBranches = (consignee?.branches ?? []).filter((branch) => branch.isActive)
  const clientOptions = clients.map((client) => ({ value: client._id, label: `${client.name} (${client.clientCode})` }))
  const dealerOptions = dealers.map((dealer) => ({
    value: dealer._id,
    label: dealer.dealerType === 'COMPANY' ? dealer.dealerName : `${dealer.dealerName}-${dealer.code}`,
  }))
  const filterMaterial = materials.find((item) => item._id === filters.materialId) ?? null

  const activeFilterCount = countActiveFilters(filters)

  function clientLabel(clientId, branchId) {
    const client = clients.find((item) => item._id === clientId)
    if (!client) return '—'
    const branch = (client.branches ?? []).find((item) => item._id === branchId)
    return branch ? `${client.name} (${branch.branchName})` : client.name
  }

  const truckById = (truckId) => trucks.find((truck) => truck._id === truckId) ?? null
  const materialById = (materialId) => materials.find((item) => item._id === materialId) ?? null
  const dealerById = (dealerId) => dealersById[dealerId] ?? null

  // Active-state flags per section, driving the little accent dot next to
  // each group's title.
  const dcDateActive = Boolean(filters.dcDateFrom || filters.dcDateTo)
  const companyDetailsActive = Boolean(
    filters.invoice.trim() || filters.shipmentNumber.trim() || filters.companyFromDate || filters.companyToDate,
  )
  const consignmentActive = Boolean(filters.consignorId || filters.consignorBranchId || filters.consigneeId || filters.consigneeBranchId)
  const dealerDetailsActive = Boolean(filters.invoiceDealerId || filters.shipToDealerId)
  const materialFieldValuesActive = Object.values(filters.materialFieldValues).some((value) => value !== '')
  const materialActive = Boolean(filters.materialId || filters.deliveryCategory || materialFieldValuesActive)
  const truckDetailsActive = Boolean(filters.truckId || filters.driverId)

  const materialFieldCount = 2 + (filterMaterial?.materialSpecificFields?.length ?? 0)

  // Removable chips summarizing every currently-set filter field.
  const chips = []
  if (filters.dcDateFrom || filters.dcDateTo) {
    chips.push({
      key: 'dcDate',
      label: `DC date: ${formatDateRangeChip(filters.dcDateFrom, filters.dcDateTo)}`,
      onClear: () => updateFilter({ dcDateFrom: '', dcDateTo: '' }),
    })
  }
  if (filters.invoice.trim()) {
    chips.push({ key: 'invoice', label: `Invoice: ${filters.invoice.trim()}`, onClear: () => updateFilter({ invoice: '' }) })
  }
  if (filters.shipmentNumber.trim()) {
    chips.push({
      key: 'shipmentNumber',
      label: `Shipment: ${filters.shipmentNumber.trim()}`,
      onClear: () => updateFilter({ shipmentNumber: '' }),
    })
  }
  if (filters.companyFromDate || filters.companyToDate) {
    chips.push({
      key: 'companyDate',
      label: `Company date: ${formatDateRangeChip(filters.companyFromDate, filters.companyToDate)}`,
      onClear: () => updateFilter({ companyFromDate: '', companyToDate: '' }),
    })
  }
  if (filters.consignorId) {
    chips.push({
      key: 'consignor',
      label: `Consignor: ${clientLabel(filters.consignorId, filters.consignorBranchId)}`,
      onClear: () => updateFilter({ consignorId: '', consignorBranchId: '' }),
    })
  }
  if (filters.consigneeId) {
    chips.push({
      key: 'consignee',
      label: `Consignee: ${clientLabel(filters.consigneeId, filters.consigneeBranchId)}`,
      onClear: () => updateFilter({ consigneeId: '', consigneeBranchId: '', invoiceDealerId: '', shipToDealerId: '' }),
    })
  }
  if (filters.invoiceDealerId) {
    const dealer = dealers.find((item) => item._id === filters.invoiceDealerId)
    chips.push({
      key: 'invoiceDealer',
      label: `Invoice dealer: ${dealer?.dealerName ?? '—'}`,
      onClear: () => updateFilter({ invoiceDealerId: '' }),
    })
  }
  if (filters.shipToDealerId) {
    const dealer = dealers.find((item) => item._id === filters.shipToDealerId)
    chips.push({
      key: 'shipToDealer',
      label: `Ship-to dealer: ${dealer?.dealerName ?? '—'}`,
      onClear: () => updateFilter({ shipToDealerId: '' }),
    })
  }
  if (filters.materialId) {
    chips.push({
      key: 'material',
      label: `Material: ${filterMaterial?.material ?? '—'}`,
      onClear: () => updateFilter({ materialId: '', deliveryCategory: '', materialFieldValues: {} }),
    })
  }
  if (filters.deliveryCategory) {
    chips.push({ key: 'deliveryCategory', label: `Category: ${filters.deliveryCategory}`, onClear: () => updateFilter({ deliveryCategory: '' }) })
  }
  Object.entries(filters.materialFieldValues).forEach(([fieldName, value]) => {
    if (value === '') return
    chips.push({ key: `materialField-${fieldName}`, label: `${fieldName}: ${value}`, onClear: () => updateMaterialFilterField(fieldName, '') })
  })
  if (filters.truckId) {
    const truck = trucks.find((item) => item._id === filters.truckId)
    chips.push({ key: 'truck', label: `Truck: ${truck?.truckNumber ?? '—'}`, onClear: () => updateFilter({ truckId: '' }) })
  }
  if (filters.driverId) {
    const driver = drivers.find((item) => item._id === filters.driverId)
    chips.push({ key: 'driver', label: `Driver: ${driver?.name ?? '—'}`, onClear: () => updateFilter({ driverId: '' }) })
  }

  const showDcDateGroup = matchesSearch(filterSearch, 'DC date range', ['from', 'to', 'date'])
  const showCompanyDetailsGroup = matchesSearch(filterSearch, 'Company details', ['invoice', 'shipment number', 'from date', 'to date'])
  const showConsignmentGroup = matchesSearch(filterSearch, 'Consignment', ['consignor', 'consignor branch', 'consignee', 'consignee branch'])
  const showDealerDetailsGroup = matchesSearch(filterSearch, 'Dealer details', ['invoice dealer', 'ship-to dealer'])
  const showMaterialGroup = matchesSearch(filterSearch, 'Material', [
    'delivery category',
    ...(filterMaterial?.materialSpecificFields?.map((field) => field.fieldName) ?? []),
  ])
  const showTruckDetailsGroup = matchesSearch(filterSearch, 'Truck details', ['truck', 'driver'])
  const noGroupsMatchSearch =
    !showDcDateGroup && !showCompanyDetailsGroup && !showConsignmentGroup && !showDealerDetailsGroup && !showMaterialGroup && !showTruckDetailsGroup

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Delivery challans</h2>
          <p className="mt-1 text-sm text-muted-foreground">Delivery challans created for this company.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant={showFilters ? 'default' : 'outline'}
            className={cn(showFilters && 'accent-fill')}
            onClick={() => setShowFilters((value) => !value)}
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {activeFilterCount > 0 ? (
              <span
                className={cn(
                  'inline-flex size-5 items-center justify-center rounded-full text-[0.68rem] font-semibold',
                  showFilters ? 'bg-white/20' : 'bg-accent/15 text-accent',
                )}
              >
                {activeFilterCount}
              </span>
            ) : null}
          </Button>
          <Button asChild className="accent-fill">
            <Link to="new">
              <Plus className="size-4" />
              Create delivery challan
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-5 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <TableShell
            toolbar={
              <>
                <p className="text-xs text-muted-foreground">{total} challan(s)</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={handleExportExcel}
                  disabled={exportingExcel || total === 0}
                >
                  {exportingExcel ? <Loader2 className="size-3.5 animate-spin" /> : <FileSpreadsheet className="size-3.5" />}
                  Export Excel
                </Button>
              </>
            }
          >
            {error ? (
              <p role="alert" className="mx-5 mt-4 rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            ) : null}

            {loading ? (
              <div className="px-5 py-10 text-center">
                <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground/60" />
              </div>
            ) : records.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No delivery challans found"
                description={activeFilterCount > 0 ? 'Try adjusting or resetting the filters.' : 'Create one to see it listed here.'}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                      <th className="px-5 py-3 font-semibold">DC</th>
                      <th className="px-5 py-3 font-semibold">Invoice / shipment</th>
                      <th className="px-5 py-3 font-semibold">Truck / load</th>
                      <th className="px-5 py-3 font-semibold">Advance / rate</th>
                      <th className="px-5 py-3 font-semibold">Dealer (invoice)</th>
                      <th className="px-5 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {records.map((record) => {
                      const material = materialById(record.material?.materialId)
                      const quantityUnit = material?.quantityType ? ` ${material.quantityType}` : ''
                      const dealer = dealerById(record.dealerDetails?.invoiceDealerId)

                      return (
                        <tr key={record._id}>
                          <td className="px-5 py-4">
                            <p className="text-xs text-muted-foreground">{record.dcDate?.slice(0, 10)}</p>
                            <p className="font-medium text-foreground">{record.dcNumber}</p>
                          </td>
                          <td className="px-5 py-4 text-foreground">
                            {record.companyDetails?.invoice || '—'} / {record.companyDetails?.shipmentNumber || '—'}
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-foreground">{truckById(record.truckDetails?.truckId)?.truckNumber ?? '—'}</p>
                            <p className="text-xs text-muted-foreground">
                              {record.material?.loadingQuantity != null ? `${record.material.loadingQuantity}${quantityUnit}` : '—'}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-foreground">₹{record.advance?.totalAdvance ?? 0}</p>
                            <p className="text-xs text-muted-foreground">₹{record.rate?.totalTransportRate ?? 0}</p>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">{dealer?.dealerName ?? '—'}</td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <Link
                                to="new"
                                state={{ editingDc: record }}
                                aria-label={`Edit ${record.dcNumber}`}
                                title="Edit"
                                className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
                              >
                                <Pencil className="size-4" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDownloadPdf(record)}
                                disabled={downloadingId === record._id}
                                aria-label={`Download PDF for ${record.dcNumber}`}
                                title="Download PDF"
                                className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent disabled:pointer-events-none disabled:opacity-50"
                              >
                                {downloadingId === record._id ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <FileDown className="size-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && totalPages > 1 ? (
              <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-3">
                <p className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
                  Previous
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>
                  Next
                </Button>
              </div>
            ) : null}
          </TableShell>
        </div>

        {showFilters ? (
          <div className="w-full shrink-0 lg:sticky lg:top-4 lg:w-[23rem] xl:w-96">
            <div className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl border border-border/70 bg-card/92 shadow-card backdrop-blur-xl">
              <div className="flex w-full shrink-0 flex-col gap-3.5 border-b border-border bg-card/95 px-5 py-4 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="size-4 text-muted-foreground" />
                    <span className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">Filters</span>
                    {activeFilterCount > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-accent/15 px-2 py-0.5 text-[0.68rem] font-semibold text-accent">
                        {activeFilterCount} active
                      </span>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    aria-label="Hide filters"
                    title="Hide filters"
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2.5">
                  <Button type="button" variant="outline" className="flex-1" onClick={handleResetFilters} disabled={activeFilterCount === 0}>
                    <RotateCcw className="size-4" />
                    Reset all
                  </Button>
                  <Button type="button" className="accent-fill flex-1" onClick={handleApplyFilters}>
                    Apply filters
                  </Button>
                </div>
              </div>

              <div className="scroll-panel min-h-0 flex-1 space-y-5 overflow-y-auto px-5 pt-5 pb-[20px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={filterSearch}
                    onChange={(event) => setFilterSearch(event.target.value)}
                    placeholder="Search filters…"
                    className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                {chips.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {chips.map((chip) => (
                      <FilterChip key={chip.key} label={chip.label} onClear={chip.onClear} />
                    ))}
                  </div>
                ) : null}

                <div className="space-y-5">
                  {showDcDateGroup ? (
                    <FilterGroup icon={CalendarRange} title="DC date range" active={dcDateActive}>
                      <div className="grid grid-cols-2 gap-3">
                        <TextField
                          label="From"
                          type="date"
                          value={filters.dcDateFrom}
                          onChange={(event) => updateFilter({ dcDateFrom: event.target.value })}
                          inputClassName="w-full px-3"
                        />
                        <TextField
                          label="To"
                          type="date"
                          value={filters.dcDateTo}
                          onChange={(event) => updateFilter({ dcDateTo: event.target.value })}
                          inputClassName="w-full px-3"
                        />
                      </div>
                    </FilterGroup>
                  ) : null}

                  {showMaterialGroup ? (
                    <CollapsibleFilterGroup
                      icon={Package}
                      title="Material"
                      fieldCount={materialFieldCount}
                      active={materialActive}
                      open={openGroups.material}
                      onToggle={() => toggleGroup('material')}
                    >
                      <SelectField
                        label="Material"
                        value={filters.materialId}
                        onChange={(event) => updateFilter({ materialId: event.target.value, deliveryCategory: '', materialFieldValues: {} })}
                        options={materials.map((item) => ({ value: item._id, label: item.material }))}
                        placeholder={optionsLoading ? 'Loading materials…' : 'Any material'}
                        disabled={optionsLoading}
                      />
                      <SelectField
                        label="Delivery category"
                        value={filters.deliveryCategory}
                        onChange={(event) => updateFilter({ deliveryCategory: event.target.value })}
                        options={(filterMaterial?.category ?? []).map((category) => ({ value: category, label: category }))}
                        placeholder={filterMaterial ? 'Any category' : 'Select a material first'}
                        disabled={!filterMaterial}
                      />
                      {(filterMaterial?.materialSpecificFields ?? []).map((field) =>
                        field.fieldType === 'dropdown' ? (
                          <SelectField
                            key={field.fieldName}
                            label={field.fieldName}
                            value={filters.materialFieldValues[field.fieldName] ?? ''}
                            onChange={(event) => updateMaterialFilterField(field.fieldName, event.target.value)}
                            options={(field.values ?? []).map((value) => ({ value, label: value }))}
                            placeholder="Any"
                          />
                        ) : (
                          <TextField
                            key={field.fieldName}
                            label={field.fieldName}
                            type={field.fieldType === 'number' ? 'number' : 'text'}
                            value={filters.materialFieldValues[field.fieldName] ?? ''}
                            onChange={(event) => updateMaterialFilterField(field.fieldName, event.target.value)}
                          />
                        ),
                      )}
                    </CollapsibleFilterGroup>
                  ) : null}

                  {showConsignmentGroup ? (
                    <CollapsibleFilterGroup
                      icon={Route}
                      title="Consignment"
                      fieldCount={4}
                      active={consignmentActive}
                      open={openGroups.consignment}
                      onToggle={() => toggleGroup('consignment')}
                    >
                      <SelectField
                        label="Consignor"
                        value={filters.consignorId}
                        onChange={(event) => updateFilter({ consignorId: event.target.value, consignorBranchId: '' })}
                        options={clientOptions}
                        placeholder={optionsLoading ? 'Loading clients…' : 'Any consignor'}
                        disabled={optionsLoading}
                      />
                      <SelectField
                        label="Consignor branch"
                        value={filters.consignorBranchId}
                        onChange={(event) => updateFilter({ consignorBranchId: event.target.value })}
                        options={consignorBranches.map((branch) => ({ value: branch._id, label: branch.branchName }))}
                        placeholder={filters.consignorId ? 'Any branch' : 'Select a consignor first'}
                        disabled={!filters.consignorId}
                      />
                      <SelectField
                        label="Consignee"
                        value={filters.consigneeId}
                        onChange={(event) =>
                          updateFilter({ consigneeId: event.target.value, consigneeBranchId: '', invoiceDealerId: '', shipToDealerId: '' })
                        }
                        options={clientOptions}
                        placeholder={optionsLoading ? 'Loading clients…' : 'Any consignee'}
                        disabled={optionsLoading}
                      />
                      <SelectField
                        label="Consignee branch"
                        value={filters.consigneeBranchId}
                        onChange={(event) => updateFilter({ consigneeBranchId: event.target.value })}
                        options={consigneeBranches.map((branch) => ({ value: branch._id, label: branch.branchName }))}
                        placeholder={filters.consigneeId ? 'Any branch' : 'Select a consignee first'}
                        disabled={!filters.consigneeId}
                      />
                    </CollapsibleFilterGroup>
                  ) : null}

                  {showDealerDetailsGroup ? (
                    <CollapsibleFilterGroup
                      icon={Users}
                      title="Dealer details"
                      fieldCount={2}
                      active={dealerDetailsActive}
                      open={openGroups.dealerDetails}
                      onToggle={() => toggleGroup('dealerDetails')}
                    >
                      <p className="text-[0.7rem] text-muted-foreground">Depends on the consignee above.</p>
                      <SelectField
                        label="Invoice dealer"
                        value={filters.invoiceDealerId}
                        onChange={(event) => updateFilter({ invoiceDealerId: event.target.value })}
                        options={dealerOptions}
                        placeholder={!filters.consigneeId ? 'Select a consignee first' : dealersLoading ? 'Loading dealers…' : 'Any dealer'}
                        disabled={!filters.consigneeId || dealersLoading}
                      />
                      <SelectField
                        label="Ship-to dealer"
                        value={filters.shipToDealerId}
                        onChange={(event) => updateFilter({ shipToDealerId: event.target.value })}
                        options={dealerOptions}
                        placeholder={!filters.consigneeId ? 'Select a consignee first' : dealersLoading ? 'Loading dealers…' : 'Any dealer'}
                        disabled={!filters.consigneeId || dealersLoading}
                      />
                    </CollapsibleFilterGroup>
                  ) : null}

                  {showTruckDetailsGroup ? (
                    <CollapsibleFilterGroup
                      icon={TruckIcon}
                      title="Truck details"
                      fieldCount={2}
                      active={truckDetailsActive}
                      open={openGroups.truckDetails}
                      onToggle={() => toggleGroup('truckDetails')}
                    >
                      <SelectField
                        label="Truck"
                        value={filters.truckId}
                        onChange={(event) => updateFilter({ truckId: event.target.value })}
                        options={trucks.map((item) => ({ value: item._id, label: item.truckNumber }))}
                        placeholder={optionsLoading ? 'Loading trucks…' : 'Any truck'}
                        disabled={optionsLoading}
                      />
                      <SelectField
                        label="Driver"
                        value={filters.driverId}
                        onChange={(event) => updateFilter({ driverId: event.target.value })}
                        options={drivers.map((driver) => ({ value: driver._id, label: `${driver.name} (${driver.mobileNumber})` }))}
                        placeholder={optionsLoading ? 'Loading drivers…' : 'Any driver'}
                        disabled={optionsLoading}
                      />
                    </CollapsibleFilterGroup>
                  ) : null}

                  {showCompanyDetailsGroup ? (
                    <CollapsibleFilterGroup
                      icon={Building2}
                      title="Company details"
                      fieldCount={4}
                      active={companyDetailsActive}
                      open={openGroups.companyDetails}
                      onToggle={() => toggleGroup('companyDetails')}
                    >
                      <TextField label="Invoice" value={filters.invoice} onChange={(event) => updateFilter({ invoice: event.target.value })} />
                      <TextField
                        label="Shipment number"
                        value={filters.shipmentNumber}
                        onChange={(event) => updateFilter({ shipmentNumber: event.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <TextField
                          label="From date"
                          type="date"
                          value={filters.companyFromDate}
                          onChange={(event) => updateFilter({ companyFromDate: event.target.value })}
                          inputClassName="w-full px-3"
                        />
                        <TextField
                          label="To date"
                          type="date"
                          value={filters.companyToDate}
                          onChange={(event) => updateFilter({ companyToDate: event.target.value })}
                          inputClassName="w-full px-3"
                        />
                      </div>
                    </CollapsibleFilterGroup>
                  ) : null}

                  {noGroupsMatchSearch ? <p className="pt-1 text-xs text-muted-foreground">No filters match “{filterSearch}”.</p> : null}
                </div>

                <div className="border-t border-border pt-5">
                  <CheckboxField label="Active only" checked={filters.activeOnly} onChange={(checked) => updateFilter({ activeOnly: checked })} />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
