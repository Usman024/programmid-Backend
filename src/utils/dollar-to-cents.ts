export default function dollarToCents(amount: number) {
  if (typeof amount !== 'string' && typeof amount !== 'number') {
    throw new Error('Amount passed must be of type String or Number.')
  }

  //@ts-ignore
  return Math.round(100 * parseFloat(typeof amount === 'string' ? amount.replace(/[$,]/g, '') : amount))
}