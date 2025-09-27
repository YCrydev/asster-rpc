'use client';

import { useState, useEffect } from 'react';
import { Play, Loader2, CheckCircle, XCircle, Info, Network, Zap, Database, Users, Coins } from 'lucide-react';
import axios from 'axios';

// Asster RPC endpoint
const ASSTER_RPC_URL = 'http://rpc.asster.lol/';

interface RPCResult {
  method: string;
  result: unknown;
  error?: string;
  loading: boolean;
  timestamp?: string;
}

export default function AssterRPCTester() {
  const [connection, setConnection] = useState<boolean>(false);
  const [results, setResults] = useState<Record<string, RPCResult>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [corsStatus, setCorsStatus] = useState<{ working: boolean; error?: string } | null>(null);
  const [accountAddress, setAccountAddress] = useState('11111111111111111111111111111112');
  
  // Simple validation for account address
  const isValidAccountAddress = (address: string): boolean => {
    try {
      // Basic checks: length and base58 characters
      return address.length >= 32 && address.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(address);
    } catch {
      return false;
    }
  };

  useEffect(() => {
    // Don't use Solana Connection due to CORS headers
    setConnection(true); // Just set a truthy value to enable UI
    testConnection();
    testCORS();
  }, []);

  const testConnection = async () => {
    try {
      // Use Axios instead of Solana Connection to avoid CORS issues
      const response = await axios.post(ASSTER_RPC_URL, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getVersion'
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });
      
      if (response.data.result) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      setIsConnected(false);
      console.error('Connection failed:', error);
    }
  };

  const testCORS = async () => {
    try {
      // Test basic CORS with a simple health check using Axios
      const response = await axios.get(`${ASSTER_RPC_URL}health`, {
        timeout: 5000
      });
      
      if (response.status === 200) {
        setCorsStatus({ working: true });
      } else {
        setCorsStatus({ working: false, error: `HTTP ${response.status}: ${response.statusText}` });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setCorsStatus({ working: false, error: `HTTP ${error.response.status}: ${error.response.statusText}` });
        } else if (error.request) {
          setCorsStatus({ working: false, error: 'Network request failed - possible CORS issue' });
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('CORS') || errorMessage.includes('cors')) {
          setCorsStatus({ working: false, error: 'CORS policy blocks this request' });
        } else {
          setCorsStatus({ working: false, error: errorMessage });
        }
      }
    }
  };

  const updateResult = (method: string, updates: Partial<RPCResult>) => {
    setResults(prev => ({
      ...prev,
      [method]: {
        ...prev[method],
        method,
        ...updates,
        timestamp: new Date().toLocaleTimeString()
      }
    }));
  };

  // Helper function for JSON-RPC calls using Axios
  const makeRPCCall = async (method: string, params: unknown[] = []) => {
    try {
      const response = await axios.post(ASSTER_RPC_URL, {
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 10000),
        method,
        params
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000 // 10 second timeout
      });
      
      if (response.data.error) {
        throw new Error(response.data.error.message || 'RPC Error');
      }
      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
        } else if (error.request) {
          // Request made but no response received
          throw new Error('Network error - no response received');
        }
      }
      // Something else happened
      throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const executeRPC = async (method: string, rpcCall: () => Promise<unknown>) => {
    if (!connection) return;

    updateResult(method, { loading: true, error: undefined });
    
    try {
      const result = await rpcCall();
      updateResult(method, { 
        result, 
        loading: false,
        error: undefined 
      });
    } catch (error) {
      updateResult(method, { 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        result: null 
      });
    }
  };

  const rpcMethods = [
    {
      category: 'Network Info',
      icon: Network,
      methods: [

        {
          name: 'getHealth',
          description: 'Check network health status (JSON-RPC)',
          call: () => makeRPCCall('getHealth')
        },
        {
          name: 'healthCheck',
          description: 'Check health endpoint (/health)',
          call: async () => {
            const response = await axios.get(`${ASSTER_RPC_URL}health`, {
              timeout: 5000
            });
            if (response.status === 200) {
              return { status: 'healthy', response: response.data || 'OK' };
            } else {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
          }
        },
        {
          name: 'getSlot',
          description: 'Get the current slot',
          call: () => makeRPCCall('getSlot')
        },
        {
          name: 'getBlockHeight',
          description: 'Get the current block height',
          call: () => makeRPCCall('getBlockHeight')
        },
        {
          name: 'getEpochInfo',
          description: 'Get current epoch information',
          call: () => makeRPCCall('getEpochInfo')
        }
      ]
    },
    {
      category: 'Block & Transaction Info',
      icon: Database,
      methods: [

        {
          name: 'getLatestBlockhash',
          description: 'Get the latest blockhash',
          call: () => makeRPCCall('getLatestBlockhash')
        },
        {
          name: 'getFirstAvailableBlock',
          description: 'Get first available block',
          call: () => makeRPCCall('getFirstAvailableBlock')
        },
        {
          name: 'getGenesisHash',
          description: 'Get the genesis hash',
          call: () => makeRPCCall('getGenesisHash')
        }
      ]
    },
    {
      category: 'Account & Balance Info',
      icon: Users,
      methods: [
        {
          name: 'getAccountInfo',
          description: 'Get account info for any account address',
          call: () => makeRPCCall('getAccountInfo', [accountAddress])
        },
        {
          name: 'getBalance',
          description: 'Get balance for system program account',
          call: () => makeRPCCall('getBalance', ['11111111111111111111111111111112'])
        },
        {
          name: 'getMinimumBalanceForRentExemption',
          description: 'Get minimum balance for rent exemption (0 bytes)',
          call: () => makeRPCCall('getMinimumBalanceForRentExemption', [0])
        }
      ]
    },
    {
      category: 'Performance & Stats',
      icon: Zap,
      methods: [
        {
          name: 'getRecentPerformanceSamples',
          description: 'Get recent performance samples',
          call: () => makeRPCCall('getRecentPerformanceSamples', [5])
        },
        {
          name: 'getTransactionCount',
          description: 'Get total transaction count',
          call: () => makeRPCCall('getTransactionCount')
        },
        {
          name: 'getSupply',
          description: 'Get current supply information',
          call: () => makeRPCCall('getSupply')
        }
      ]
    },
    {
      category: 'Token & Program Info',
      icon: Coins,
      methods: [
        {
          name: 'getTokenSupply',
          description: 'Get token supply (using a common mint if available)',
          call: async () => {
            try {
              // Try to get program accounts for token program
              const result = await makeRPCCall('getProgramAccounts', [
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
              ]);
              return { tokenAccountsCount: Array.isArray(result) ? result.length : 0 };
            } catch {
              return { error: 'No token accounts found or token program not available' };
            }
          }
        },
        {
          name: 'getProgramAccounts',
          description: 'Get program accounts for System Program',
          call: async () => {
            const result = await makeRPCCall('getProgramAccounts', [
              '11111111111111111111111111111112'
            ]);
            const accounts = Array.isArray(result) ? result : [];
            return { accountCount: accounts.length, accounts: accounts.slice(0, 3) };
          }
        }
      ]
    }
  ];

  const runAllTests = async () => {
    for (const category of rpcMethods) {
      for (const method of category.methods) {
        await executeRPC(method.name, method.call);
        // Small delay to avoid overwhelming the RPC
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  };

  const formatResult = (result: unknown): string => {
    if (result === null || result === undefined) return 'null';
    if (typeof result === 'object') {
      return JSON.stringify(result, null, 2);
    }
    return String(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Asster RPC Tester
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            Test all major RPC calls to the Asster network
          </p>
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm">
                {isConnected ? 'Connected to' : 'Disconnected from'} rpc.asster.lol
              </span>
            </div>
            {corsStatus && (
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${corsStatus.working ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <span className="text-xs text-gray-400">
                  CORS: {corsStatus.working ? 'Working' : corsStatus.error || 'Issues detected'}
                </span>
              </div>
                         )}
          </div>
         
        </div>

        {/* RPC Methods */}
        <div className="space-y-8">
          {rpcMethods.map((category) => (
            <div key={category.category} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <category.icon size={24} className="text-purple-400" />
                <h2 className="text-2xl font-semibold">{category.category}</h2>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.methods.map((method) => {
                  const result = results[method.name];
                  
                  return (
                    <div key={method.name} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{method.name}</h3>
                          <p className="text-sm text-gray-400">{method.description}</p>
                          
                          {/* Special input field for getAccountInfo */}
                          {method.name === 'getAccountInfo' && (
                            <div className="mt-2">
                              <input
                                type="text"
                                value={accountAddress}
                                onChange={(e) => setAccountAddress(e.target.value)}
                                placeholder="Enter account address"
                                className={`w-full px-3 py-2 bg-black/30 border rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none ${
                                  isValidAccountAddress(accountAddress) 
                                    ? 'border-green-400 focus:border-green-400' 
                                    : 'border-red-400 focus:border-red-400'
                                }`}
                              />
                              <div className="flex items-center justify-between mt-1">
                                <button
                                  onClick={() => setAccountAddress('11111111111111111111111111111112')}
                                  className="text-xs text-purple-400 hover:text-purple-300 underline"
                                >
                                  Reset to System Program
                                </button>
                                <div className="flex items-center gap-1">
                                  {isValidAccountAddress(accountAddress) ? (
                                    <CheckCircle size={12} className="text-green-400" />
                                  ) : (
                                    <XCircle size={12} className="text-red-400" />
                                  )}
                                  <span className={`text-xs ${isValidAccountAddress(accountAddress) ? 'text-green-400' : 'text-red-400'}`}>
                                    {isValidAccountAddress(accountAddress) ? 'Valid' : 'Invalid'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => executeRPC(method.name, method.call)}
                          disabled={!connection || result?.loading}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg transition-colors ml-3"
                        >
                          {result?.loading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Play size={16} />
                          )}
                        </button>
                      </div>
                      
                      {result && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            {result.error ? (
                              <XCircle size={16} className="text-red-400" />
                            ) : result.result !== undefined ? (
                              <CheckCircle size={16} className="text-green-400" />
                            ) : null}
                            <span className="text-xs text-gray-400">
                              {result.timestamp}
                            </span>
                          </div>
                          
                          <div className="bg-black/30 rounded p-3 max-h-40 overflow-y-auto">
                            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                              {result.error ? (
                                <span className="text-red-400">Error: {result.error}</span>
                              ) : (
                                formatResult(result.result)
                              )}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400">
          <p className="flex items-center justify-center gap-2">
            <Info size={16} />
            Testing RPC calls to Asster network at rpc.asster.lol
          </p>
          <p className="text-xs mt-2 opacity-70">
            Actual endpoint: {ASSTER_RPC_URL}
          </p>
        </div>
      </div>
    </div>
  );
}
