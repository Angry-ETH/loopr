use core::array::ArrayTrait;
use core::traits::TryInto;
use openzeppelin_token::erc20::{ERC20ABIDispatcher, ERC20ABIDispatcherTrait};
use openzeppelin_utils::serde::SerializedAppend;
use snforge_std::cheat::block_info::*;
use snforge_std::{*, test_address};
use starknet::{ContractAddress, get_block_info};
use crate::ssbt::interface::{ISSBTDispatcher, ISSBTDispatcherTrait};

fn deploy_contract() -> (ContractAddress, ContractAddress) {
    let deployer = test_address();
    let ssbt = declare("SSBTToken").unwrap().contract_class();

    let mut calldata = array![];

    let name: ByteArray = "Loopr";
    let symbol: ByteArray = "SSBT";

    calldata.append_serde(name);
    calldata.append_serde(symbol);
    calldata.append_serde(1000000_u256);
    calldata.append_serde(deployer);

    let (addr, _) = ssbt.deploy(@calldata).expect('SSBTToken deployment failed');

    (addr, deployer)
}

#[test]
fn test_give_and_check_ssbt_balance() {
    let (addr, deployer) = deploy_contract();

    let contract = ISSBTDispatcher { contract_address: addr };

    let erc20 = ERC20ABIDispatcher { contract_address: addr };

    let balance = erc20.balance_of(deployer);

    assert(balance == 1000000_u256, 'Deployer should have ERC20');

    contract.give_ssbt(deployer, 100_u256);

    let ssbt_balance = contract.ssbt_balance_of(deployer);
    assert(ssbt_balance == 100_u256, 'Should have 100 SSBT');
}

#[test]
fn test_follow_and_unfollow() {
    let (addr, deployer) = deploy_contract();
    let user2: ContractAddress = 999.try_into().unwrap();

    let contract = ISSBTDispatcher { contract_address: addr };

    contract.follow(user2);
    let list = contract.get_followees(deployer);
    assert(list.len() == 1, 'Should follow one address');

    contract.unfollow(user2);
    let list2 = contract.get_followees(deployer);
    assert(list2.len() == 0, 'Should unfollow successfully');
}

#[test]
fn test_sublimate_should_burn_ssbt_and_give_erc20() {
    let (addr, deployer) = deploy_contract();
    let contract = ISSBTDispatcher { contract_address: addr };
    let erc20 = ERC20ABIDispatcher { contract_address: addr };

    let ssbt_amount: u256 = 100000_u256;

    contract.give_ssbt(deployer, ssbt_amount);

    let ssbt_before = contract.ssbt_balance_of(deployer);
    assert(ssbt_before == ssbt_amount, 'SSBT not correctly given');
    let erc20_before = erc20.balance_of(deployer);
    assert(erc20_before == 1000000_u256 - ssbt_amount, 'ERC20 not correctly given');

    // follow dummy to enable sharing logic
    let user2: ContractAddress = 999.try_into().unwrap();
    contract.follow(user2);

    let now = get_block_info().block_number;
    start_cheat_block_number_global(now + 100_u64);

    contract.sublimate();

    let erc20_after = erc20.balance_of(deployer);
    let ssbt_after = contract.ssbt_balance_of(deployer);

    assert(ssbt_after == 0_u256, 'SSBT burned');
    assert(erc20_after > erc20_before, 'ERC20 increased');
}

#[test]
fn test_sublimate_flow() {
    let (addr, deployer) = deploy_contract();
    let contract = ISSBTDispatcher { contract_address: addr };

    let user1: ContractAddress = 1001.try_into().unwrap();
    let user2: ContractAddress = 1002.try_into().unwrap();

    contract.give_ssbt(deployer, 1000_u256);

    let ssbt_before = contract.ssbt_balance_of(deployer);
    assert(ssbt_before == 1000_u256, 'SSBT not correctly given');

    contract.follow(user1);
    contract.follow(user2);

    let now = get_block_info().block_number;
    start_cheat_block_number_global(now + 100_u64);

    contract.sublimate();

    let ssbt_after = contract.ssbt_balance_of(deployer);
    assert(ssbt_after == 0_u256, 'SSBT burned');

    let follower1 = contract.ssbt_balance_of(user1);
    let follower2 = contract.ssbt_balance_of(user2);

    assert(follower1 == follower2, 'user1 or user2 did not receive');
    assert(follower1 > 0, 'user1 did not receive');
    assert(follower1 > 0, 'user2 did not receive');

    contract.give_ssbt(deployer, 500_u256);
}

#[test]
fn test_sublimate_should_burn_and_mint() {
    let (addr, deployer) = deploy_contract();
    let contract = ISSBTDispatcher { contract_address: addr };
    let erc20 = ERC20ABIDispatcher { contract_address: addr };

    contract.give_ssbt(deployer, 10000_u256);

    let before_ssbt = contract.ssbt_balance_of(deployer);
    let before_erc20 = erc20.balance_of(deployer);

    let followee: ContractAddress = 999.try_into().unwrap();
    contract.follow(followee);

    let now = get_block_info().block_number;
    start_cheat_block_number_global(now + 100);

    contract.sublimate();

    let after_ssbt = contract.ssbt_balance_of(deployer);
    let after_erc20 = erc20.balance_of(deployer);
    let received = contract.ssbt_balance_of(followee);

    assert(after_ssbt == 0_u256, 'SSBT should be burned');
    assert(after_erc20 > before_erc20, 'ERC20 should be minted');
    assert(received > 0_u256, 'Followee should receive SSBT');
}

#[test]
fn test_sublimate_min_followees() {
    let (addr, deployer) = deploy_contract();
    let contract = ISSBTDispatcher { contract_address: addr };

    contract.give_ssbt(deployer, 10000_u256);

    // follow only one
    let followee: ContractAddress = 123.try_into().unwrap();
    contract.follow(followee);

    let now = get_block_info().block_number;
    start_cheat_block_number_global(now + 999);

    contract.sublimate();
    let amount = contract.ssbt_balance_of(followee);

    // because only 1 followee, all share goes to him (base_ratio adjusted)
    assert(amount > 4000_u256, 'Share ratio logic mismatch');
}

// #[test]
// fn test_cooldown_logic() {
//     let (addr, deployer) = deploy_contract();
//     let contract = ISSBTDispatcher { contract_address: addr };
//     let followee: ContractAddress = 123.try_into().unwrap();

//     contract.give_ssbt(deployer, 10000_u256);
//     contract.follow(followee);

//     let now = get_block_info().block_number;
//     start_cheat_block_number_global(now + 100);

//     contract.sublimate();

//     start_cheat_block_number_global(now + 101);

//     // should fail because cooldown not passed
//     let result = contract.sublimate();
//     assert(result == (), 'Cooldown not passed');
// }
