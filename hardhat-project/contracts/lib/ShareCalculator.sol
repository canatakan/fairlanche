// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./Heapified.sol";

library ShareCalculator {
    /*
     * Share calculation functions calculate the maximum share that can be distributed
     * in the current epoch to the users. In addition to that, they also
     * calculate the total distribution amount for the calculated maximum
     * share.
     *
     * These two values mentioned above are returned in a tuple as (share, amount).
     *
     * Note: They should be called after the updateState() call.
     */

    function calculateQMFShare(
        uint16 maxDemandVolume,
        uint256 totalDemand,
        uint256[] calldata numberOfDemands,
        uint256 cumulativeCapacity
    ) external pure returns (uint16 _share, uint256 _amount) {
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
        uint16 maxDemandVolume,
        uint16[] calldata epochDemands,
        uint256 cumulativeCapacity
    ) external pure returns (uint16 _share, uint256 _amount) {
        if (epochDemands.length == 0) {
            return (maxDemandVolume, 0);
        }

        Heapified.Heap memory heap = Heapified.heapify(epochDemands);

        uint256 simulatedCapacity = cumulativeCapacity;
        uint256 heapSize = heap.heap.length;
        uint16 simulatedShare = uint16(simulatedCapacity / heapSize);
        uint16 result = 0;

        while (heapSize > 0 && simulatedCapacity >= heapSize) {
            while (heap.heap[0] <= simulatedShare) {
                simulatedCapacity -= heap.heap[0];
                (heap, ) = Heapified.extractMin(heap);
                heapSize--;
                if (heapSize == 0) {
                    return (
                        maxDemandVolume,
                        cumulativeCapacity - simulatedCapacity
                    );
                }
            }

            simulatedCapacity -= simulatedShare * heapSize;

            for (uint256 i = 0; i < heapSize; i++)
                heap.heap[i] -= simulatedShare;

            result += simulatedShare;
            simulatedShare = uint16(simulatedCapacity / heapSize);
        }
        return (result, cumulativeCapacity - simulatedCapacity);
    }

    function calculateEqualShare(
        uint16 maxDemandVolume,
        uint256 totalDemand,
        uint256 cumulativeCapacity
    ) external pure returns (uint16 _share, uint256 _amount) {
        if (totalDemand == 0) {
            return (maxDemandVolume, 0);
        }
        uint256 share = cumulativeCapacity / totalDemand;
        if (share > maxDemandVolume) {
            return (maxDemandVolume, maxDemandVolume * totalDemand);
        }
        return (uint16(share), share * totalDemand);
    }
}
