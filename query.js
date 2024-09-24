const { ethers } = require('ethers');
const flatCache = require('flat-cache');
const path = require('path');
const factoryAbi = require('./abi.json'); // Import ABI for the factory contract

// ABI for the pair contract
const pairAbi = [
    {
        "constant": true,
        "inputs": [],
        "name": "token0",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "token1",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

// ABI for the token contract
const tokenAbi = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

// Step 2: Connect to Ethereum Network
const provider = new ethers.providers.JsonRpcProvider("https://seievm-rpc.polkachu.com/");

// Step 3: Define Smart Contract
const contractAddress = '0x71f6b49ae1558357bBb5A6074f1143c46cBcA03d';

// Step 4: Create Contract Instance
const contract = new ethers.Contract(contractAddress, factoryAbi, provider);

// Step 5: Query Smart Contract
async function queryContract() {
    try {
        const length = await contract.allPairsLength();
        console.log(`Total pairs: ${length.toString()}`);

        const cache = flatCache.load('pairsCache', path.resolve('./cache'));

        const batchSize = 20;
        for (let i = 0; i < length; i += batchSize) {
            const batchPromises = [];

            for (let j = i; j < i + batchSize && j < length; j++) {
                batchPromises.push((async (index) => {
                    const pairAddress = await contract.allPairs(index);
                    const pairContract = new ethers.Contract(pairAddress, pairAbi, provider);
                    const token0Address = await pairContract.token0();
                    const token1Address = await pairContract.token1();

                    const token0Contract = new ethers.Contract(token0Address, tokenAbi, provider);
                    const token1Contract = new ethers.Contract(token1Address, tokenAbi, provider);

                    const [token0Name, token0Symbol, token1Name, token1Symbol] = await Promise.all([
                        token0Contract.name(),
                        token0Contract.symbol(),
                        token1Contract.name(),
                        token1Contract.symbol()
                    ]);

                    const pairData = {
                        pairAddress,
                        token0: { address: token0Address, name: token0Name, symbol: token0Symbol },
                        token1: { address: token1Address, name: token1Name, symbol: token1Symbol }
                    };

                    cache.setKey(`pair_${index}`, pairData);
                    cache.save(true);

                    console.log(`Pair ${index}: ${pairAddress}`);
                    console.log(`Token0: ${token0Address}, Name: ${token0Name}, Symbol: ${token0Symbol}`);
                    console.log(`Token1: ${token1Address}, Name: ${token1Name}, Symbol: ${token1Symbol}`);
                })(j));
            }

            await Promise.all(batchPromises);
        }
    } catch (error) {
        console.error('Error querying contract:', error);
    }
}

queryContract();