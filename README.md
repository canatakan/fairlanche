# Fairlanche
_Bogazici University, Department of Computer Engineering, Graduation Project, Spring 2022_

_**Deployed Application Links**_
- Website: https://fairlanche.com/
- Fuji Node: https://fairlanche.link:9650
- Verified Contracts: Can be found in [this account](https://testnet.snowtrace.io/address/0x059fe3777c8f2dd1329910b6b31fbde13902acdc)'s transactions


## Overview

Fairlanche is a tool for deployment and management of Avalanche Blockchain Subnets with policy based faucets.

It provides an easy interface to deploy your own blockchains on Avalanche subnets with policy based faucets. The policy based faucets allow you to specify a policy for the fair distribution of resources to the users of the blockchain. The policy itself can be specified in the front-end directly. It is then compiled into a smart contract and deployed to the newly created blockchain.


## Installation & Launch

- Clone the repository with its submodules, using the following command:
```
  git clone --recurse-submodules -j8 https://github.com/canatakan/fairlanche.git
  cd fairlanche
```

- Go to the `docker` folder, and build the image:
```
  cd docker
  docker-compose build
```

- Launch the application with `docker-compose`:
```
docker-compose up
```

- In order to use hardhat-project, go to the hardhat-project and install the dependencies with a node version supported by Hardhat:
```
npm install
```
