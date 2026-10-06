import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';

export interface Milestone {
  id: string;
  description: string;
  amountLamports: number;
  completed: boolean;
  verified: boolean;
  verificationHash?: string;
}

export interface EscrowAccountState {
  escrowId: string;
  client: string;      // Buyer agent or human public key
  contractor: string;  // Worker agent public key
  totalAmountLamports: number;
  remainingAmountLamports: number;
  milestones: Milestone[];
  isClosed: boolean;
  deadlineUnix: number;
}

export class AgentEscrowManager {
  private connection: Connection;

  constructor(rpcUrl: string = 'https://api.devnet.solana.com') {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  public getConnection(): Connection {
    return this.connection;
  }

  /**
   * Initializes a programmatic milestone escrow between Client and Contractor.
   */
  public createEscrowContract(
    clientPubkey: PublicKey,
    contractorPubkey: PublicKey,
    milestones: { id: string; description: string; amountLamports: number }[],
    durationSeconds: number = 86400
  ): { escrowKeypair: Keypair; state: EscrowAccountState } {
    const escrowKeypair = Keypair.generate();
    const totalAmount = milestones.reduce((sum, m) => sum + m.amountLamports, 0);

    const state: EscrowAccountState = {
      escrowId: escrowKeypair.publicKey.toBase58(),
      client: clientPubkey.toBase58(),
      contractor: contractorPubkey.toBase58(),
      totalAmountLamports: totalAmount,
      remainingAmountLamports: totalAmount,
      milestones: milestones.map(m => ({ ...m, completed: false, verified: false })),
      isClosed: false,
      deadlineUnix: Math.floor(Date.now() / 1000) + durationSeconds
    };

    return { escrowKeypair, state };
  }

  /**
   * Builds the funding transaction to deposit funds into the escrow account.
   */
  public async fundEscrow(
    clientSigner: Keypair,
    escrowKeypair: Keypair,
    amountLamports: number
  ): Promise<string> {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: clientSigner.publicKey,
        toPubkey: escrowKeypair.publicKey,
        lamports: amountLamports
      })
    );

    return await sendAndConfirmTransaction(this.connection, transaction, [clientSigner]);
  }

  /**
   * Verifies and releases payment for a completed milestone from Escrow to Contractor.
   */
  public async releaseMilestone(
    escrowSigner: Keypair,
    contractorPubkey: PublicKey,
    state: EscrowAccountState,
    milestoneId: string,
    verificationProof: string
  ): Promise<{ txHash: string; milestone: Milestone }> {
    if (state.isClosed) {
      throw new Error(`Escrow ${state.escrowId} is already closed.`);
    }

    const milestone = state.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      throw new Error(`Milestone ${milestoneId} not found in escrow.`);
    }

    if (milestone.completed) {
      throw new Error(`Milestone ${milestoneId} is already paid.`);
    }

    if (state.remainingAmountLamports < milestone.amountLamports) {
      throw new Error(`Insufficient funds in escrow. Needed: ${milestone.amountLamports}, Available: ${state.remainingAmountLamports}`);
    }

    // Transfer milestone payment to contractor
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: escrowSigner.publicKey,
        toPubkey: contractorPubkey,
        lamports: milestone.amountLamports
      })
    );

    const txHash = await sendAndConfirmTransaction(this.connection, transaction, [escrowSigner]);

    milestone.completed = true;
    milestone.verified = true;
    milestone.verificationHash = verificationProof;
    state.remainingAmountLamports -= milestone.amountLamports;

    if (state.remainingAmountLamports === 0 || state.milestones.every(m => m.completed)) {
      state.isClosed = true;
    }

    return { txHash, milestone };
  }

  /**
   * Auto-refunds remaining funds to the client if the milestone expired or failed.
   */
  public async refundClient(
    escrowSigner: Keypair,
    clientPubkey: PublicKey,
    state: EscrowAccountState,
    force: boolean = false
  ): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    if (!force && now < state.deadlineUnix) {
      throw new Error(`Cannot refund before deadline: ${new Date(state.deadlineUnix * 1000).toISOString()}`);
    }

    if (state.remainingAmountLamports <= 0) {
      throw new Error('No remaining balance to refund.');
    }

    const refundAmount = state.remainingAmountLamports;
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: escrowSigner.publicKey,
        toPubkey: clientPubkey,
        lamports: refundAmount
      })
    );

    const txHash = await sendAndConfirmTransaction(this.connection, transaction, [escrowSigner]);
    state.remainingAmountLamports = 0;
    state.isClosed = true;

    return txHash;
  }
}
