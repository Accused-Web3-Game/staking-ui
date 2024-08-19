'use client';

import {
  ConnectButton,
  TransactionButton,
  useActiveAccount,
  useReadContract,
} from 'thirdweb/react';
import { approve, balanceOf } from 'thirdweb/extensions/erc20';
import {
  REWARD_TOKEN_CONTRACT,
  STAKE_TOKEN_CONTRACT,
  STAKING_CONTRACT,
} from '../utils/contracts';
import { prepareContractCall, toEther, toWei } from 'thirdweb';
import { useEffect, useReducer } from 'react';
import { client } from '@/app/client';
import { chain } from '@/app/chain';
import { reducer, initialState } from './reducer';

export const StakeToken = () => {
  const account = useActiveAccount();

  const [
    { stakeAmount, withdrawAmount, stakingState, isStaking, isWithdrawing },
    dispatch,
  ] = useReducer(reducer, initialState);

  const handleStakeAmountChange = (amount: number) => {
    dispatch({ type: 'SET_STAKE_AMOUNT', payload: amount });
  };

  const handleWithdrawAmountChange = (amount: number) => {
    dispatch({ type: 'SET_WITHDRAW_AMOUNT', payload: amount });
  };

  const handleStakingStateChange = (state: 'init' | 'approved') => {
    dispatch({ type: 'SET_STAKING_STATE', payload: state });
  };

  const handleIsStakingChange = (isStaking: boolean) => {
    dispatch({ type: 'SET_IS_STAKING', payload: isStaking });
  };

  const handleIsWithdrawingChange = (isWithdrawing: boolean) => {
    dispatch({ type: 'SET_IS_WITHDRAWING', payload: isWithdrawing });
  };

  const {
    data: stakingTokenBalance,
    isLoading: loadingStakeTokenBalance,
    refetch: refetchStakingTokenBalance,
  } = useReadContract(balanceOf, {
    contract: STAKE_TOKEN_CONTRACT,
    address: account?.address || '',
    queryOptions: {
      enabled: !!account,
    },
  });

  const {
    data: rewardTokenBalance,
    isLoading: loadingRewardTokenBalance,
    refetch: refetchRewardTokenBalance,
  } = useReadContract(balanceOf, {
    contract: REWARD_TOKEN_CONTRACT,
    address: account?.address || '',
    queryOptions: {
      enabled: !!account,
    },
  });

  const { data: stakeInfo, refetch: refetchStakeInfo } = useReadContract({
    contract: STAKING_CONTRACT,
    method: 'getStakeInfo',
    params: [account?.address as string],
    queryOptions: {
      enabled: !!account,
    },
  });

  const { data: stakingTokenSymbol, refetch: refetchStakingTokenSymbol } =
    useReadContract({
      contract: STAKE_TOKEN_CONTRACT,
      method: 'function symbol() view returns (string)',
      params: [],
    });

  const { data: rewardTokenSymbol, refetch: refetchRewardTokenSymbol } =
    useReadContract({
      contract: REWARD_TOKEN_CONTRACT,
      method: 'function symbol() view returns (string)',
      params: [],
    });

  function truncate(value: string | number, decimalPlaces: number): number {
    const numericValue: number = Number(value);
    if (isNaN(numericValue)) {
      throw new Error(
        'Invalid input: value must be a convertible to a number.',
      );
    }
    const factor: number = Math.pow(10, decimalPlaces);
    return Math.trunc(numericValue * factor) / factor;
  }

  useEffect(() => {
    setInterval(() => {
      refetchData();
    }, 10000);
  }, []);

  const refetchData = () => {
    refetchStakeInfo();
    refetchStakingTokenSymbol();
    refetchRewardTokenSymbol();
  };

  return (
    <div>
      {account && (
        <div
          style={{
            backgroundColor: '#151515',
            padding: '40px',
            borderRadius: '10px',
          }}
        >
          <ConnectButton client={client} chain={chain} />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              margin: '20px',
            }}
          >
            {loadingStakeTokenBalance ? (
              <p>Loading...</p>
            ) : (
              <p
                style={{
                  padding: '10px',
                  borderRadius: '5px',
                  marginRight: '5px',
                }}
              >
                Available to stake: {truncate(toEther(stakingTokenBalance!), 2)}{' '}
                {stakingTokenSymbol}
              </p>
            )}
            {loadingRewardTokenBalance ? (
              <p>Loading...</p>
            ) : (
              <p
                style={{
                  padding: '10px',
                  borderRadius: '5px',
                }}
              >
                Claimed reward: {truncate(toEther(rewardTokenBalance!), 2)}{' '}
                {rewardTokenSymbol}
              </p>
            )}
          </div>

          {stakeInfo && (
            <>
              <div>
                <button
                  style={{
                    margin: '5px',
                    padding: '10px',
                    backgroundColor: '#efefef',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#333',
                    fontSize: '1rem',
                    width: '45%',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleIsStakingChange(true)}
                >
                  Stake
                </button>
                <button
                  style={{
                    margin: '5px',
                    padding: '10px',
                    backgroundColor: '#efefef',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#333',
                    fontSize: '1rem',
                    width: '45%',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleIsWithdrawingChange(true)}
                >
                  Withdraw
                </button>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginTop: '20px',
                }}
              >
                <p>
                  Current Staked:{' '}
                  {truncate(toEther(stakeInfo[0]).toString(), 2)}{' '}
                  {stakingTokenSymbol}
                </p>
                <p>
                  Current Rewards:{' '}
                  {truncate(toEther(stakeInfo[1]).toString(), 2)}{' '}
                  {rewardTokenSymbol}
                </p>
                <TransactionButton
                  transaction={() =>
                    prepareContractCall({
                      contract: STAKING_CONTRACT,
                      method: 'claimRewards',
                    })
                  }
                  onTransactionConfirmed={() => {
                    refetchData();
                    refetchStakingTokenBalance();
                    refetchRewardTokenBalance();
                  }}
                >
                  Claim Rewards
                </TransactionButton>
              </div>
            </>
          )}
          {isStaking && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: '#151515',
                  padding: '40px',
                  borderRadius: '10px',
                  minWidth: '300px',
                }}
              >
                <button
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    padding: '5px',
                    margin: '5px',
                    fontSize: '0.5rem',
                  }}
                  onClick={() => {
                    handleIsStakingChange(false);
                    handleStakeAmountChange(0);
                    handleStakingStateChange('init');
                  }}
                >
                  Close
                </button>
                <h3>Stake</h3>
                <p>Balance: {toEther(stakingTokenBalance!)}</p>
                {stakingState === 'init' ? (
                  <>
                    <input
                      type="number"
                      placeholder="0.0"
                      value={stakeAmount}
                      onChange={e =>
                        handleStakeAmountChange(parseFloat(e.target.value))
                      }
                      style={{
                        margin: '10px',
                        padding: '5px',
                        borderRadius: '5px',
                        border: '1px solid #333',
                        width: '100%',
                      }}
                    />
                    <TransactionButton
                      transaction={() =>
                        approve({
                          contract: STAKE_TOKEN_CONTRACT,
                          spender: STAKING_CONTRACT.address,
                          amount: stakeAmount,
                        })
                      }
                      onTransactionConfirmed={() =>
                        handleStakingStateChange('approved')
                      }
                      style={{
                        width: '100%',
                        margin: '10px 0',
                      }}
                    >
                      Set Approval
                    </TransactionButton>
                  </>
                ) : (
                  <>
                    <h3 style={{ margin: '10px 0' }}>{stakeAmount}</h3>
                    <TransactionButton
                      transaction={() =>
                        prepareContractCall({
                          contract: STAKING_CONTRACT,
                          method: 'stake',
                          params: [toWei(stakeAmount.toString())],
                        })
                      }
                      onTransactionConfirmed={() => {
                        handleStakeAmountChange(0);
                        handleStakingStateChange('init');
                        refetchData();
                        refetchStakingTokenBalance();
                        handleIsStakingChange(false);
                      }}
                    >
                      Stake
                    </TransactionButton>
                  </>
                )}
              </div>
            </div>
          )}
          {isWithdrawing && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: '#151515',
                  padding: '40px',
                  borderRadius: '10px',
                  minWidth: '300px',
                }}
              >
                <button
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    padding: '5px',
                    margin: '5px',
                    fontSize: '0.5rem',
                  }}
                  onClick={() => {
                    handleIsWithdrawingChange(false);
                  }}
                >
                  Close
                </button>
                <h3>Withraw</h3>
                <input
                  type="number"
                  placeholder="0.0"
                  value={withdrawAmount}
                  onChange={e =>
                    handleWithdrawAmountChange(parseFloat(e.target.value))
                  }
                  style={{
                    margin: '10px',
                    padding: '5px',
                    borderRadius: '5px',
                    border: '1px solid #333',
                    width: '100%',
                  }}
                />
                <TransactionButton
                  transaction={() =>
                    prepareContractCall({
                      contract: STAKING_CONTRACT,
                      method: 'withdraw',
                      params: [toWei(withdrawAmount.toString())],
                    })
                  }
                  onTransactionConfirmed={() => {
                    handleWithdrawAmountChange(0);
                    refetchData();
                    refetchStakingTokenBalance();
                    handleIsWithdrawingChange(false);
                  }}
                  style={{
                    width: '100%',
                    margin: '10px 0',
                  }}
                >
                  Withdraw
                </TransactionButton>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
