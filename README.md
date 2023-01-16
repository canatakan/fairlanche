# A Tool for Deployment and Management of Avalanche Blockchain Subnets with Policy Based Faucets

## Overview

This project provides an easy interface to deploy your own Avalanche blockchain subnet with a policy based faucet. The policy based faucets allow you to specify a policy for the distribution of resources to the users of the subnet. The policy itself can be specified in the front-end directly. It is then compiled into a smart contract and deployed to the newly created subnet.


## Installation

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
