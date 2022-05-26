use anchor_lang::prelude::*;
use borsh::{BorshDeserialize, BorshSerialize};
declare_id!("B8F4vGGVet92r68WhQuSdXno5NNpogcQ1j7Qb7UE9M5Z");

#[program]
pub mod solana_mail {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result <()>{
        // &mut means we are letting the compiler know that we are mutating this value
        let mail_account = &mut ctx.accounts.mail_account;

        mail_account.gm_count = 0;
        Ok(())
    }
    pub fn send_mail (ctx: Context<SendMail>,subject:String,body:String) ->Result<()>{

        let mail_account = &mut ctx.accounts.mail_account;

        let sender = *ctx.accounts.sender.to_account_info().key;
        let receiver = *ctx.accounts.receiver.to_account_info().key;
        
        let timestamp = Clock::get().unwrap().unix_timestamp;

        let gm = Mail {
            sender,
            receiver,
            subject,
            body,
            timestamp,
        };
        mail_account.sent.push(gm.clone());
        mail_account.inbox.push(gm.clone());
        mail_account.gm_count += 1;

        Ok(())
    }

   
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init,payer = sender ,space = 64+1024)]
    pub mail_account : Account<'info ,MailAccount>,
    #[account(mut)]
    pub sender : Signer<'info>,
    /// CHECK
    #[account(mut)]
    pub receiver : AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SendMail<'info>{
    #[account(mut)]
    pub mail_account: Account<'info , MailAccount>,
    #[account(mut)]
    pub sender : Signer<'info>,
    /// CHECK
    #[account(mut)]
    pub receiver: AccountInfo<'info>
}

#[account]
pub struct MailAccount {
    pub inbox: Vec<Mail>,
    pub sent : Vec<Mail>,
    pub gm_count: u64,
}
 #[derive(Clone,Debug,AnchorSerialize, AnchorDeserialize)]
 pub struct Mail {
     pub sender : Pubkey,
     pub receiver : Pubkey,
     pub subject : String,
     pub body : String,
     pub timestamp:i64,
 }