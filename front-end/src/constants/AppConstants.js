import { pEqualERC20ABI } from '../constants/PEqualERC20Distributor';    
import { pEqualERC1155ABI } from '../constants/PEqualERC1155Distributor';
import { pEqualNativeABI } from '../constants/PEqualNativeDistributor';
import { equalERC20ABI } from '../constants/EqualERC20Distributor';
import { equalERC1155ABI } from '../constants/EqualERC1155Distributor';
import { equalNativeABI } from '../constants/EqualNativeDistributor';

export const CONTRACT_TYPES = ['ERC20', 'ERC1155', 'Native'];
export const ACCESS_TYPES = ['Public', 'Permissioned'];
export const SELECTED_ABI = {
  ERC20: {
    Public: equalERC20ABI,
    Permissioned: pEqualERC20ABI
  },

  ERC1155: {
    Public: equalERC1155ABI,
    Permissioned: pEqualERC1155ABI
  },

  Native: {
    Public: equalNativeABI,
    Permissioned: pEqualNativeABI
  }
};
