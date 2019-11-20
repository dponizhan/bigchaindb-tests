import { Ed25519Keypair, Connection, Transaction } from 'bigchaindb-driver';
import { API_PATH } from '../config';

let conn;

let adminKeypair;
let user1Keypair;
let user2Keypair;
let user3Keypair;

const nameSpace = 'rbac-bdb-demo';

beforeAll(async done => {
  conn = new Connection(API_PATH);

  adminKeypair = new Ed25519Keypair();
  user1Keypair = new Ed25519Keypair();
  user2Keypair = new Ed25519Keypair();
  user3Keypair = new Ed25519Keypair();

  done();
});

describe(`Role-based access control`, () => {
  test(``, async done => {
    done();
  });
});

async function createNewAsset(keypair, asset, metadata) {
  const transaction = Transaction.makeCreateTransaction(
    asset,
    metadata,
    [
      Transaction.makeOutput(
        Transaction.makeEd25519Condition(keypair.publicKey)
      )
    ],
    keypair.publicKey
  );

  const txSigned = Transaction.signTransaction(transaction, keypair.privateKey);

  return await conn.postTransactionCommit(txSigned);
}

async function transferAsset(tx, fromKeyPair, toPublicKey, metadata) {}
