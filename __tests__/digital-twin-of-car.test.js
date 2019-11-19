import { Ed25519Keypair } from 'bigchaindb-driver';
import Orm from 'bigchaindb-orm';
import { API_PATH } from '../config';

class DID extends Orm {
  constructor(entity) {
    super(API_PATH);
    this.entity = entity;
  }
}

const aliceKeypair = new Ed25519Keypair();
const carKeypair = new Ed25519Keypair();
const sensorGPSKeypair = new Ed25519Keypair();

const userDID = new DID(aliceKeypair.publicKey);
const carDID = new DID(carKeypair.publicKey);
const gpsDID = new DID(sensorGPSKeypair.publicKey);

userDID.define('myModel', {
  name: 'Alice',
  bithday: '03/08/1910'
});

carDID.define('myModel', {
  value: '6sd8f68sd67',
  power: {
    engine: '2.5',
    hp: '220 hp'
  },
  consumption: '10.8 l'
});

gpsDID.define('myModel', {
  gps_identifier: 'a32bc2440da012'
});

describe(`Create a digital twin of car`, () => {
  test(`Create a user DID`, async done => {
    const asset = await userDID.models.myModel.create({
      keypair: aliceKeypair
    });

    expect(asset.id).toBeDefined();
    done();
  });

  test(`Create a car DID`, async done => {
    const asset = await carDID.models.myModel.create({
      keypair: aliceKeypair
    });

    expect(asset.id).toBeDefined();
    done();
  });

  test(`Create a gps DID`, async done => {
    const asset = await gpsDID.models.myModel.create({
      keypair: carKeypair,
      data: {
        mileage: 0
      }
    });
    gpsDID.id = asset.id;
    expect(asset.id).toBeDefined();
    done();
  });

  test('Update  mileage', async done => {
    const assets = await gpsDID.models.myModel.retrieve(gpsDID.id);
    const updatedAsset = await assets[0].append({
      toPublicKey: carKeypair.publicKey,
      keypair: carKeypair,
      data: { mileage: (assets[0].data.mileage += 1) }
    });
    gpsDID.mileage = updatedAsset.data.newMileage;
    done();
  });
});
