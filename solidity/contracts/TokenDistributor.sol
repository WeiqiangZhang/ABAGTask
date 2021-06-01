/**
 * Copyright (C) 2018  Smartz, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND (express or implied).
 */

// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.4.23;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);
}

contract TokenDistributor {
    address owner;
    bytes32 public merkleRoot;
    bool public cancelable;

    IERC20 tokenContract;

    mapping(address => bool) public spent;
    event TokenTransfer(address addr, uint256 num);

    modifier isCancelable() {
        require(cancelable, "forbidden action");
        _;
    }

    constructor(
        address _tokenContract,
        bytes32 _merkleRoot,
        bool _cancelable
    ) public {
        owner = msg.sender;
        tokenContract = IERC20(_tokenContract);
        merkleRoot = _merkleRoot;
        cancelable = _cancelable;
    }

    function setRoot(bytes32 _merkleRoot) public {
        require(msg.sender == owner);
        merkleRoot = _merkleRoot;
    }

    function contractTokenBalance() public view returns (uint256) {
        return tokenContract.balanceOf(address(this));
    }

    function claim_rest_of_tokens_and_selfdestruct()
        public
        isCancelable
        returns (bool)
    {
        require(msg.sender == owner);
        require(tokenContract.balanceOf(address(this)) >= 0);
        require(
            tokenContract.transfer(
                owner,
                tokenContract.balanceOf(address(this))
            )
        );
        selfdestruct(owner);
        return true;
    }

    function addressToAsciiString(address x) internal pure returns (string) {
        bytes memory s = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint256(x) / (2**(8 * (19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2 * i] = char(hi);
            s[2 * i + 1] = char(lo);
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (b < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }

    function uintToStr(uint256 i) internal pure returns (string) {
        if (i == 0) return "0";
        uint256 j = i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length - 1;
        while (i != 0) {
            bstr[k--] = bytes1(48 + (i % 10));
            i /= 10;
        }
        return string(bstr);
    }

    function leaf_from_address_and_num_tokens(address _a, uint256 _n)
        internal
        pure
        returns (bytes32)
    {
        string memory prefix = "0x";
        string memory space = " ";

        bytes memory _ba = bytes(prefix);
        bytes memory _bb = bytes(addressToAsciiString(_a));
        bytes memory _bc = bytes(space);
        bytes memory _bd = bytes(uintToStr(_n));
        string memory abcde =
            new string(_ba.length + _bb.length + _bc.length + _bd.length);
        bytes memory babcde = bytes(abcde);
        uint256 k = 0;
        for (uint256 i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
        for (i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
        for (i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
        for (i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];

        return bytes32(sha256(abcde));
    }

    function getTokensByMerkleProof(
        bytes32[] _proof,
        bytes32[] _position,
        address _who,
        uint256 _amount
    ) public returns (bool) {
        require(spent[_who] != true);
        require(_amount > 0);

        if (
            !checkProof(_proof, _position, leaf_from_address_and_num_tokens(_who, _amount))
        ) {
            return false;
        }
        spent[_who] = true;

        if (tokenContract.transfer(_who, _amount) == true) {
            emit TokenTransfer(_who, _amount);
            return true;
        }

        require(false);
    }

    function checkProof(bytes32[] proof, bytes32[] _position, bytes32 hash)
        internal
        view
        returns (bool)
    {
        bytes32 el;
        bytes32 dir;
        bytes32 h = hash;

        for (
            uint256 i = 0;
            i <= proof.length - 1;
            i += 1
        ) {
            el = proof[i];
            dir = _position[i];
            if (dir == sha256(abi.encodePacked('right'))) {
                h = sha256(h, el);
            } else {
                h = sha256(el, h);
            }
        }
        return h == merkleRoot;
    }
}
