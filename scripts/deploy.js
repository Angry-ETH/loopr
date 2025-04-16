import colors from "colors";
import { deployContract } from "./libs/contract.js";

const printBanner = () => {
  console.log("  _      _____   _____  _____  _____ ".magenta);
  console.log(" | |    /  __ \\ /  __ \\|     \\|  _  \\ ".magenta);
  console.log(" | |   | |   | | |   | | |__) | |__) |".magenta);
  console.log(" | |___| |___| | |___| |  ___/|  _  / ".magenta);
  console.log(" |_____|\\_____/ \\_____/|_|    |_|  \\_\\   ".magenta);
};

const main = async () => {
  printBanner();

  console.log(`\n🚀 Deploying LOOPR SSBTToken contract...\n`.blue);

  const constructorArgs = {
    name: "Loopr",
    symbol: "LOOPR",
    initial_supply: { low: "0x0", high: "0x1" },
    recipient: "0x0123456789abcdef",
  };

  try {
    await deployContract("loopr_SSBTToken", constructorArgs);
  } catch (error) {
    console.error("❌ Deployment failed:".red, error.message || error);
    process.exit(1);
  }
};

main();
