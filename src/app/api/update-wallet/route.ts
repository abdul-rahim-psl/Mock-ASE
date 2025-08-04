import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { updateWalletIdByIBAN } from '@/lib/data-postgres';

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    
    // Extract the parameters from the request body
    const { iban, walletId } = body;
    
    // Validate required parameters
    if (!iban || !walletId) {
      logger.error('Missing required parameters: iban and walletId must be provided');
      return NextResponse.json(
        { error: 'Missing required parameters', details: 'Both iban and walletId must be provided' },
        { status: 400 }
      );
    }
    
    logger.user(`API: /update-wallet - Updating wallet ID for IBAN: ${iban} to ${walletId}`);
    
    // Attempt to update the wallet ID
    const user = await updateWalletIdByIBAN(iban, walletId);
    
    if (!user) {
      logger.error(`Update failed: User with IBAN ${iban} not found`);
      return NextResponse.json(
        { error: 'User not found', details: 'No user was found with the specified IBAN' },
        { status: 404 }
      );
    }
    
    logger.success(`Wallet ID updated successfully for user ${user.name}`);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Wallet ID updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        walletId: user.walletId,
        iban: user.iban,
        balance: user.balance
      }
    });
  } catch (error) {
    logger.error(`API error in update-wallet route: ${error}`);
    return NextResponse.json(
      { error: 'Failed to update wallet ID', details: String(error) },
      { status: 500 }
    );
  }
}
