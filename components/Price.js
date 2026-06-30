function Price({ amount }) {
  if (amount === null) return <span>Price unavailable</span>

  return (
    <>
      $<span className="text-lg">{Number(amount).toFixed(2)}</span>
    </>
  )
}

export default Price
