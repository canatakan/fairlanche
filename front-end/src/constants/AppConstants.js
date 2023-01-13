import { abi } from '../constants';
export const CONTRACT_TYPES = ['ERC20', 'ERC1155', 'Native'];
export const ACCESS_TYPES = ['Public', 'Permissioned'];
export const SELECTED_ABI = {
  ERC20: {
    Public: abi,
    Permissioned: abi
  },

  ERC1155: {
    Public: abi,
    Permissioned: abi
  },

  Native: {
    Public: abi,
    Permissioned: abi
  }
};
