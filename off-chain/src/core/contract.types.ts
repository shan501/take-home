import { Data } from "lucid-cardano";

export const OwnerConsumeDatumSchema = Data.Object({
  ownerPubKeyHash: Data.Bytes(),
});
export type OwnerConsumeDatum = Data.Static<typeof OwnerConsumeDatumSchema>;
export const OwnerConsumeDatum =
  OwnerConsumeDatumSchema as unknown as OwnerConsumeDatum;
