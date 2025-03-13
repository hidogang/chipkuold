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
import { QrCode, Copy } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import BalanceBar from "@/components/balance-bar";


const rechargeSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  transactionId: z.string().min(1, "Transaction ID is required").regex(/^[A-Za-z0-9]+$/, "Transaction ID must contain only letters and numbers"),
});

const withdrawalSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  usdtAddress: z.string().min(5, "USDT address is required").max(100, "USDT address too long"),
});

export default function WalletPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Get tab from URL if present
  const params = new URLSearchParams(window.location.search);
  const defaultTab = params.get('tab') || 'recharge';

  const rechargeForm = useForm({
    resolver: zodResolver(rechargeSchema),
    defaultValues: {
      amount: 0,
      transactionId: "",
    },
  });

  const withdrawalForm = useForm({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
      usdtAddress: "",
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
        description: "Your USDT recharge request has been submitted for verification.",
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
        description: "Your USDT withdrawal request has been processed.",
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

  const handleCopyUSDT = () => {
    navigator.clipboard.writeText("TRX8nHHo2Jd7H9ZwKhh6h8h");
    toast({
      title: "USDT Address Copied",
      description: "The USDT TRC20 address has been copied to your clipboard.",
    });
  };

  const [qrCodeData, setQrCodeData] = useState("");

  useEffect(() => {
    const amount = rechargeForm.watch("amount");
    const qrData = `trc20:TRX8nHHo2Jd7H9ZwKhh6h8h?amount=${amount}`;
    setQrCodeData(qrData);
  }, [rechargeForm.watch("amount")]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white pb-20 md:pb-6">
      <BalanceBar />

      <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 pt-6 px-2 sm:px-4">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl sm:text-2xl font-bold">Wallet</h1>
          <div className="text-right">
            <p className="text-xs sm:text-sm text-muted-foreground">USDT Balance</p>
            <p className="text-lg sm:text-2xl font-bold">${user?.usdtBalance || 0}</p>
          </div>
        </div>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recharge">Recharge</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>

          <TabsContent value="recharge">
            <Card>
              <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-4">
                <CardTitle className="text-base sm:text-lg">Recharge Wallet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-primary/10 p-3 sm:p-4 rounded-lg text-center space-y-2">
                      <QRCodeSVG
                        value={qrCodeData}
                        size={140}
                        className="mx-auto"
                      />
                      <p className="text-sm font-medium">Scan QR to pay with USDT (TRC20)</p>
                      <p className="text-xs text-muted-foreground">Enter your transaction ID after payment</p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full text-xs sm:text-sm h-8 sm:h-10"
                      onClick={handleCopyUSDT}
                    >
                      <Copy className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Copy USDT Address (TRC20)
                    </Button>
                  </div>

                  <Form {...rechargeForm}>
                    <form
                      onSubmit={rechargeForm.handleSubmit((data) =>
                        rechargeMutation.mutate(data)
                      )}
                      className="space-y-3 sm:space-y-4"
                    >
                      <FormField
                        control={rechargeForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs sm:text-sm">Amount (USDT)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                className="h-8 sm:h-10 text-sm"
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={rechargeForm.control}
                        name="transactionId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs sm:text-sm">Transaction ID</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="h-8 sm:h-10 text-sm"
                                placeholder="Enter your USDT transaction ID"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                            <p className="text-xs text-muted-foreground mt-1">
                              Enter the transaction ID from your USDT transfer
                            </p>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full h-8 sm:h-10 text-xs sm:text-sm mt-2"
                        disabled={rechargeMutation.isPending}
                      >
                        Submit Recharge Request
                      </Button>
                    </form>
                  </Form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw">
            <Card>
              <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-4">
                <CardTitle className="text-base sm:text-lg">Withdraw USDT</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <Form {...withdrawalForm}>
                  <form
                    onSubmit={withdrawalForm.handleSubmit((data) =>
                      withdrawalMutation.mutate(data)
                    )}
                    className="space-y-3 sm:space-y-4"
                  >
                    <FormField
                      control={withdrawalForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">Amount (USDT)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              className="h-8 sm:h-10 text-sm"
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={withdrawalForm.control}
                      name="usdtAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">USDT Address (TRC20)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-8 sm:h-10 text-sm"
                              placeholder="Enter your USDT TRC20 address"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Enter a valid USDT TRC20 address to receive your withdrawal
                          </p>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full h-8 sm:h-10 text-xs sm:text-sm mt-2"
                      disabled={withdrawalMutation.isPending}
                    >
                      Withdraw USDT
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}