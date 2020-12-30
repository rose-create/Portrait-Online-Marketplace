const Marketplace = artifacts.require('./Marketplace.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Marketplace', ([deployer, seller, buyer]) => {
  let marketplace

  before(async () => {
    marketplace = await Marketplace.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await marketplace.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await marketplace.name()
      assert.equal(name, 'Portrait Marketplace')
    })
  })

  describe('portraits', async () => {
    let result, portraitCount

    before(async () => {
      result = await marketplace.createPortrait('iPhone X', web3.utils.toWei('1', 'Ether'), { from: seller })
      portraitCount = await marketplace.portraitCount()
    })

    it('creates portraits', async () => {
      // SUCCESS
      assert.equal(portraitCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), portraitCount.toNumber(), 'id is correct')
      assert.equal(event.name, 'iPhone X', 'name is correct')
      assert.equal(event.price, '1000000000000000000', 'price is correct')
      assert.equal(event.owner, seller, 'owner is correct')
      assert.equal(event.purchased, false, 'purchased is correct')

      // FAILURE: Portrait must have a name
      await await marketplace.createPortrait('', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
      // FAILURE: Portrait must have a price
      await await marketplace.createPortrait('iPhone X', 0, { from: seller }).should.be.rejected;
    })

    it('lists portraits', async () => {
      const portrait = await marketplace.portraits(portraitCount)
      assert.equal(portrait.id.toNumber(), portraitCount.toNumber(), 'id is correct')
      assert.equal(portrait.name, 'iPhone X', 'name is correct')
      assert.equal(portrait.price, '1000000000000000000', 'price is correct')
      assert.equal(portrait.owner, seller, 'owner is correct')
      assert.equal(portrait.purchased, false, 'purchased is correct')
    })

    it('sells portraits', async () => {
      // Track the seller balance before purchase
      let oldSellerBalance
      oldSellerBalance = await web3.eth.getBalance(seller)
      oldSellerBalance = new web3.utils.BN(oldSellerBalance)

      // SUCCESS: Buyer makes purchase
      result = await marketplace.purchasePortrait(portraitCount, { from: buyer, value: web3.utils.toWei('1', 'Ether')})

      // Check logs
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), portraitCount.toNumber(), 'id is correct')
      assert.equal(event.name, 'iPhone X', 'name is correct')
      assert.equal(event.price, '1000000000000000000', 'price is correct')
      assert.equal(event.owner, buyer, 'owner is correct')
      assert.equal(event.purchased, true, 'purchased is correct')

      // Check that seller received funds
      let newSellerBalance
      newSellerBalance = await web3.eth.getBalance(seller)
      newSellerBalance = new web3.utils.BN(newSellerBalance)

      let price
      price = web3.utils.toWei('1', 'Ether')
      price = new web3.utils.BN(price)

      const exepectedBalance = oldSellerBalance.add(price)

      assert.equal(newSellerBalance.toString(), exepectedBalance.toString())

      // FAILURE: Tries to buy a portrait that does not exist, i.e., portrait must have valid id
      await marketplace.purchasePortrait(99, { from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;      // FAILURE: Buyer tries to buy without enough ether
      // FAILURE: Buyer tries to buy without enough ether
      await marketplace.purchasePortrait(portraitCount, { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;
      // FAILURE: Deployer tries to buy the portrait, i.e., portrait can't be purchased twice
      await marketplace.purchasePortrait(portraitCount, { from: deployer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
      // FAILURE: Buyer tries to buy again, i.e., buyer can't be the seller
      await marketplace.purchasePortrait(portraitCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
    })
  })
})
