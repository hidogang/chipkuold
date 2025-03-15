import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Transaction, GamePrices } from "@shared/schema";
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
import { Users, ArrowDownToLine, ArrowUpFromLine, Settings } from "lucide-react";
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

const priceSchema = z.object({
  waterBucketPrice: z.number().min(0, "Price cannot be negative"),
  wheatBagPrice: z.number().min(0, "Price cannot be negative"),
  eggPrice: z.number().min(0, "Price cannot be negative"),
  babyChickenPrice: z.number().min(0, "Price cannot be negative"),
  regularChickenPrice: z.number().min(0, "Price cannot be negative"),
  goldenChickenPrice: z.number().min(0, "Price cannot be negative"),
  withdrawalTaxPercentage: z.number().min(0, "Tax cannot be negative").max(100, "Tax cannot exceed 100%"),
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

  const pricesQuery = useQuery<GamePrices>({
    queryKey: ["/api/admin/prices"],
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

  const priceForm = useForm<z.infer<typeof priceSchema>>({
    resolver: zodResolver(priceSchema),
    defaultValues: {
      waterBucketPrice: 0,
      wheatBagPrice: 0,
      eggPrice: 0,
      babyChickenPrice: 0,
      regularChickenPrice: 0,
      goldenChickenPrice: 0,
      withdrawalTaxPercentage: 0,
    },
    values: pricesQuery.data || undefined,
  });

  const updatePricesMutation = useMutation({
    mutationFn: async (data: z.infer<typeof priceSchema>) => {
      const res = await apiRequest("POST", "/api/admin/prices", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prices"] });
      toast({
        title: "Success",
        description: "Game prices updated successfully",
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


  if (statsQuery.isLoading || transactionsQuery.isLoading || withdrawalRequestsQuery.isLoading || pricesQuery.isLoading) {
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
          <TabsTrigger value="prices">Game Settings</TabsTrigger>
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
                      <TableCell className="font-mono text-xs truncate max-w-[150px]">
                        {transaction.transactionId || transaction.id.toString()}
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
                                  transactionId: withdrawal.transactionId || withdrawal.id.toString(),
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
                                  transactionId: withdrawal.transactionId || withdrawal.id.toString(),
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

        <TabsContent value="prices">
          <Card>
            <CardHeader>
              <CardTitle>Game Prices Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...priceForm}>
                <form
                  onSubmit={priceForm.handleSubmit((data) =>
                    updatePricesMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Resource Prices</h3>
                      <FormField
                        control={priceForm.control}
                        name="waterBucketPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Water Bucket Price (USDT)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={priceForm.control}
                        name="wheatBagPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Wheat Bag Price (USDT)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={priceForm.control}
                        name="eggPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Egg Price (USDT)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Chicken Prices</h3>
                      <FormField
                        control={priceForm.control}
                        name="babyChickenPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Baby Chicken Price (USDT)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={priceForm.control}
                        name="regularChickenPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Regular Chicken Price (USDT)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={priceForm.control}
                        name="goldenChickenPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Golden Chicken Price (USDT)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-4">Withdrawal Settings</h3>
                    <FormField
                      control={priceForm.control}
                      name="withdrawalTaxPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Withdrawal Tax Percentage (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="mt-6"
                    disabled={updatePricesMutation.isPending}
                  >
                    {updatePricesMutation.isPending ? (
                      "Saving Changes..."
                    ) : (
                      "Save Game Settings"
                    )}
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