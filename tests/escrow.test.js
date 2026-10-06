import test from 'node:test';
import assert from 'node:assert/strict';
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AgentEscrowManager } from '../dist/escrow.js';

test('AgentEscrowManager: creates valid milestone escrow state', () => {
  const manager = new AgentEscrowManager();
  const client = Keypair.generate();
  const contractor = Keypair.generate();

  const milestones = [
    { id: 'step_1', description: 'Architecture & Design', amountLamports: 1 * LAMPORTS_PER_SOL },
    { id: 'step_2', description: 'Implementation & Tests', amountLamports: 2 * LAMPORTS_PER_SOL }
  ];

  const { escrowKeypair, state } = manager.createEscrowContract(
    client.publicKey,
    contractor.publicKey,
    milestones,
    3600
  );

  assert.equal(state.escrowId, escrowKeypair.publicKey.toBase58());
  assert.equal(state.client, client.publicKey.toBase58());
  assert.equal(state.contractor, contractor.publicKey.toBase58());
  assert.equal(state.totalAmountLamports, 3 * LAMPORTS_PER_SOL);
  assert.equal(state.remainingAmountLamports, 3 * LAMPORTS_PER_SOL);
  assert.equal(state.milestones.length, 2);
  assert.equal(state.isClosed, false);
});

test('AgentEscrowManager: validates deadline and refund guards', async () => {
  const manager = new AgentEscrowManager();
  const client = Keypair.generate();
  const contractor = Keypair.generate();

  const milestones = [
    { id: 'task_1', description: 'Deliverable', amountLamports: 1 * LAMPORTS_PER_SOL }
  ];

  const { escrowKeypair, state } = manager.createEscrowContract(
    client.publicKey,
    contractor.publicKey,
    milestones,
    7200 // in the future
  );

  // Attempting refund before deadline without force flag must throw
  await assert.rejects(
    async () => {
      await manager.refundClient(escrowKeypair, client.publicKey, state, false);
    },
    {
      name: 'Error',
      message: /Cannot refund before deadline/
    }
  );
});
