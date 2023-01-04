// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../../util/Heapified.sol";

library ShareCalculator {
    function calculateQMFShare(
        uint16 maxDemandVolume,
        uint256 totalDemand,
        uint256[] memory numberOfDemands,
        uint256 cumulativeCapacity
    ) external pure returns (uint16 _share, uint256 _amount) {
        /*
         * This function calculates the maximum share that can be distributed
         * in the current epoch to the users. In addition to that,it also
         * calculates the total distribution amount for the calculated maximum
         * share.
         *
         * These two values mentioned above are returned in a tuple as (share, amount).
         *
         * Note: only called by updateState(), hence, assumes that the state is updated
         */

        uint256 cumulativeNODSum = 0;
        uint256 cumulativeTDVSum = 0;

        uint256 necessaryCapacity = 0; // necessary capacity to meet demands at ith volume
        uint256 sufficientCapacity = 0; // the latest necessaryCapacity that can be distributed

        for (uint16 i = 1; i <= maxDemandVolume; i++) {
            // always point to the previous necessaryCapacity
            sufficientCapacity = necessaryCapacity;

            // use the previous values of cumulativeNODSum and cumulativeTDVSum
            necessaryCapacity =
                cumulativeTDVSum +
                i *
                (totalDemand - cumulativeNODSum);

            uint256 currentNOD = numberOfDemands[i];

            // then calculate the new values
            cumulativeNODSum += currentNOD;
            cumulativeTDVSum += currentNOD * i;

            if (necessaryCapacity > cumulativeCapacity) {
                // necessaryCapacity for this volume is larger than the cumulativeCapacity
                // so, sufficientCapacity stores the maximum amount that can be distributed
                return (i - 1, sufficientCapacity);
            }
        }

        // cumulative capacity was enough for all demands
        return (maxDemandVolume, necessaryCapacity);
    }

    function calculateSMFShare(
        uint16[] memory epochDemands,
        uint256 cumulativeCapacity
    ) external returns (uint16 _share, uint256 _amount) {
        Heapified heapified = new Heapified(epochDemands);
        uint16[] memory heap = heapified.getHeap();
        uint256 simulatedCapacity = cumulativeCapacity;
        uint16 simulatedShare = 0;
        uint16 result = 0;
        while (heap.length > 0 && simulatedCapacity >= heap.length) {
            while(heap[0] < simulatedShare) {
                simulatedCapacity -= heap[0];
                heapified.extractMin();
            }
            simulatedCapacity -= simulatedShare * heap.length;
            for (uint256 i = 0; i < heap.length; i++) {
                heap[i] -= simulatedShare;
            }
            result = simulatedShare;
            simulatedShare = uint16(simulatedCapacity / heap.length);
        }
        return (result, cumulativeCapacity - simulatedCapacity);
    }
}
