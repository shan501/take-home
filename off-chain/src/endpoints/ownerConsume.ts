import { Data, Constr, Lucid } from "lucid-cardano";
import { OwnerConsumeTxConfig, getValidators } from "../core/index.js";

export async function ownerConsumeTx(
  lucid: Lucid,
  ownerConsumeTxConfig: OwnerConsumeTxConfig
) {
  try {
    const { validator } = getValidators(lucid);

    const consumerRedeemer = Data.to(new Constr(0, [1n]));

    const tx = lucid.newTx();

    // Add signature
    const completedTx = await tx
      .collectFrom(ownerConsumeTxConfig.UTxOs, consumerRedeemer)
      .attachSpendingValidator(validator)
      .addSignerKey(ownerConsumeTxConfig.ownerPubKeyHash)
      .complete();

    return {
      type: "success",
      tx: completedTx,
    };
  } catch (error) {
    if (error instanceof Error) return { type: "error", error: error };

    return { type: "error", error: new Error(`${JSON.stringify(error)}`) };
  }
}
