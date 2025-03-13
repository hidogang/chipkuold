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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const rechargeSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  network: z.string().min(1, "Network is required"),
  transactionId: z.string().min(1, "Transaction ID is required").regex(/^[A-Za-z0-9]+$/, "Transaction ID must contain only letters and numbers"),
});

const withdrawalSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  usdtAddress: z.string().min(5, "USDT address is required").max(100, "USDT address too long"),
});

interface WalletAddress {
  network: string;
  address: string;
}

export default function WalletPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedNetwork, setSelectedNetwork] = useState("ethereum");

  // Get tab from URL if present
  const params = new URLSearchParams(window.location.search);
  const defaultTab = params.get('tab') || 'recharge';

  const walletAddressesQuery = useQuery<{
    ethereumAddress: string;
    tronAddress: string;
    bnbAddress: string;
  }>({
    queryKey: ["/api/admin/wallet-addresses"],
  });

  const rechargeForm = useForm({
    resolver: zodResolver(rechargeSchema),
    defaultValues: {
      amount: 0,
      network: "ethereum",
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

  const networkAddresses = {
    ethereum: walletAddressesQuery.data?.ethereumAddress || "0x2468BD1f5B493683b6550Fe331DC39CC854513D2",
    tron: walletAddressesQuery.data?.tronAddress || "TS59qaK6YfN7fvWwffLuvKzzpXDGTBh4dq",
    bnb: walletAddressesQuery.data?.bnbAddress || "bnb1uljaarnxpaug9uvxhln6dyg6w0zeasctn4puvp",
  };

  const networkLabels = {
    ethereum: "USDT (ERC20) - Ethereum",
    tron: "USDT (TRC20) - Tron",
    bnb: "USDT (BEP2) - BNB Beacon Chain",
  };

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

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(networkAddresses[selectedNetwork as keyof typeof networkAddresses]);
    toast({
      title: "Address Copied",
      description: "The USDT address has been copied to your clipboard.",
    });
  };

  const [qrCodeData, setQrCodeData] = useState("");

  useEffect(() => {
    const amount = rechargeForm.watch("amount");
    const address = networkAddresses[selectedNetwork as keyof typeof networkAddresses];
    const qrData = `${selectedNetwork}:${address}?amount=${amount}`;
    setQrCodeData(qrData);
  }, [rechargeForm.watch("amount"), selectedNetwork]);

  // Add scroll reset effect
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      <BalanceBar />

      <div className="flex-grow space-y-4 sm:space-y-6 px-2 sm:px-4 pb-20 md:pb-16 overflow-x-hidden">
        <div className="flex justify-between items-center pt-4">
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
                      <p className="text-sm font-medium">Scan QR to pay with USDT</p>
                      <p className="text-xs text-muted-foreground">Enter your transaction ID after payment</p>
                    </div>

                    <div className="space-y-2">
                      <Select
                        value={selectedNetwork}
                        onValueChange={(value) => {
                          setSelectedNetwork(value);
                          rechargeForm.setValue('network', value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select network" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ethereum">{networkLabels.ethereum}</SelectItem>
                          <SelectItem value="tron">{networkLabels.tron}</SelectItem>
                          <SelectItem value="bnb">{networkLabels.bnb}</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <code className="flex-1 p-2 rounded text-xs sm:text-sm overflow-x-auto font-mono">
                          {networkAddresses[selectedNetwork as keyof typeof networkAddresses]}
                        </code>
                        <Button
                          className="h-8 w-8 bg-amber-500 hover:bg-amber-600 text-white"
                          onClick={handleCopyAddress}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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