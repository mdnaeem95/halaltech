import React from 'react'

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="marketplace-layout">
      {/* Add any marketplace-specific header/navigation here if needed */}
      {children}
    </div>
  )
}