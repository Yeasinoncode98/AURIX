import { createContext, useContext, useReducer } from 'react'

const CartContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const exists = state.find(i => i.id === action.product.id)
      if (exists) {
        return state.map(i =>
          i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i
        )
      }
      return [...state, { ...action.product, qty: 1 }]
    }
    case 'REMOVE':
      return state.filter(i => i.id !== action.id)
    case 'INC':
      return state.map(i => i.id === action.id ? { ...i, qty: i.qty + 1 } : i)
    case 'DEC':
      return state.map(i =>
        i.id === action.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i
      )
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [])

  const add    = (product) => dispatch({ type: 'ADD',    product })
  const remove = (id)      => dispatch({ type: 'REMOVE', id })
  const inc    = (id)      => dispatch({ type: 'INC',    id })
  const dec    = (id)      => dispatch({ type: 'DEC',    id })
  const clear  = ()        => dispatch({ type: 'CLEAR' })

  const totalQty    = items.reduce((s, i) => s + i.qty, 0)
  const totalAmount = items.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <CartContext.Provider value={{ items, add, remove, inc, dec, clear, totalQty, totalAmount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
