use aiken/hash.{Blake2b_224, Hash}
use aiken/list
use aiken/transaction.{ScriptContext}
use aiken/transaction/credential.{VerificationKey}

type AddressHash =
  Hash<Blake2b_224, VerificationKey>

type Datum {
  owner_address_hash: AddressHash,
}

type Redeemer {
  action: Int,
}

validator {
  fn consume(datum: Datum, _redeemer: Redeemer, ctx: ScriptContext) -> Bool {
    // To consume the UTxO, the transaction must be signed by the owner
    let must_be_signed_by_owner =
      list.has(ctx.transaction.extra_signatories, datum.owner_address_hash)
    must_be_signed_by_owner
  }
}
