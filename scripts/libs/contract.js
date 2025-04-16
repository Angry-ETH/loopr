import "dotenv/config";
import ora from "ora";
import * as fs from "fs";
import * as path from "path";
import colors from "colors";
import { fileURLToPath } from "url";
import { json, Contract, CallData } from "starknet";
import { getDeployerAccount, printNetworkInfo } from "./network.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TARGET_DIR = path.resolve(__dirname, "../../contracts/target/dev");

const loadCompiledContracts = (contractName) => {
  if (!fs.existsSync(TARGET_DIR)) {
    throw new Error(`❌ Target directory not found: ${TARGET_DIR}`);
  }

  const classFile = fs
    .readdirSync(TARGET_DIR)
    .find((f) => f.includes(`${contractName}.contract_class.json`));

  const casmFile = fs
    .readdirSync(TARGET_DIR)
    .find((f) => f.includes(`${contractName}.compiled_contract_class.json`));

  if (!classFile || !casmFile) {
    throw new Error(`❌ Compiled files not found for contract: ${contractName}`);
  }

  return {
    class: json.parse(fs.readFileSync(path.join(TARGET_DIR, classFile), "ascii")),
    casm: json.parse(fs.readFileSync(path.join(TARGET_DIR, casmFile), "ascii")),
  };
};

export const deployContract = async (contractName, constructorArgs) => {
  const account = getDeployerAccount();
  const provider = account.provider;

  printNetworkInfo();

  try {
    const spinner = ora(`🔧 Preparing contract "${contractName}"...`).start();

    const { class: compiledClass, casm: compiledCasm } = loadCompiledContracts(contractName);

    spinner.succeed(`✅ Compiled contract ${contractName} loaded`);

    const calldata = new CallData(compiledClass.abi).compile("constructor", constructorArgs);

    spinner.start("📦 Declaring contract to network...");
    const { declare, deploy } = await account.declareAndDeploy({
      contract: compiledClass,
      casm: compiledCasm,
      constructorCalldata: calldata,
    });
    spinner.succeed("✅ Declaration and deployment transaction sent");

    // spinner.start("⏳ Waiting for transaction confirmation...");
    // const txReceipt = await provider.waitForTransaction(deploy.transaction_hash);
    // spinner.succeed(`🎉 Contract deployed in block ${txReceipt.block_number}`);

    const contract = new Contract(compiledClass.abi, deploy.contract_address, provider);

    console.log(`\n📄 ${"Class Hash:"}`, declare.class_hash.cyan);
    console.log(`📍 ${"Contract Address:"}`, contract.address.green);
    console.log(`🔗 ${"Tx Hash:"}`, deploy.transaction_hash.yellow);
    console.log("");

    return contract.address;
  } catch (error) {
    console.error("❌ Deployment error:", colors.red(error.message || error));
    throw error;
  }
};
