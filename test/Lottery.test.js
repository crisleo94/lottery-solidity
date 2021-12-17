const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')

const web3 = new Web3(ganache.provider())
const { abi, evm } = require('../compile')

let accounts
let lottery

beforeEach(async () => {
  // get accounts
  accounts = await web3.eth.getAccounts()
  // use account to deploy a contract
  lottery = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ from: accounts[0], gas: '1000000' })
})

describe('Lottery', () => {
  console.log(JSON.parse(abi))
  it('deploys a contract', () => {
    assert.ok(lottery.options.address)
  })

  it('allows one account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.2', 'ether'),
    })

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    })

    assert.equal(accounts[0], players[0])
    assert.equal(1, players.length)
  })

  it('allows multiple accounts to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.2', 'ether'),
    })

    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.2', 'ether'),
    })

    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.2', 'ether'),
    })

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    })

    assert.equal(accounts[0], players[0])
    assert.equal(accounts[1], players[1])
    assert.equal(accounts[2], players[2])
    assert.equal(3, players.length)
  })

  it('requires a minimum amount of ether to enter', async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 0,
      })
      assert(false)
    } catch (err) {
      assert(err)
    }
  })

  it('only manager can call pickWinner', async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1],
      })
      assert(false)
    } catch (err) {
      assert(err)
    }
  })

  it('sends money to the winner and resets the players array', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether'),
    })

    const initialBalance = await web3.eth.getBalance(accounts[0])
    await lottery.methods.pickWinner().send({ from: accounts[0] })
    const finalBalance = await web3.eth.getBalance(accounts[0])
    const difference = finalBalance - initialBalance
    const players = await lottery.methods
      .getPlayers()
      .call({ from: accounts[0] })
    const lotteryBalance = await lottery.methods
      .getBalance()
      .call({ from: accounts[0] })

    assert.equal(lotteryBalance, 0)
    assert(players.length === 0)
    assert(difference > web3.utils.toWei('1.8', 'ether'))
  })
})
