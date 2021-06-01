# Merkle Distributor
A Merkle Distributor contract users can interact with to claim their tokens

## dApp Usage
Run dApp locally

1. Make sure **hardhat.config** has `defaultNetwork: localhost`
2. Go into the **solidity** folder and run `npx hardhat node` & `npx hardhat run ./scripts/distribution.js`
3. Go into the **frontend** folder and run `yarn start`
4. Make sure the **constants** file has all the correct addresses
5. Connect to dApp using Metamask & the localhost network

## Testing

1. Make sure **hardhat.config** has `defaultNetwork: hardhat`
2. Go into the **solidity** folder and run `npx hardhat test .\test\distribution-test.js`
