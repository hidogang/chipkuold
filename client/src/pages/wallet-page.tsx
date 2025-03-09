import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Copy, IndianRupee } from "lucide-react";

const rechargeSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  transactionId: z.string().min(1, "Transaction ID is required"),
  currency: z.enum(["INR", "USDT"]),
});

const withdrawalSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.enum(["INR", "USDT"]),
  bankDetails: z.object({
    accountNumber: z.string().min(9, "Invalid account number"),
    ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  }),
});

export default function WalletPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const rechargeForm = useForm({
    resolver: zodResolver(rechargeSchema),
    defaultValues: {
      amount: 0,
      transactionId: "",
      currency: "INR" as const,
    },
  });

  const withdrawalForm = useForm({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
      currency: "INR" as const,
      bankDetails: {
        accountNumber: "",
        ifsc: "",
      },
    },
  });

  const rechargeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof rechargeSchema>) => {
      const res = await apiRequest("POST", "/api/wallet/recharge", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Recharge Requested",
        description: "Your recharge request has been submitted for verification.",
      });
      rechargeForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Recharge Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const withdrawalMutation = useMutation({
    mutationFn: async (data: z.infer<typeof withdrawalSchema>) => {
      const res = await apiRequest("POST", "/api/wallet/withdraw", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Withdrawal Initiated",
        description: "Your withdrawal request has been processed.",
      });
      withdrawalForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCopyUPI = () => {
    navigator.clipboard.writeText("farm.game@upi");
    toast({
      title: "UPI ID Copied",
      description: "The UPI ID has been copied to your clipboard.",
    });
  };

  const handleCopyUSDT = () => {
    navigator.clipboard.writeText("TRX8nHHo2Jd7H9ZwKhh6h8h");
    toast({
      title: "USDT Address Copied",
      description: "The USDT TRC20 address has been copied to your clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Wallet</h1>
        <div className="text-right space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">INR Balance</p>
            <p className="text-2xl font-bold">₹{user?.balance || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">USDT Balance</p>
            <p className="text-2xl font-bold">${user?.usdtBalance || 0}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="recharge">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recharge">Recharge</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
        </TabsList>

        <TabsContent value="recharge">
          <Card>
            <CardHeader>
              <CardTitle>Recharge Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-primary/10 p-4 rounded-lg text-center space-y-2">
                    <QrCode className="h-40 w-40 mx-auto" />
                    <p className="text-sm font-medium">Scan QR to pay</p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleCopyUPI}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy UPI ID: farm.game@upi
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleCopyUSDT}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy USDT Address (TRC20)
                  </Button>
                </div>

                <Form {...rechargeForm}>
                  <form
                    onSubmit={rechargeForm.handleSubmit((data) =>
                      rechargeMutation.mutate(data)
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={rechargeForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <FormControl>
                            <select
                              className="w-full p-2 border rounded"
                              {...field}
                            >
                              <option value="INR">INR</option>
                              <option value="USDT">USDT</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={rechargeForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
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
                    <FormField
                      control={rechargeForm.control}
                      name="transactionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction ID</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={rechargeMutation.isPending}
                    >
                      <IndianRupee className="mr-2 h-4 w-4" />
                      Recharge Now
                    </Button>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Funds</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...withdrawalForm}>
                <form
                  onSubmit={withdrawalForm.handleSubmit((data) =>
                    withdrawalMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={withdrawalForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <select
                            className="w-full p-2 border rounded"
                            {...field}
                          >
                            <option value="INR">INR</option>
                            <option value="USDT">USDT</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={withdrawalForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
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
                  <FormField
                    control={withdrawalForm.control}
                    name="bankDetails.accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={withdrawalForm.control}
                    name="bankDetails.ifsc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IFSC Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={withdrawalMutation.isPending}
                  >
                    Withdraw Funds
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