import { Account } from '../src/account';
import { PrivateKey } from '../src/crypto';
import { Address } from '../src/crypto/address';
import { Identity } from '../src/identity';
import RestClient from '../src/network/rest/restClient';
import { WebsocketClient } from '../src/network/websocket/websocketClient';
import { buildGetDDOTx, buildRegisterOntidTx } from '../src/smartcontract/nativevm/ontidContractTxBuilder';
import { signTransaction } from '../src/transaction/transactionBuilder';

// tslint:disable:no-console
describe('test restClient', () => {
    const rest = new RestClient();

    const codeHash = '36bb5c053b6b839c8f6b923fe852f91239b9fccc';

    let txHash: string;
    let blockHash: string;
    let height: number;

    const privateKey = PrivateKey.random();
    const publicKey = privateKey.getPublicKey();
    const account = Account.create(privateKey, '123456', '');
    const identity = Identity.create(privateKey, '123456', '');
    const ontid =  identity.ontid;
    const address = account.address;

    /**
     * Registers new ONT ID to create transaction with Events and new block
     */
    beforeAll(async () => {
        const tx = buildRegisterOntidTx(ontid, publicKey, '500', '30000');
        tx.payer = account.address;
        signTransaction(tx, privateKey);

        const client = new WebsocketClient();
        const result = await client.sendRawTransaction(tx.serialize(), false, true);
        txHash = result.Result.TxHash;
    }, 5000);

    test('test sendRawTransaction', async () => {
        const tx = buildGetDDOTx(ontid);
        const res = await rest.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        expect(res.Result).toBeDefined();
    });

    test('test getRawTransaction', async () => {
        const res = await rest.getRawTransaction(txHash);
        console.log(res);
        expect(res.Result).toBeTruthy();
    });

    test('test getRawTransactionJson', async () => {
        const res = await rest.getRawTransactionJson(txHash);
        console.log(res);
        expect(res.Result).toBeTruthy();
    });

    test('test GenerateBlockTime', async () => {
        const res = await rest.getGenerateBlockTime();
        console.log(res);
        // expect(res.Result).toBeTruthy();
        expect(res.Result).toBeFalsy();
    });

    test('test getNodeCount', async () => {
        const res = await rest.getNodeCount();
        console.log(res);
        expect(res.Result).toBeTruthy();
    });

    /**
     * Gets current block height to be used by following tests.
     */
    test('test getBlockHeight', async () => {
        const response = await rest.getBlockHeight();

        expect(response).toBeDefined();
        expect(response.Result).toBeDefined();
        height = response.Result;
    });

    test('test getBlock by height', async () => {
        const res = await rest.getBlock(height);
        console.log(res);
        expect(res.Result).toBeTruthy();
    });

    /**
     * Gets block hash to be used by following tests.
     */
    test('test getBlockJson by height', async () => {
        const res = await rest.getBlockJson(height);
        console.log(res);
        expect(res.Result).toBeTruthy();
        expect(res.Result.Hash).toBeDefined();
        blockHash = res.Result.Hash;
    });

    test('test getBlock by hash', async () => {
        const res = await rest.getBlock(blockHash);
        console.log(res);
        expect(res.Result).toBeTruthy();
    });

    test('test getBlockJson by hash', async () => {
        const res = await rest.getBlockJson(blockHash);
        console.log(res);
        expect(res.Result).toBeTruthy();
    });

    test('test getBalance', async () => {
        const res = await rest.getBalance(address);
        console.log(res);
        expect(res.Result).toBeTruthy();
    });

    test('test getContract', async () => {
        const res = await rest.getContract(codeHash);
        console.log(res);
        expect(res.Result).toBeTruthy();
    });

    test('test getContractJson', async () => {
        const res = await rest.getContractJson(codeHash);
        console.log(res);
        expect(res.Result).toBeTruthy();
    });

    test('test smartCodeEvent by hash', async () => {
        const res = await rest.getSmartCodeEvent(txHash);
        console.log(res);
        expect(res.Result).toBeTruthy();
    });

    test('test smartCodeEvent by height', async () => {
        const res = await rest.getSmartCodeEvent(height);
        console.log(res);
        expect(res.Result).toBeTruthy();
    });

    test('test getBlockHeightByTxHash', async () => {
        const res = await rest.getBlockHeightByTxHash(txHash);
        console.log(res);
        expect(res.Result).toBeTruthy();
    });

    test.skip('test getStorage', async () => {
        const key = '2a6469643a6f6e743a5443375a6b556a62694e36794b61415433687735567a714c713138587538635a4a5702';
        const res = await rest.getStorage(codeHash, key);
        console.log(res);
        expect(res.Result).toBeTruthy();
    });

    // wait for update this api in testnet
    test('test getMerkleProof', async () => {
        const res = await rest.getMerkleProof(txHash);
        console.log(res);
        expect(res).toBeDefined();
    });
});
