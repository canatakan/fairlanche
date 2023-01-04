// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

library Heapified {
    struct Heap {
        uint16[] heap;
    }

    function heapify(Heap memory self, uint16[] memory arr) public pure {
        self.heap = arr;
        for (uint256 i = self.heap.length / 2; i > 0; i--) {
            heapifyDown(self, i);
        }
    }

    function heapifyDown(Heap memory self, uint256 i) public pure {
        uint256 left = 2 * i;
        uint256 right = 2 * i + 1;
        uint256 smallest = i;
        if (
            left <= self.heap.length &&
            self.heap[left - 1] < self.heap[smallest - 1]
        ) {
            smallest = left;
        }
        if (
            right <= self.heap.length &&
            self.heap[right - 1] < self.heap[smallest - 1]
        ) {
            smallest = right;
        }
        if (smallest != i) {
            uint16 temp = self.heap[i - 1];
            self.heap[i - 1] = self.heap[smallest - 1];
            self.heap[smallest - 1] = temp;
            heapifyDown(self, smallest);
        }
    }

    function heapifyUp(Heap memory self, uint256 i) public pure {
        uint256 parent = i / 2;
        if (parent > 0 && self.heap[parent - 1] > self.heap[i - 1]) {
            uint16 temp = self.heap[i - 1];
            self.heap[i - 1] = self.heap[parent - 1];
            self.heap[parent - 1] = temp;
            heapifyUp(self, parent);
        }
    }

    function insert(Heap memory self, uint16 value) public pure {
        self.heap = toUint16Array(abi.encodePacked(self.heap, value));
        heapifyUp(self, self.heap.length);
    }

    function toUint16Array(
        bytes memory b
    ) public pure returns (uint16[] memory) {
        uint16[] memory arr = new uint16[](b.length / 2);
        for (uint256 i = 0; i < b.length / 2; i++) {
            arr[i] =
                uint16(uint8(b[i * 2])) +
                (uint16(uint8(b[i * 2 + 1])) << 8);
        }
        return arr;
    }

    function extractMin(Heap memory self) public pure returns (uint16) {
        if (self.heap.length == 0) {
            return 0;
        }
        uint16 min = self.heap[0];
        self.heap[0] = self.heap[self.heap.length - 1];
        // apply self.heap.pop() but building the array manually
        uint16[] memory newHeap = new uint16[](self.heap.length - 1);
        for (uint256 i = 0; i < self.heap.length - 1; i++) {
            newHeap[i] = self.heap[i];
        }
        self.heap = newHeap;
        heapifyDown(self, 1);
        return min;
    }

    function getMin(Heap memory self) public pure returns (uint16) {
        if (self.heap.length == 0) {
            return 0;
        }
        return self.heap[0];
    }
}
