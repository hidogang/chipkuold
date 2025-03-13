import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Transaction } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface AdminStats {
  todayLogins: number;
  yesterdayLogins: number;
  totalUsers: number;
  todayDeposits: number;
  totalDeposits: number;
  pendingWithdrawals: number;
}

interface WalletAddress {
  network: string;
  address: string;
}

const walletAddressSchema = z.object({
  ethereumAddress: z.string().min(1, "Ethereum address is required"),
  tronAddress: z.string().min(1, "Tron address is required"),
  bnbAddress: z.string().min(1, "BNB address is required"),
});

export default function AdminPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Redirect if not admin
  if (!user?.isAdmin) {
    return <div>Access Denied</div>;
  }

  const statsQuery = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const transactionsQuery = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions"],
  });

  const withdrawalRequestsQuery = useQuery<Transaction[]>({
    queryKey: ["/api/admin/withdrawals"],
  });

  const walletAddressesQuery = useQuery<WalletAddress[]>({
    queryKey: ["/api/admin/wallet-addresses"],
  });

  const walletForm = useForm({
    resolver: zodResolver(walletAddressSchema),
    defaultValues: {
      ethereumAddress: "0x2468BD1f5B493683b6550Fe331DC39CC854513D2",
      tronAddress: "TS59qaK6YfN7fvWwffLuvKzzpXDGTBh4dq",
      bnbAddress: "bnb1uljaarnxpaug9uvxhln6dyg6w0zeasctn4puvp",
    },
  });

  const updateWalletAddressesMutation = useMutation({
    mutationFn: async (data: z.infer<typeof walletAddressSchema>) => {
      const res = await apiRequest("POST", "/api/admin/wallet-addresses", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wallet-addresses"] });
      toast({
        title: "Success",
        description: "Wallet addresses updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({
      transactionId,
      status,
    }: {
      transactionId: string;
      status: string;
    }) => {
      const res = await apiRequest("POST", "/api/admin/transactions/update", {
        transactionId,
        status,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Transaction status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (statsQuery.isLoading || transactionsQuery.isLoading || withdrawalRequestsQuery.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const stats = statsQuery.data || {
    todayLogins: 0,
    yesterdayLogins: 0,
    totalUsers: 0,
    todayDeposits: 0,
    totalDeposits: 0,
    pendingWithdrawals: 0,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Activity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-2xl font-bold">{stats.todayLogins}</span>
                <span className="text-xs text-muted-foreground ml-2">Today's Logins</span>
              </div>
              <div>
                <span className="text-xl font-bold">{stats.yesterdayLogins}</span>
                <span className="text-xs text-muted-foreground ml-2">Yesterday's Logins</span>
              </div>
              <div>
                <span className="text-xl font-bold">{stats.totalUsers}</span>
                <span className="text-xs text-muted-foreground ml-2">Total Users</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deposits</CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-2xl font-bold">${stats.todayDeposits}</span>
                <span className="text-xs text-muted-foreground ml-2">Today's Deposits</span>
              </div>
              <div>
                <span className="text-xl font-bold">${stats.totalDeposits}</span>
                <span className="text-xs text-muted-foreground ml-2">Total Deposits</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Withdrawals</CardTitle>
            <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div>
              <span className="text-2xl font-bold">{stats.pendingWithdrawals}</span>
              <span className="text-xs text-muted-foreground ml-2">Pending Requests</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
          <TabsTrigger value="wallet">Wallet Addresses</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount (USDT)</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsQuery.data?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.createdAt), "PPp")}
                      </TableCell>
                      <TableCell>{transaction.userId}</TableCell>
                      <TableCell className="capitalize">{transaction.type}</TableCell>
                      <TableCell>${transaction.amount}</TableCell>
                      <TableCell className="font-mono">
                        {transaction.transactionId || "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {transaction.status === "pending" && (
                          <div className="space-x-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateTransactionMutation.mutate({
                                  transactionId: transaction.transactionId!,
                                  status: "completed",
                                })
                              }
                            >
                              Verify & Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                updateTransactionMutation.mutate({
                                  transactionId: transaction.transactionId!,
                                  status: "rejected",
                                })
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount (USDT)</TableHead>
                    <TableHead>USDT Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawalRequestsQuery.data?.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        {format(new Date(withdrawal.createdAt), "PPp")}
                      </TableCell>
                      <TableCell>{withdrawal.userId}</TableCell>
                      <TableCell>${withdrawal.amount}</TableCell>
                      <TableCell>
                        <div className="text-sm font-mono truncate max-w-[200px]">
                          {withdrawal.bankDetails 
                            ? JSON.parse(withdrawal.bankDetails)?.usdtAddress || "Not provided" 
                            : "Not provided"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            withdrawal.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : withdrawal.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {withdrawal.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {withdrawal.status === "pending" && (
                          <div className="space-x-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateTransactionMutation.mutate({
                                  transactionId: withdrawal.id.toString(),
                                  status: "completed",
                                })
                              }
                            >
                              Process & Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                updateTransactionMutation.mutate({
                                  transactionId: withdrawal.id.toString(),
                                  status: "rejected",
                                })
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Addresses Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...walletForm}>
                <form
                  onSubmit={walletForm.handleSubmit((data) =>
                    updateWalletAddressesMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={walletForm.control}
                    name="ethereumAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>USDT Ethereum Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={walletForm.control}
                    name="tronAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>USDT Tron Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={walletForm.control}
                    name="bnbAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>USDT BNB Beacon Chain Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={updateWalletAddressesMutation.isPending}
                  >
                    Save Wallet Addresses
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}