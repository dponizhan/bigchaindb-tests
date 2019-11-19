import { Connection, Ed25519Keypair, Transaction } from 'bigchaindb-driver';
import { mnemonicToSeed } from 'bip39';
import { API_PATH } from '../config';

let conn;
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

describe(`Create and transfer asset flow`, () => {
  let tx = null;

  test(`Create asset and post transaction`, async done => {
    const txCreatePaint = Transaction.makeCreateTransaction(
      {
        name: 'Meninas',
        author: 'Diego Rodríguez de Silva y Velázquez',
        place: 'Madrid',
        year: '1656'
      },
      {
        datetime: new Date().toString(),
        location: 'Madrid',
        value: {
          value_doll: '25000000$',
          value_btc: '2200'
        }
      },
      [Transaction.makeOutput(Transaction.makeEd25519Condition(aliceKeypair.publicKey))],
      aliceKeypair.publicKey
    );

    const txSigned = Transaction.signTransaction(txCreatePaint, aliceKeypair.privateKey);
    tx = await conn.postTransactionCommit(txSigned);

    expect(tx.asset).toEqual({
      data: {
        author: 'Diego Rodríguez de Silva y Velázquez',
        name: 'Meninas',
        place: 'Madrid',
        year: '1656'
      }
    });
    done();
  });

  test(`Transfer asset to another owner`, async done => {
    const transaction = await conn.getTransaction(tx.id);

    const createTransfer = Transaction.makeTransferTransaction(
      [
        {
          tx: transaction,
          output_index: 0
        }
      ],
      [Transaction.makeOutput(Transaction.makeEd25519Condition(bobKeypair.publicKey))],
      {
        datetime: new Date().toString(),
        value: {
          value_eur: '30000000$',
          value_btc: '2100'
        }
      }
    );
    const signedTransfer = Transaction.signTransaction(createTransfer, aliceKeypair.privateKey);
    const response = await conn.postTransactionCommit(signedTransfer);

    expect(response.asset.id).toEqual(tx.id);
    done();
  });
});
