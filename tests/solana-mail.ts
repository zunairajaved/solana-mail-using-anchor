import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolanaMail } from "../target/types/solana_mail";
const { SystemProgram } = anchor.web3;
import assert from "assert";
describe("solana-mail", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.local();
  anchor.setProvider(provider);
  let _baseAccount: anchor.web3.Keypair;
  const program = anchor.workspace.SolanaMail as Program<SolanaMail>;
  it("creates a base account for mails", async () => {
    const baseAccount = anchor.web3.Keypair.generate();
    const receiver = anchor.web3.Keypair.generate();
    // call the initialize function via RPC
    const tx = await program.rpc.initialize({
      accounts: {
        mailAccount: baseAccount.publicKey,
        sender : provider.wallet.publicKey,
        receiver: receiver.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount],
    });
    // fetch the base account
    const account = await program.account.mailAccount.fetch(
      baseAccount.publicKey
    );

    // gmCount is a "big number" type, so we need to convert it to a string
    assert.equal(account.gmCount.toString(), "0");

    _baseAccount = baseAccount;
  });

  it("receives and saves a mail", async () => {
    const subject = "gm wagmi";
    const body = "testing mail dapp";
    const sender = provider.wallet.publicKey;
    const receiver = anchor.web3.Keypair.generate();
    // const baseAccount = anchor.web3.Keypair.generate();
    // fetch the base account and cache how many messages are there
    const accountBefore = await program.account.mailAccount.fetch(
      _baseAccount.publicKey
    );
    const gmCountBefore = accountBefore.gmCount;
    console.log("before",gmCountBefore);

    // call the sayGm function with message
    const tx = await program.rpc.sendMail(subject,body, {
      accounts: {
        mailAccount: _baseAccount.publicKey,
        sender:sender,
        receiver:receiver.publicKey
      },
    });

    // fetch the base account again and check that the gmCount has increased
    const accountAfter = await program.account.mailAccount.fetch(
      _baseAccount.publicKey
    );
    const gmCountAfter = accountAfter.gmCount;
    console.log("after",gmCountAfter);
    assert.equal(gmCountAfter.sub(gmCountBefore).toString(), "1");

    // fetch the gmList and check the value of the first message
    const gmList = accountAfter.sent;
    console.log(gmList);
    assert.equal(gmList[0].subject, subject);
    // assert.equal(gmList[0].receiver.equals(receiver), true); // user is an object, we can't just compare objects in JS
    assert.equal(gmList[0].timestamp.gt(new anchor.BN(0)), true); // just a loose check to see if the timestamp is greater than 0
  
});
});
