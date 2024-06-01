# Documentation


## How To Run
Go into the off-chain folder
```
cd off-chain
```

Install dependencies
```
npm i
```

Run the tests 
```
npm run test
```

### Overview

To ensure that only the owner of the UTxO can consume it we need to check if the transaction is signed by the owner. We will store it in the datum of the UTxO and the smart contract simply needs to check that the signature is in the transaction to approve it.

### On-Chain

The validator looks for the signtures in the transaction and compares it with the owner pub key hash in the datum

```
let must_be_signed_by_owner =
    list.has(ctx.transaction.extra_signatories, datum.owner_address_hash)
must_be_signed_by_owner
```

### Off-chain

Create function that gets all available UTxOs locked up in the contract by the owner.

```
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
```

The function to consume the transaction will take in two parameters. One of the UTxOs to consumer and the other owner publick key hash. The function needs to make sure it has add the signerKey to the transaction.
