import "dotenv/config";
import { Account, RpcProvider } from "starknet";
import colors from "colors";

const INFURA_KEY = process.env.INFURA_API_KEY;
const ACCOUNT_ADDRESS = process.env.STARKNET_ACCOUNT_ADDRESS;
const PRIVATE_KEY = process.env.STARKNET_ACCOUNT_PRIVATE_KEY;
const SELECTED_NETWORK = process.env.STARKNET_NETWORK?.toLowerCase();

if (!SELECTED_NETWORK) {
  throw new Error("❌ STARKNET_NETWORK is not defined in .env file");
}

if (!ACCOUNT_ADDRESS || !PRIVATE_KEY) {
  throw new Error("❌ STARKNET_ACCOUNT_ADDRESS or STARKNET_ACCOUNT_PRIVATE_KEY is missing");
}

const NETWORKS = {
  mainnet: {
    name: "mainnet",
    rpcUrl: "https://alpha-mainnet.starknet.io/rpc",
    explorerUrl: "https://voyager.online",
  },
  goerli: {
    name: "goerli",
    rpcUrl: `https://starknet-goerli.infura.io/v3/${INFURA_KEY}`,
    explorerUrl: "https://goerli.voyager.online",
  },
  sepolia: {
    name: "sepolia",
    rpcUrl: `https://starknet-sepolia.infura.io/v3/${INFURA_KEY}`,
    explorerUrl: "https://sepolia.voyager.online",
  },
  local: {
    name: "local",
    rpcUrl: "http://localhost:5050",
    // explorerUrl: "http://localhost:5050/explorer",
  },
};

export const getNetworkConfig = () => {
  const config = NETWORKS[SELECTED_NETWORK];
  if (!config) {
    throw new Error(`❌ Unknown network "${SELECTED_NETWORK}". Check STARKNET_NETWORK in .env`);
  }
  return config;
};

export const getRpcProvider = () => {
  const { rpcUrl } = getNetworkConfig();
  return new RpcProvider({ nodeUrl: rpcUrl });
};

export const getDeployerAccount = () => {
  return new Account(getRpcProvider(), ACCOUNT_ADDRESS, PRIVATE_KEY);
};

// 💡 可选：打印当前连接信息
export const printNetworkInfo = () => {
  const { name, rpcUrl, explorerUrl } = getNetworkConfig();
  console.log("\n🌐 Connected to Starknet Network:".cyan, name.green);
  console.log("🔗 RPC:", rpcUrl);
  console.log("🔍 Explorer:", explorerUrl + "\n");
};
