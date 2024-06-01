import { UTxO } from "lucid-cardano";

export type OwnerConsumeTxConfig = {
  UTxOs: UTxO[];
  ownerPubKeyHash: string;
};
