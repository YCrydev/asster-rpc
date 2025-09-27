# Asster RPC Tester

A comprehensive Next.js application for testing all major RPC calls to the Asster network (Solana fork).

## Features

- **Real-time RPC Testing**: Test all major Solana/Asster RPC methods with live results
- **Beautiful UI**: Modern, responsive interface with gradient backgrounds and smooth animations
- **Organized Categories**: RPC methods grouped by functionality (Network Info, Blocks, Accounts, Performance, Tokens)
- **Error Handling**: Comprehensive error handling with detailed error messages
- **Connection Status**: Real-time connection status indicator
- **Batch Testing**: Run all tests at once or individual method testing
- **Results Display**: Formatted JSON results with timestamps and status indicators

## RPC Methods Tested

### Network Info
- `getVersion` - Get the current Asster version
- `getHealth` - Check network health status
- `getSlot` - Get the current slot
- `getBlockHeight` - Get the current block height
- `getEpochInfo` - Get current epoch information

### Block & Transaction Info
- `getRecentBlockhash` - Get recent blockhash (deprecated but still used)
- `getLatestBlockhash` - Get the latest blockhash
- `getFirstAvailableBlock` - Get first available block
- `getGenesisHash` - Get the genesis hash

### Account & Balance Info
- `getAccountInfo` - Get account info for system program account
- `getBalance` - Get balance for system program account
- `getMinimumBalanceForRentExemption` - Get minimum balance for rent exemption

### Performance & Stats
- `getRecentPerformanceSamples` - Get recent performance samples
- `getTransactionCount` - Get total transaction count
- `getSupply` - Get current supply information

### Token & Program Info
- `getTokenSupply` - Get token supply information
- `getProgramAccounts` - Get program accounts for System Program

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Configuration

The application is configured to connect to the Asster RPC endpoint:
```
http://rpc.asster.lol/
```

To change the RPC endpoint, modify the `ASSTER_RPC_URL` constant in `src/app/page.tsx`.

## Dependencies

- **Next.js 15** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **@solana/web3.js** - Solana/Asster RPC client
- **@solana/spl-token** - SPL token utilities
- **lucide-react** - Beautiful icons

## Usage

1. **Connection Status**: Check the connection indicator at the top of the page
2. **Individual Tests**: Click the play button on any RPC method card to test individually
3. **Batch Testing**: Use the "Run All Tests" button to execute all RPC methods
4. **Results**: View formatted results, errors, and timestamps for each method
5. **Categories**: Browse methods organized by functionality

## Network Information

This application tests against the Asster network, which is a fork of Solana. The RPC endpoint `http://rpc.asster.lol/` provides access to all standard Solana RPC methods.

## Development

Built with modern web technologies:
- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for responsive design
- Solana web3.js for blockchain interactions

## License

MIT License - feel free to use this project as a template for your own RPC testing needs.
