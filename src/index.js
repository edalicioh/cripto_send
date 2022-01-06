
document.addEventListener("alpine:init", () => {

    console.log("Alpine is ready!");
    Alpine.data("Home", (params) => ({
        title: "Home",
        account: window.account,
        contract: window.contract,
        tokenInfo: {
            decimals: "", name: "", symbol: "", supply: "", balance: ""
        },

        isConnected: false,
        from: "0x8aDB8c0cFB54525d455a3ab1d2948d4Dd0E08d1b",
        amount: "",

        shortAddress: "",

        async sendTransaction() {
            console.log("sendTransaction");
            await contract.methods.transfer(this.from, web3.utils.toWei(this.amount)).send({ from: account })

            this.tokenInfo = await getTokenInfo()

        },
        async Connect() {
            console.log("Connect");
            await InitWeb3()
            await this.setValue()
        },

        setShortAddress() {
            this.shortAddress = this.account.substr(0, 5) + "..." +this.account.substr(-4, 4)
        },

        setIsConnected() {
            this.isConnected = ethereum._state.accounts.length > 0
        },

        async setValue(value) {
            [window.account] = await web3.eth.getAccounts()
            await createContract()            
            this.tokenInfo = await getTokenInfo()
            this.account =  window.account 
            this.contract = window.contract
            this.setIsConnected()
            this.setShortAddress()
        }

    }));
});

const wei = (amount, decimals) => {
    return parseInt(amount / 10 ** decimals)
}

const getBalance = async (decimals = 18) => {
    const balance = await contract.methods.balanceOf(window.account).call()
    window.balance = wei(balance, decimals)
    return window.balance
}


const getTokenInfo = async () => {
    const symbol = await contract.methods.symbol().call();
    const decimals = await contract.methods.decimals().call();
    const name = await contract.methods.name().call()
    const totalSupply = await contract.methods.totalSupply().call()
    const balance = await getBalance(decimals)

    const supply = totalSupply / 10 ** decimals

    window.tokenInfo = { decimals, name, symbol, supply, balance }

    return window.tokenInfo;
}


const createContract = async () => {
    const { abi } = Token
    const tokenAddress = Token.networks[5777].address
    window.contract = new web3.eth.Contract(abi, tokenAddress)
}



const InitWeb3 = async () => {
    ethereum.on('message', (msg) => {
        console.log("ethereum.on", msg);
    });
    try {
        if (window.ethereum) {
            window.web3 = await new Web3(window.ethereum)
            await window.ethereum.request({ method: 'eth_requestAccounts' })
        }
        else if (window.web3) {
            window.web3 = await new Web3(window.web3.currentProvider)
        }
        else {
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }

        [window.account] = await web3.eth.getAccounts()
        createContract()
        watchEvents()
        console.log("Web3 is ready!");
    } catch (error) {
        console.log("Web3 is not ready!" , error);
    }
}

const watchEvents = () => {
    contract.events.allEvents()
        .on('data', console.info)
        .on('error', console.error);
}

