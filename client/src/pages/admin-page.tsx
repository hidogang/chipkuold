import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Transaction, Price } from "@shared/schema";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function AdminPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Redirect if not admin
  if (!user?.isAdmin) {
    return <div>Access Denied</div>;
  }

  const pricesQuery = useQuery<Price[]>({
    queryKey: ["/api/prices"],
  });

  const transactionsQuery = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions"],
  });

  const updatePriceMutation = useMutation({
    mutationFn: async ({ itemType, price }: { itemType: string; price: number }) => {
      const res = await apiRequest("POST", "/api/admin/prices/update", {
        itemType,
        price,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prices"] });
      toast({
        title: "Success",
        description: "Price updated successfully",
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

  const updateQRCodeMutation = useMutation({
    mutationFn: async (address: string) => {
      const res = await apiRequest("POST", "/api/admin/qrcode", { address });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "QR Code address updated successfully",
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
      toast({
        title: "Success",
        description: "Transaction status updated successfully",
      });
    },
  });

  const withdrawalTaxForm = useForm({
    resolver: zodResolver(
      z.object({
        taxPercentage: z.number().min(0).max(100),
      })
    ),
    defaultValues: {
      taxPercentage: 5,
    },
  });

  const updateWithdrawalTaxMutation = useMutation({
    mutationFn: async (data: { taxPercentage: number }) => {
      const res = await apiRequest("POST", "/api/admin/withdrawal-tax", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Withdrawal tax updated successfully",
      });
    },
  });

  const qrCodeForm = useForm({
    resolver: zodResolver(
      z.object({
        address: z.string().min(1),
      })
    ),
    defaultValues: {
      address: "TRX8nHHo2Jd7H9ZwKhh6h8h",
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <Tabs defaultValue="transactions">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="prices">Market Prices</TabsTrigger>
          <TabsTrigger value="qrcode">Payment Gateway</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
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
                    <TableHead>Amount</TableHead>
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
                      <TableCell className="capitalize">{transaction.status}</TableCell>
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
                              Approve
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

        <TabsContent value="prices">
          <Card>
            <CardHeader>
              <CardTitle>Market Prices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pricesQuery.data?.map((price) => (
                  <div key={price.id} className="flex items-center space-x-4">
                    <span className="w-40 capitalize">
                      {price.itemType.replace(/_/g, " ")}
                    </span>
                    <Input
                      type="number"
                      defaultValue={parseFloat(price.price)}
                      onChange={(e) =>
                        updatePriceMutation.mutate({
                          itemType: price.itemType,
                          price: parseFloat(e.target.value),
                        })
                      }
                      className="w-32"
                    />
                    <span>USDT</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qrcode">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...qrCodeForm}>
                <form
                  onSubmit={qrCodeForm.handleSubmit((data) =>
                    updateQRCodeMutation.mutate(data.address)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={qrCodeForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>USDT TRC20 Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Update Payment Address</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...withdrawalTaxForm}>
                <form
                  onSubmit={withdrawalTaxForm.handleSubmit((data) =>
                    updateWithdrawalTaxMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={withdrawalTaxForm.control}
                    name="taxPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Withdrawal Tax (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Update Withdrawal Tax</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
