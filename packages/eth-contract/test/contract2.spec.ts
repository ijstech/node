import 'mocha';
import Ganache from "ganache";
import {Wallet, Utils, BigNumber} from "@ijstech/eth-wallet";
import Contracts from "./sdk";
import assert from "assert";

function print(o:any, indent?:string) {
    console.log(_print(o, indent), "\n");
}
function _print(o:any, indent?:string) {
    let s = "";
    indent = indent || "";
    if (!o) {
        s += o;
    } else if (o._isBigNumber) {
        s += ((o.gt("2000000000")?Utils.fromDecimals(o):o).toFixed());
    } else if (typeof o === "string") {
        s += (/^\d{9,}$/.test(o)?Utils.fromDecimals(o).toFixed():o);
    } else if (typeof o === "number") {
        s += ((<number>o>2000000000)?Utils.fromDecimals(o).toFixed():o);
    } else if (typeof o === "boolean") {
        s += o;
    } else if (Array.isArray(o)) {
        let _indent = (indent || "") + "  ";
        let s1 = o.map(e=>_print(e, _indent));
        let s2 = s1.join(", ");
        if (s2.length < 50){
            s += "[ " + s2 + " ]";
        } else {
            s += "[\n" + _indent + s1.join(",\n"+_indent) + "\n" + indent + "]";
        }
    } else if (typeof o === "object") {
        let _indent = (indent || "") + "  ";
        let s1 = Object.keys(o).map(key=>key+": "+_print(o[key], _indent));
        let s2 = s1.join(",");
        if (s2.length < 50){
            s += "{ " + s2 + " }";
        } else {
            s += "{\n" + _indent + s1.join("\n"+_indent) + "\n" + indent + "}";
        }
    } else {
        s += indent + o ;
    }
    return s;
}
function assertEqual(a:any, b:any, include?: boolean, path?:string) {
    path = path || "";

    if (!a) {
        assert.equal(a, b);
    } else if (a._isBigNumber){
        // assert(BigNumber.isBigNumber(b));
        assert.equal(a.toFixed(), new BigNumber(b).toFixed());
    } else if (Array.isArray(a)){
        assert(Array.isArray(b));
        assert.equal(a.length, b.length);
        a.forEach((e,i) => assertEqual(e, b[i], include, `${path}[${i}]`));
    } else if (typeof a === 'object') {
        assert.equal(typeof b, 'object');
        if (!include)
            assert.deepEqual(Object.keys(a), Object.keys(b));
        for (let key in b) {
            assertEqual(a[key], b[key], include, `${path}.${key}`);
        }
    } else {
        assert.equal(a, b);
    }
}

describe('Contract', function(){
    let wallet: Wallet;
    let accounts: string[];
    let erc20: Contracts.ERC20;

    before('init wallet', async function () {
        let provider = Ganache.provider({
            logging: { quiet: true }
        });
        wallet = new Wallet(provider);
    });
    it('Deploy', async function () {
        accounts = await wallet.accounts;
        console.log(accounts);

        erc20 = new Contracts.ERC20(wallet)

        wallet.defaultAccount = accounts[0];
        let address = await erc20.deploy();
        console.log('Deployed address: ' + address)
    });
    it('Mint', async function () {
        wallet.defaultAccount = accounts[1];
        let receipt = await erc20.mint(Utils.toDecimals(10000));
        let event = erc20.parseTransferEvent(receipt);
        assertEqual(event[0], {
            from: Utils.nullAddress,
            to: accounts[1],
            value: Utils.toDecimals(10000)
        },true);
        assertEqual(await erc20.totalSupply(), Utils.toDecimals(10000));
        assertEqual(await erc20.balanceOf(accounts[1]), Utils.toDecimals(10000));
    });
    it('Transfer', async function () {
        let receipt = await erc20.transfer({recipient: accounts[2], amount:Utils.toDecimals(1000)});
        let event = erc20.parseTransferEvent(receipt);
        assertEqual(event[0], {
            from: accounts[1],
            to: accounts[2],
            value: Utils.toDecimals(1000)
        },true);
        assertEqual(await erc20.balanceOf(accounts[1]), Utils.toDecimals(9000));
        assertEqual(await erc20.balanceOf(accounts[2]), Utils.toDecimals(1000));
    });
    it('Approve', async function () {
        wallet.defaultAccount = accounts[2];
        // console.log(Utils.fromDecimals(await erc20.balanceOf(accounts[1])).toFixed());
        let receipt = await erc20.approve({spender: accounts[3], amount:Utils.toDecimals(100)});
        let event = erc20.parseApprovalEvent(receipt);
        assertEqual(event[0], {
            owner: accounts[2],
            spender: accounts[3],
            value: Utils.toDecimals(100)
        },true);
        assertEqual(await erc20.allowance({param1:accounts[2], param2:accounts[3]}), Utils.toDecimals(100));
    });
    it('TransferFrom', async function () {
        wallet.defaultAccount = accounts[3];
        let receipt = await erc20.transferFrom({sender: accounts[2], recipient: accounts[4], amount:Utils.toDecimals(100)});
        let event = erc20.parseTransferEvent(receipt);
        assertEqual(event[0], {
            from: accounts[2],
            to: accounts[4],
            value: Utils.toDecimals(100)
        },true);
        assertEqual(await erc20.allowance({param1:accounts[2], param2:accounts[3]}), 0);
        assertEqual(await erc20.balanceOf(accounts[2]), Utils.toDecimals(900));
        assertEqual(await erc20.balanceOf(accounts[4]), Utils.toDecimals(100));
    });
    it('Burn', async function () {
        wallet.defaultAccount = accounts[4];
        let receipt = await erc20.burn(Utils.toDecimals(100));
        let event = erc20.parseTransferEvent(receipt);
        assertEqual(event[0], {
            from: accounts[4],
            to: Utils.nullAddress,
            value: Utils.toDecimals(100)
        },true);
        assertEqual(await erc20.balanceOf(accounts[4]), 0);
        assertEqual(await erc20.totalSupply(), Utils.toDecimals(9900));
    });
});