import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type TimeFilter = '24h' | '7d' | 'all';

export interface UserState {
  timeFilter: TimeFilter;
}

// Get the initial state from localStorage if available
const getInitialState = (): UserState => {
  try {
    const persistedState = localStorage.getItem('persist:user');
    if (persistedState) {
      const { timeFilter } = JSON.parse(persistedState);
      // Remove quotes from the stored string
      const parsedTimeFilter = JSON.parse(timeFilter) as TimeFilter;
      if (parsedTimeFilter === '24h' || parsedTimeFilter === '7d' || parsedTimeFilter === 'all') {
        return { timeFilter: parsedTimeFilter };
      }
    }
  } catch (error) {
    console.error('Error reading persisted state:', error);
  }
  // Always default to '24h' if no valid persisted state is found
  return { timeFilter: '24h' };
};

const userSlice = createSlice({
  name: 'user',
  initialState: { timeFilter: '24h' as '24h' | '7d' | 'all' },
  reducers: {
    setTimeFilter: (state, action: PayloadAction<TimeFilter>) => {
      state.timeFilter = action.payload;
      // Immediately persist the change
      localStorage.setItem('persist:user', JSON.stringify({
        timeFilter: JSON.stringify(action.payload)
      }));
    },
  },
});

export const { setTimeFilter } = userSlice.actions;
export default userSlice.reducer; 