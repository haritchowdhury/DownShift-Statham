function ProductImageFallback({ label = 'Product image coming soon', large = false }) {
  return (
    <div className="relative flex h-full min-h-full w-full items-center justify-center overflow-hidden bg-palette-lighter">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-palette-lighter to-palette-light opacity-90" />
      <div className="absolute -left-20 top-8 h-40 w-40 rounded-full bg-white opacity-50 animate-pulse" />
      <div className="absolute -right-16 bottom-6 h-32 w-32 rounded-full bg-palette-light opacity-60 animate-pulse" />
      <div className="relative flex flex-col items-center px-8 text-center font-primary">
        <div className={`${large ? 'h-24 w-24' : 'h-16 w-16'} relative mb-4 rounded-md border-2 border-palette-primary bg-white shadow-md`}>
          <div className="absolute left-3 right-3 top-4 h-2 rounded-full bg-palette-light" />
          <div className="absolute left-3 right-6 top-8 h-2 rounded-full bg-palette-light" />
          <div className="absolute bottom-3 left-3 right-3 h-5 rounded-sm bg-palette-primary opacity-80" />
        </div>
        <p className={`${large ? 'text-base' : 'text-sm'} font-semibold text-palette-primary`}>
          {label}
        </p>
      </div>
    </div>
  )
}

export default ProductImageFallback
