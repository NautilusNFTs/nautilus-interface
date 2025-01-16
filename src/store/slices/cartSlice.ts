import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  tokenId: string;
  contractId: string;
  price: string;
  seller: string;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => 
        item.tokenId === action.payload.tokenId && 
        item.contractId === action.payload.contractId
      );
      
      if (!existingItem) {
        state.items.push(action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<{ tokenId: string, contractId: string }>) => {
      state.items = state.items.filter(item => 
        !(item.tokenId === action.payload.tokenId && item.contractId === action.payload.contractId)
      );
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;

export const handleCartIconClick = (item: CartItem) => (dispatch: any) => {
  dispatch(addToCart(item));
};

export default cartSlice.reducer;
