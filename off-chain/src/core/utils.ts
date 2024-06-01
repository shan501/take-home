import {
  Assets,
  Data,
  Lucid,
  SpendingValidator,
  generateSeedPhrase,
} from "lucid-cardano";
import { validatorCBOR } from "./constants.js";
import { OwnerConsumeDatum } from "./contract.types.js";

export function getValidators(lucid: Lucid) {
  const validator: SpendingValidator = {
    type: "PlutusV2",
    script: validatorCBOR,
  };

  const validatorAddress = lucid.utils.validatorToAddress(validator);

  return { validator, validatorAddress };
}

export const generateAccountSeedPhrase = async (assets: Assets) => {
  const seedPhrase = generateSeedPhrase();
  return {
    seedPhrase,
    address: await (await Lucid.new(undefined, "Custom"))
      .selectWalletFromSeed(seedPhrase)
      .wallet.address(),
    assets,
  };
};

export async function getOwnerUTxOsAtScript(
  ownerPubKeyHash: string,
  lucid: Lucid
) {
  const { validatorAddress } = getValidators(lucid);
  const utxos = await lucid.utxosAt(validatorAddress);

  const availableOffers = utxos.filter((utxo) => {
    try {
      const datum = Data.castFrom(
        Data.from(utxo.datum as string),
        OwnerConsumeDatum
      );
      return datum.ownerPubKeyHash === ownerPubKeyHash;
    } catch (error) {
      return false;
    }
  });

  return availableOffers;
}
