// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Heapified {
    uint16[] public heap;

    constructor(uint16[] memory arr) {
        heapify(arr);
    }

    function heapify(uint16[] memory arr) public {
        heap = arr;
        for (uint256 i = heap.length / 2; i > 0; i--) {
            heapifyDown(i);
        }
    }

    function heapifyDown(uint256 i) public {
        uint256 left = 2 * i;
        uint256 right = 2 * i + 1;
        uint256 smallest = i;
        if (left <= heap.length && heap[left - 1] < heap[smallest - 1]) {
            smallest = left;
        }
        if (right <= heap.length && heap[right - 1] < heap[smallest - 1]) {
            smallest = right;
        }
        if (smallest != i) {
            uint16 temp = heap[i - 1];
            heap[i - 1] = heap[smallest - 1];
            heap[smallest - 1] = temp;
            heapifyDown(smallest);
        }
    }

    function heapifyUp(uint256 i) public {
        uint256 parent = i / 2;
        if (parent > 0 && heap[parent - 1] > heap[i - 1]) {
            uint16 temp = heap[i - 1];
            heap[i - 1] = heap[parent - 1];
            heap[parent - 1] = temp;
            heapifyUp(parent);
        }
    }

    function insert(uint16 value) public {
        heap.push(value);
        heapifyUp(heap.length);
    }

    function extractMin() public returns (uint16) {
        if (heap.length == 0) {
            return 0;
        }
        uint16 min = heap[0];
        heap[0] = heap[heap.length - 1];
        heap.pop();
        heapifyDown(1);
        return min;
    }

    function getMin() public view returns (uint16) {
        if (heap.length == 0) {
            return 0;
        }
        return heap[0];
    }

    function getHeap() public view returns (uint16[] memory) {
        return heap;
    }
}
