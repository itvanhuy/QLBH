import { ORDER_STATUS, TABLE_STATUS, PAYMENT_STATUS, PRODUCT_STATUS, RESERVATION_STATUS } from '../../utils/constants'

export function OrderStatusBadge({ status }) {
  const cfg = ORDER_STATUS[status] || { label: status, color: 'badge-gray' }
  return <span className={cfg.color}>{cfg.label}</span>
}

export function TableStatusBadge({ status }) {
  const cfg = TABLE_STATUS[status] || { label: status, color: 'badge-gray' }
  return <span className={cfg.color}>{cfg.label}</span>
}

export function PaymentStatusBadge({ status }) {
  const cfg = PAYMENT_STATUS[status] || { label: status, color: 'badge-gray' }
  return <span className={cfg.color}>{cfg.label}</span>
}

export function ProductStatusBadge({ status }) {
  const cfg = PRODUCT_STATUS[status] || { label: status, color: 'badge-gray' }
  return <span className={cfg.color}>{cfg.label}</span>
}

export function ReservationStatusBadge({ status }) {
  const cfg = RESERVATION_STATUS[status] || { label: status, color: 'badge-gray' }
  return <span className={cfg.color}>{cfg.label}</span>
}
