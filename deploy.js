require('dotenv').config()

const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')
const {
  abi,
  evm: { bytecode },
} = require('./compile')

const MNEMONIC = process.env.MNEMONIC

const PROVIDER_URL = process.env.PROVIDER_URL

const provider = new HDWalletProvider({
  mnemonic: MNEMONIC,
  providerOrUrl: PROVIDER_URL,
  addressIndex: 1,
})

const web3 = new Web3(provider)

const deploy = async () => {
  const accounts = await web3.eth.getAccounts()

  console.log('Attempting to deploy from account', accounts[0])

  try {
    const result = await new web3.eth.Contract(abi)
      .deploy({ data: bytecode.object })
      .send({ from: accounts[0], gas: '1000000' })
    if (!result) {
      console.log('deply failed')
      provider.engine.stop()
    } else {
      console.log(JSON.stringify(abi))
      console.log('Contract deployed to', result.options.address)
      provider.engine.stop()
    }
  } catch (error) {
    console.log('Cannot deploy contract', error)
    provider.engine.stop()
  }
}

deploy()
