#[cfg(test)]

use core::num::traits::Zero;
use snforge_std::DeclareResultTrait;
use starknet::contract_address_const;
use snforge_std::{declare, ContractClassTrait};
use openzeppelin_token::erc20::interface::{ERC20ABIDispatcher, ERC20ABIDispatcherTrait};
use starknet::ContractAddress;

fn pow_256(self: u256, mut exponent: u8) -> u256 {
    if self.is_zero() {
        return 0;
    }
    let mut result = 1;
    let mut base = self;

    loop {
        if exponent & 1 == 1 {
            result = result * base;
        }

        exponent = exponent / 2;
        if exponent == 0 {
            break result;
        }

        base = base * base;
    }
}

fn ETH_INITIAL_SUPPLY() -> u256 {
    500_000_000 * pow_256(10, 18)
}

// A helper that returns a very small address, ensuring that this token is always token0 in a pair
fn TOKEN0_ADDRESS() -> ContractAddress {
    0x00000000000000000000000000000000000000000000000000000000000000A.try_into().unwrap()
}

// #[test]
fn deploy_token0_with_owner(owner: ContractAddress) -> (ERC20ABIDispatcher, ContractAddress) {

    let token = declare("ERC20Token").unwrap().contract_class();
    let mut calldata = Default::default();
    Serde::serialize(@ETH_INITIAL_SUPPLY(), ref calldata);
    Serde::serialize(@owner, ref calldata);

    let (address, _) = token.deploy_at(@calldata, TOKEN0_ADDRESS()).unwrap();
    let dispatcher = ERC20ABIDispatcher { contract_address: address, };
    (dispatcher, address)
}