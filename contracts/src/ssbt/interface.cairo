use core::array::Array;
use core::integer::u64;
use starknet::ContractAddress;

/// The main interface for the SSBT (Sublimable Soulbound Token) contract,
/// defining user-facing actions like follow, sublimate, and querying balances.
#[starknet::interface]
pub trait ISSBT<ContractState> {
    /// Follow a specific user (target address).
    /// This will register a following relationship and start tracking time.
    fn follow(ref self: ContractState, target: ContractAddress);

    /// Unfollow a specific user.
    /// This will remove the follow relationship and stop tracking.
    fn unfollow(ref self: ContractState, target: ContractAddress);

    /// Follow multiple users in one call.
    /// This is a batch variant of `follow` for gas efficiency.
    fn batch_follow(ref self: ContractState, targets: Array<ContractAddress>);

    /// Unfollow multiple users in one call.
    /// This is a batch variant of `unfollow` for gas efficiency.
    fn batch_unfollow(ref self: ContractState, targets: Array<ContractAddress>);

    /// Convert SSBT (Soulbound tokens) into reward tokens based on follow activity.
    /// This operation is rate-limited and distributes tokens accordingly.
    fn sublimate(ref self: ContractState);

    /// Get the current SSBT balance of a user.
    /// SSBTs are non-transferable and only increase through `give_ssbt`.
    fn ssbt_balance_of(self: @ContractState, user: ContractAddress) -> u256;

    /// Get the total supply of SSBT tokens across all users.
    fn ssbt_total_supply(self: @ContractState) -> u256;

    /// Get the list of addresses the user is currently following.
    fn get_followees(self: @ContractState, user: ContractAddress) -> Array<ContractAddress>;

    /// Get the timestamp (in seconds) of the user's last sublimate action.
    /// Used to enforce cooldown periods.
    fn get_last_sublimate_time(self: @ContractState, user: ContractAddress) -> u64;

    /// Get the duration (in seconds) that a user has been following a specific target.
    fn get_follow_duration(
        self: @ContractState, user: ContractAddress, target: ContractAddress,
    ) -> u64;

    /// Mint (give) SSBT tokens to a user.
    /// This function bypasses normal earning logic and should only be called by trusted sources.
    fn give_ssbt(ref self: ContractState, to: ContractAddress, amount: u256);
}

/// Administrative interface for the SSBT contract,
/// allowing protocol-level parameter updates.
#[starknet::interface]
pub trait ISSBTAdmin<ContractState> {
    /// Set the cooldown period (in seconds) between sublimate actions.
    fn set_cooldown_period(ref self: ContractState, seconds: u64);

    /// Set the maximum number of users a single account can follow.
    fn set_max_follow_count(ref self: ContractState, count: u64);

    /// Set the reward distribution ratios used during sublimate.
    /// `share_ratio` goes to the user, `burn_ratio` is permanently burned.
    fn set_distribution_ratios(ref self: ContractState, share_ratio: u64, burn_ratio: u64);

    /// Set the minimum number of users a person must follow to be eligible for sublimate.
    fn set_min_required_followees(ref self: ContractState, count: u64);
}
