#[starknet::contract]
pub mod SSBTToken {
    #[feature("deprecated-list-trait")]
    use alexandria_storage::list::{List, ListTrait};
    use core::array::{Array, ArrayTrait};
    use core::integer::{u256, u64};
    use core::traits::{Into, TryInto};
    use openzeppelin_access::ownable::OwnableComponent;
    use openzeppelin_token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
        StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, SyscallResultTrait, get_block_info, get_caller_address};
    use crate::ssbt::interface::{ISSBT, ISSBTAdmin, ISSBTToken};

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: ERC20Component, storage: erc20, event: ERC20Event);

    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
        follow_data: Map<(ContractAddress, ContractAddress), u64>,
        user_followees: Map<ContractAddress, List<ContractAddress>>,
        ssbt_balances: Map<ContractAddress, u256>,
        last_sublimate: Map<ContractAddress, u64>,
        cooldown_period: u64,
        max_follow_count: u64,
        share_ratio: u64,
        burn_ratio: u64,
        min_required_followees: u64,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event
    }

    // ERC20
    #[abi(embed_v0)]
    impl ERC20MixinImpl = ERC20Component::ERC20MixinImpl<ContractState>;
    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;

    #[constructor]
    fn constructor(
        ref self: ContractState,
        name: ByteArray,
        symbol: ByteArray,
        initial_supply: u256,
        recipient: ContractAddress,
    ) {
        self.erc20.initializer(name, symbol);
        self.erc20.mint(recipient, initial_supply);
        self.ownable.initializer(recipient);

        // Default config
        self.cooldown_period.write(600);
        self.max_follow_count.write(2000);
        self.share_ratio.write(8000); // 80%
        self.burn_ratio.write(2000); // 20%
    }

    fn remove_target_from_list(
        ref self: ContractState, user: ContractAddress, target: ContractAddress,
    ) {
        let mut list = self.user_followees.read(user);
        let len = list.len();
        let mut i = 0;

        let mut new_items = array![];

        while i != len {
            let item = list.get(i).unwrap_syscall().unwrap();
            if item != target {
                new_items.append(item);
            }
            i += 1;
        }
        list.clean();
        let mut j = 0;
        while j != new_items.len() {
            let addr = new_items.at(j);
            list.append(*addr).unwrap_syscall();
            j += 1;
        }
        self.user_followees.write(user, list);
    }

    #[abi(embed_v0)]
    impl SSBTEntrypoints of ISSBT<ContractState> {
        fn follow(ref self: ContractState, target: ContractAddress) {
            let caller = get_caller_address();
            assert(target != caller, 'Cannot follow self');

            let key = (caller, target);
            let exists = self.follow_data.read(key);
            assert(exists == 0, 'Already followed');

            self.follow_data.write(key, get_block_info().block_number);

            let mut list = self.user_followees.read(caller);
            list.append(target);
            self.user_followees.write(caller, list);
        }

        fn unfollow(ref self: ContractState, target: ContractAddress) {
            let caller = get_caller_address();
            let key = (caller, target);
            let followed_block = self.follow_data.read(key);
            assert(followed_block != 0, 'Not followed');

            self.follow_data.write(key, 0);
            remove_target_from_list(ref self, caller, target);
        }

        fn batch_follow(ref self: ContractState, targets: Array<ContractAddress>) {
            let mut i = 0;
            while i != targets.len() {
                self.follow(*targets.at(i));
                i += 1;
            }
        }

        fn batch_unfollow(ref self: ContractState, targets: Array<ContractAddress>) {
            let mut i = 0;
            while i != targets.len() {
                self.unfollow(*targets.at(i));
                i += 1;
            }
        }


        fn give_ssbt(ref self: ContractState, to: ContractAddress, amount: u256) {
            let current = self.ssbt_balances.read(to);
            self.ssbt_balances.write(to, current + amount);
        }

        fn ssbt_balance_of(self: @ContractState, user: ContractAddress) -> u256 {
            self.ssbt_balances.read(user)
        }

        fn sublimate(ref self: ContractState) {
            let caller = get_caller_address();
            let now = get_block_info().block_timestamp;
            let last_time = self.last_sublimate.read(caller);
            assert(now - last_time >= self.cooldown_period.read(), 'Cooldown not passed');
            self.last_sublimate.write(caller, now);

            let ssbt_amount = self.ssbt_balances.read(caller);
            assert(ssbt_amount > 0, 'No SSBT to sublimate');
            self.ssbt_balances.write(caller, 0);

            let burn_ratio = self.burn_ratio.read(); // e.g. 2000
            let share_ratio = self.share_ratio.read(); // e.g. 7000
            let return_ratio = 10000 - burn_ratio - share_ratio;

            let burn_amount = ssbt_amount * burn_ratio.into() / 10000_u256;
            let user_erc20 = ssbt_amount * return_ratio.into() / 10000_u256;
            let share_amount = ssbt_amount * share_ratio.into() / 10000_u256;

            self.erc20.mint(caller, user_erc20);

            let followees = self.user_followees.read(caller);
            let count = followees.len();

            let min_required = self.min_required_followees.read();

            let base_ratio = if count.into() < min_required {
                10000 / min_required
            } else {
                10000 / count.into()
            };

            let mut i = 0;
            while i != count {
                let followee = followees.get(i).unwrap_syscall().unwrap();
                let ratio = base_ratio;
                let amount = share_amount * ratio.into() / 10000_u256;

                let current = self.ssbt_balances.read(followee);
                self.ssbt_balances.write(followee, current + amount);

                i += 1;
            }
        }

        fn get_followees(self: @ContractState, user: ContractAddress) -> Array<ContractAddress> {
            let list = self.user_followees.read(user);
            list.array().unwrap_syscall()
        }


        fn get_last_sublimate_time(self: @ContractState, user: ContractAddress) -> u64 {
            self.last_sublimate.read(user)
        }

        fn get_follow_duration(
            self: @ContractState, user: ContractAddress, target: ContractAddress,
        ) -> u64 {
            let key = (user, target);
            let block_at = self.follow_data.read(key);
            if block_at == 0 {
                return 0;
            }
            get_block_info().block_number - block_at
        }
    }

    #[abi(embed_v0)]
    impl SSBTTokenEntrypoints of ISSBTToken<ContractState> {
        fn total_supply(self: @ContractState) -> u256 {
            let total_supply = self.erc20.total_supply();
            return total_supply;
        }

        fn balance_of(self: @ContractState, account: ContractAddress) -> u256 {
            self.erc20.balance_of(account)
        }

        fn transfer(
            ref self: ContractState, recipient: ContractAddress, amount: u256,
        ) -> core::bool {
            assert(amount > 0, 'Amount must be greater than 0');
            let caller = get_caller_address();
            let balance = self.erc20.balance_of(caller);
            assert(balance >= amount, 'Insufficient balance');
            self.erc20.transfer(recipient, amount);
            return true;
        }

        fn approve(ref self: ContractState, spender: ContractAddress, amount: u256) -> core::bool {
            assert(amount > 0, 'Amount must be greater than 0');
            let caller = get_caller_address();
            let allowance = self.erc20.allowance(caller, spender);
            assert(allowance >= amount, 'Insufficient allowance');
            self.erc20.approve(spender, amount);
            return true;
        }

        fn transfer_from(
            ref self: ContractState,
            sender: ContractAddress,
            recipient: ContractAddress,
            amount: u256,
        ) -> core::bool {
            assert(amount > 0, 'Amount must be greater than 0');
            let caller = get_caller_address();
            let allowance = self.erc20.allowance(sender, caller);
            assert(allowance >= amount, 'Insufficient allowance');
            let balance = self.erc20.balance_of(sender);
            assert(balance >= amount, 'Insufficient balance');
            self.erc20.transfer_from(sender, recipient, amount);
            return true;
        }
    }

    #[abi(embed_v0)]
    impl SSBTAdminEntrypoints of ISSBTAdmin<ContractState> {
        fn set_cooldown_period(ref self: ContractState, seconds: u64) {
            self.ownable.assert_only_owner();
            self.cooldown_period.write(seconds);
        }
    
        fn set_max_follow_count(ref self: ContractState, count: u64) {
            self.ownable.assert_only_owner();
            self.max_follow_count.write(count);
        }
    
        fn set_distribution_ratios(ref self: ContractState, share_ratio: u64, burn_ratio: u64) {
            self.ownable.assert_only_owner();
            assert(share_ratio + burn_ratio == 10000, 'Sum != 100%');
            self.share_ratio.write(share_ratio);
            self.burn_ratio.write(burn_ratio);
        }
    
        fn set_min_required_followees(ref self: ContractState, count: u64) {
            self.ownable.assert_only_owner();
            self.min_required_followees.write(count);
        }
    }
    
}
