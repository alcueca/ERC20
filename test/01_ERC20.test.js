const ERC20 = artifacts.require('ERC20Mock')

const { BN, expectRevert } = require('@openzeppelin/test-helpers')
require('chai').use(require('chai-as-promised')).should()

const MAX = "115792089237316195423570985008687907853269984665640564039457584007913129639935"

contract('ERC20', (accounts) => {
  const [deployer, user1, user2] = accounts
  let erc20

  beforeEach(async () => {
    erc20 = await ERC20.new('Test', 'TST', { from: deployer })
  })

  describe('deployment', async () => {
    it('returns the name', async () => {
      let name = await erc20.name()
      name.should.equal('Test')
    })

    it('mints', async () => {
      const balanceBefore = await erc20.balanceOf(user1)
      await erc20.mint(user1, 1, { from: user1 })
      const balanceAfter = await erc20.balanceOf(user1)
      balanceAfter.toString().should.equal(balanceBefore.addn(1).toString())
    })

    describe('with a positive balance', async () => {
      beforeEach(async () => {
        await erc20.mint(user1, 10, { from: user1 })
      })

      it('returns the total supply', async () => {
        const totalSupply = await erc20.totalSupply()
        totalSupply.toString().should.equal('10')
      })

      it('burns', async () => {
        const balanceBefore = await erc20.balanceOf(user1)
        await erc20.burn(user1, 1, { from: user1 })
        const balanceAfter = await erc20.balanceOf(user1)
        balanceAfter.toString().should.equal(balanceBefore.subn(1).toString())
      })

      it('transfers', async () => {
        const fromBalanceBefore = await erc20.balanceOf(user1)
        const toBalanceBefore = await erc20.balanceOf(user2)

        await erc20.transfer(user2, 1, { from: user1 })

        const fromBalanceAfter = await erc20.balanceOf(user1)
        const toBalanceAfter = await erc20.balanceOf(user2)

        fromBalanceAfter.toString().should.equal(fromBalanceBefore.subn(1).toString())
        toBalanceAfter.toString().should.equal(toBalanceBefore.addn(1).toString())
      })

      it('transfers using transferFrom', async () => {
        const balanceBefore = await erc20.balanceOf(user2)
        await erc20.transferFrom(user1, user2, 1, { from: user1 })
        const balanceAfter = await erc20.balanceOf(user2)
        balanceAfter.toString().should.equal(balanceBefore.addn(1).toString())
      })

      it('should not transfer beyond balance', async () => {
        await expectRevert(erc20.transfer(user2, 100, { from: user1 }), 'ERC20: Insufficient balance')
        await expectRevert(erc20.transferFrom(user1, user2, 100, { from: user1 }), 'ERC20: Insufficient balance')
      })

      it('approves to increase allowance', async () => {
        const allowanceBefore = await erc20.allowance(user1, user2)
        await erc20.approve(user2, 1, { from: user1 })
        const allowanceAfter = await erc20.allowance(user1, user2)
        allowanceAfter.toString().should.equal(allowanceBefore.addn(1).toString())
      })

      describe('with a positive allowance', async () => {
        beforeEach(async () => {
          await erc20.approve(user2, 10, { from: user1 })
        })

        it('transfers ether using transferFrom and allowance', async () => {
          const balanceBefore = await erc20.balanceOf(user2)
          await erc20.transferFrom(user1, user2, 1, { from: user2 })
          const balanceAfter = await erc20.balanceOf(user2)
          balanceAfter.toString().should.equal(balanceBefore.add(new BN('1')).toString())
        })

        it('should not transfer beyond allowance', async () => {
          await expectRevert(erc20.transferFrom(user1, user2, 20, { from: user2 }), 'ERC20: Insufficient approval')
        })
      })

      describe('with a maximum allowance', async () => {
        beforeEach(async () => {
          await erc20.approve(user2, MAX, { from: user1 })
        })

        it('does not decrease allowance using transferFrom', async () => {
          await erc20.transferFrom(user1, user2, 1, { from: user2 })
          const allowanceAfter = await erc20.allowance(user1, user2)
          allowanceAfter.toString().should.equal(MAX)
        })
      })
    })
  })
})
