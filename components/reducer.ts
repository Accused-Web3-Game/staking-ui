interface State {
  stakeAmount: number;
  withdrawAmount: number;
  stakingState: 'init' | 'approved';
  isStaking: boolean;
  isWithdrawing: boolean;
}

type Action =
  | { type: 'SET_STAKE_AMOUNT'; payload: number }
  | { type: 'SET_WITHDRAW_AMOUNT'; payload: number }
  | { type: 'SET_STAKING_STATE'; payload: 'init' | 'approved' }
  | { type: 'SET_IS_STAKING'; payload: boolean }
  | { type: 'SET_IS_WITHDRAWING'; payload: boolean };

export const initialState: State = {
  stakeAmount: 0,
  withdrawAmount: 0,
  stakingState: 'init',
  isStaking: false,
  isWithdrawing: false,
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_STAKE_AMOUNT':
      return { ...state, stakeAmount: action.payload };
    case 'SET_WITHDRAW_AMOUNT':
      return { ...state, withdrawAmount: action.payload };
    case 'SET_STAKING_STATE':
      return { ...state, stakingState: action.payload };
    case 'SET_IS_STAKING':
      return { ...state, isStaking: action.payload };
    case 'SET_IS_WITHDRAWING':
      return { ...state, isWithdrawing: action.payload };
    default:
      return state;
  }
};
