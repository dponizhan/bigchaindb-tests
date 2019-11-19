import { Ed25519Keypair, Connection, Transaction } from 'bigchaindb-driver';
import { mnemonicToSeed } from 'bip39';
import { API_PATH } from '../config';

let conn;

let nTokens = 10000;
let tokensLeft = 0;
let amountToSend = 200;

let aliceKeypair;
let bobKeypair;

beforeAll(async done => {
  conn = new Connection(API_PATH);

  const aliceSeed = (
    await mnemonicToSeed(
      'mixture coyote exile weekend rate quarter deal come field series limb clown pepper start glory'
    )
  ).slice(0, 32);

  const bobSeed = (
    await mnemonicToSeed(
      'require inflict small praise wonder choose still opera cherry erosion camera maple cable heart dinosaur'
    )
  ).slice(0, 32);

  aliceKeypair = new Ed25519Keypair(aliceSeed);
  bobKeypair = new Ed25519Keypair(bobSeed);

  done();
});

describe(`Launch token`, () => {
  let tx = null;

  test(`Create token`, async done => {
    const txCreate = Transaction.makeCreateTransaction(
      {
        token: 'TT (Tutorial Tokens)',
        number_tokens: nTokens
      },
      { datetime: new Date().toString() },
      [Transaction.makeOutput(Transaction.makeEd25519Condition(aliceKeypair.publicKey), nTokens.toString())],
      aliceKeypair.publicKey
    );
    const txSigned = Transaction.signTransaction(txCreate, aliceKeypair.privateKey);
    tx = await conn.postTransactionCommit(txSigned);

    tokensLeft = nTokens;
    expect(tx.id).toBeDefined();
    done();
  });

  test(`Transfer tokens`, async done => {
    const transaction = await conn.getTransaction(tx.id);
    tokensLeft -= amountToSend;

    const createTransfer = Transaction.makeTransferTransaction(
      [
        {
          tx: transaction,
          output_index: 0
        }
      ],
      [
        Transaction.makeOutput(Transaction.makeEd25519Condition(aliceKeypair.publicKey), tokensLeft.toString()),
        Transaction.makeOutput(Transaction.makeEd25519Condition(bobKeypair.publicKey), amountToSend.toString())
      ],
      {
        transfer_to: 'bob',
        tokens_left: tokensLeft
      }
    );
    const signedTransfer = Transaction.signTransaction(createTransfer, aliceKeypair.privateKey);

    const response = await conn.postTransactionCommit(signedTransfer);
    expect(response.asset.id).toEqual(tx.id);

    done();
  });
});
