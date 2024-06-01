import { expect, test, beforeEach, describe } from "vitest";
import { Data, Emulator, Lucid } from "lucid-cardano";
import {
  getValidators,
  generateAccountSeedPhrase,
  OwnerConsumeDatum,
  getOwnerUTxOsAtScript,
  ownerConsumeTx,
  OwnerConsumeTxConfig,
} from "../src/index.ts";

type LucidContext = {
  lucid: Lucid;
  users: any;
  emulator: Emulator;
};

beforeEach<LucidContext>(async (context) => {
  context.users = {
    account1: await generateAccountSeedPhrase({
      lovelace: BigInt(100_000_000),
    }),
    account2: await generateAccountSeedPhrase({
      lovelace: BigInt(100_000_000),
    }),
  };

  context.emulator = new Emulator([
    context.users.account1,
    context.users.account2,
  ]);
  context.lucid = await Lucid.new(context.emulator);
});

describe("All Flows Work", () => {
  test<LucidContext>("Correct owner can consume transaciont", async ({
    lucid,
    users,
    emulator,
  }) => {
    const { validatorAddress } = getValidators(lucid);

    lucid.selectWalletFromSeed(users.account1.seedPhrase);

    const ownerPubKeyHash = lucid.utils.getAddressDetails(
      await lucid.wallet.address()
    ).paymentCredential?.hash;

    const ownerConsumerDatum: OwnerConsumeDatum = {
      ownerPubKeyHash: ownerPubKeyHash as string,
    };
    const datum = Data.to(ownerConsumerDatum, OwnerConsumeDatum);

    const lockUTxOTx = await lucid
      .newTx()
      .payToContract(
        validatorAddress,
        { inline: datum },
        {
          lovelace: BigInt(10000000),
        }
      )
      .complete();

    const signedTx = await lockUTxOTx.sign().complete();
    await signedTx.submit();

    emulator.awaitBlock(100);

    const ownerUTxOs = await getOwnerUTxOsAtScript(
      ownerPubKeyHash as string,
      lucid
    );

    const ownerConsumeTxConfig: OwnerConsumeTxConfig = {
      UTxOs: ownerUTxOs,
      ownerPubKeyHash: ownerPubKeyHash as string,
    };

    const consumeTx = await ownerConsumeTx(lucid, ownerConsumeTxConfig);
    expect(consumeTx.type).toBe("success");

    const ownerConsumeCBOR = consumeTx.tx?.toString();
    const ownerConsumeSigned = await lucid
      .fromTx(ownerConsumeCBOR as string)
      .sign()
      .complete();

    await ownerConsumeSigned.submit();
  });

  test<LucidContext>("Wrong owner can not consume transaciont", async ({
    lucid,
    users,
    emulator,
  }) => {
    const { validatorAddress } = getValidators(lucid);

    lucid.selectWalletFromSeed(users.account1.seedPhrase);
    const ownerPubKeyHash = lucid.utils.getAddressDetails(
      await lucid.wallet.address()
    ).paymentCredential?.hash;

    const ownerConsumerDatum: OwnerConsumeDatum = {
      ownerPubKeyHash: ownerPubKeyHash as string,
    };
    const datum = Data.to(ownerConsumerDatum, OwnerConsumeDatum);

    const lockUTxOTx = await lucid
      .newTx()
      .payToContract(
        validatorAddress,
        { inline: datum },
        {
          lovelace: BigInt(10000000),
        }
      )
      .complete();

    const signedTx = await lockUTxOTx.sign().complete();
    await signedTx.submit();

    emulator.awaitBlock(100);

    const ownerUTxOs = await getOwnerUTxOsAtScript(
      ownerPubKeyHash as string,
      lucid
    );

    lucid.selectWalletFromSeed(users.account2.seedPhrase);
    const notOwnerPubKeyHash = lucid.utils.getAddressDetails(
      await lucid.wallet.address()
    ).paymentCredential?.hash;

    const ownerConsumeTxConfig: OwnerConsumeTxConfig = {
      UTxOs: ownerUTxOs,
      ownerPubKeyHash: notOwnerPubKeyHash as string,
    };

    const consumeTx = await ownerConsumeTx(lucid, ownerConsumeTxConfig);
    expect(consumeTx.type).toBe("error");
  });
});
