use starknet::ContractAddress;
use core::array::Array;
use core::integer::u64;

#[starknet::interface]
pub trait ISSBT<ContractState> {
    fn follow(ref self: ContractState, target: ContractAddress);
    fn unfollow(ref self: ContractState, target: ContractAddress);
    fn batch_follow(ref self: ContractState, targets: Array<ContractAddress>);
    fn batch_unfollow(ref self: ContractState, targets: Array<ContractAddress>);
    fn sublimate(ref self: ContractState);
    fn give_ssbt(ref self: ContractState, to: ContractAddress, amount: u256);
    fn ssbt_balance_of(self: @ContractState, user: ContractAddress) -> u256;
    fn get_followees(self: @ContractState, user: ContractAddress) -> Array<ContractAddress>;
    fn get_last_sublimate_time(self: @ContractState, user: ContractAddress) -> u64;
    fn get_follow_duration(self: @ContractState, user: ContractAddress, target: ContractAddress) -> u64;
}

#[starknet::interface]
pub trait ISSBTAdmin<ContractState> {
    fn set_cooldown_period(ref self: ContractState, seconds: u64);
    fn set_max_follow_count(ref self: ContractState, count: u64);
    fn set_distribution_ratios(
        ref self: ContractState,
        share_ratio: u64,
        burn_ratio: u64
    );
    fn set_min_required_followees(ref self: ContractState, count: u64);
}

#[starknet::interface]
pub trait ISSBTToken<ContractState> {
    fn total_supply(self: @ContractState) -> u256;
    fn balance_of(self: @ContractState, account: ContractAddress) -> u256;
    fn transfer(ref self: ContractState, recipient: ContractAddress, amount: u256) -> bool;
    fn approve(ref self: ContractState, spender: ContractAddress, amount: u256) -> bool;
    fn transfer_from(
        ref self: ContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256
    ) -> bool;
}