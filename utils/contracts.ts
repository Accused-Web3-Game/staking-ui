import { chain } from '@/app/chain';
import { client } from '@/app/client';
import { getContract } from 'thirdweb';
import { STAKING_CONTRACT_ABI } from './stakingContractABI';

// Replace <contract_address> with the contract address of your contract
const stakeTokenContractAddress = '0x719058944974A4825a5689Bb9f9A73B445730959';
const rewardTokenContractAddress = '0x5141A4cEa1e24736426F7aeCC61AcC509119072b';
const stakingContractAddress = '0xcc88DBD545400a958dac78eb82312cb742CB4E36';

export const STAKE_TOKEN_CONTRACT = getContract({
  client: client,
  chain: chain,
  address: stakeTokenContractAddress,
});

export const REWARD_TOKEN_CONTRACT = getContract({
  client: client,
  chain: chain,
  address: rewardTokenContractAddress,
});

export const STAKING_CONTRACT = getContract({
  client: client,
  chain: chain,
  address: stakingContractAddress,
  abi: STAKING_CONTRACT_ABI,
});
