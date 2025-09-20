// import {View, Text, FlatList} from 'react-native'
// import {SafeAreaView} from "react-native-safe-area-context";
// import {useCartStore} from "@/store/cart.store";
// import CustomHeader from "@/components/CustomHeader";
// import cn from "clsx";
// import CustomButton from "@/components/CustomButton";
// import CartItem from "@/components/CartItem";
// import {PaymentInfoStripeProps} from '@/type'

// const PaymentInfoStripe = ({ label,  value,  labelStyle,  valueStyle, }: PaymentInfoStripeProps) => (
//     <View className="flex-between flex-row my-1">
//         <Text className={cn("paragraph-medium text-gray-200", labelStyle)}>
//             {label}
//         </Text>
//         <Text className={cn("paragraph-bold text-dark-100", valueStyle)}>
//             {value}
//         </Text>
//     </View>
// );

// const Cart = () => {
//     const { items, getTotalItems, getTotalPrice } = useCartStore();

//     const totalItems = getTotalItems();
//     const totalPrice = getTotalPrice();

//     return (
//         <SafeAreaView className="bg-white h-full">
//             <FlatList
//                 data={items}
//                 renderItem={({ item }) => <CartItem item={item} />}
//                 keyExtractor={(item) => item.id}
//                 contentContainerClassName="pb-28 px-5 pt-5"
//                 ListHeaderComponent={() => <CustomHeader title="Your Cart" />}
//                 ListEmptyComponent={() => <Text>Cart Empty</Text>}
//                 ListFooterComponent={() => totalItems > 0 && (
//                     <View className="gap-5">
//                         <View className="mt-6 border border-gray-200 p-5 rounded-2xl">
//                             <Text className="h3-bold text-dark-100 mb-5">
//                                 Payment Summary
//                             </Text>

//                             <PaymentInfoStripe
//                                 label={`Total Items (${totalItems})`}
//                                 value={`$${totalPrice.toFixed(2)}`}
//                             />
//                             <PaymentInfoStripe
//                                 label={`Delivery Fee`}
//                                 value={`$5.00`}
//                             />
//                             <PaymentInfoStripe
//                                 label={`Discount`}
//                                 value={`- $0.50`}
//                                 valueStyle="!text-success"
//                             />
//                             <View className="border-t border-gray-300 my-2" />
//                             <PaymentInfoStripe
//                                 label={`Total`}
//                                 value={`$${(totalPrice + 5 - 0.5).toFixed(2)}`}
//                                 labelStyle="base-bold !text-dark-100"
//                                 valueStyle="base-bold !text-dark-100 !text-right"
//                             />
//                         </View>

//                         <CustomButton title="Order Now" />
//                     </View>
//                 )}
//             />
//         </SafeAreaView>
//     )
// }

// export default Cart


import { View, Text, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useCartStore } from "@/store/cart.store";
import CustomHeader from "@/components/CustomHeader";
import CustomButton from "@/components/CustomButton";
import CartItem from "@/components/CartItem";
import cn from "clsx";

const PaymentInfoStripe = ({ label, value, labelStyle, valueStyle }) => (
  <View className="flex-between flex-row my-1">
    <Text className={cn("paragraph-medium text-gray-200", labelStyle)}>
      {label}
    </Text>
    <Text className={cn("paragraph-bold text-dark-100", valueStyle)}>
      {value}
    </Text>
  </View>
);

export default function Cart() {
  const router = useRouter();
  const { items, getTotalItems, getTotalPrice } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handlePayment = async () => {
  try {
    const response = await fetch("https://68c92202003e75337ae5.fra.appwrite.run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: totalPrice + 5 - 0.5 }),
    });

    const data = await response.json();
    console.log("Razorpay Order Response:", data);

    if (!data?.success) {
      Alert.alert("Backend Error", JSON.stringify(data));
      return;
    }

    Alert.alert("Order Created", `ID: ${data.order.id}`);
  } catch (err) {
    Alert.alert("Error", err.message);
  }
};


  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={items}
        renderItem={({ item }) => <CartItem item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerClassName="pb-28 px-5 pt-5"
        ListHeaderComponent={() => <CustomHeader title="Your Cart" />}
        ListEmptyComponent={() => <Text>Cart Empty</Text>}
        ListFooterComponent={() =>
          totalItems > 0 && (
            <View className="gap-5">
              <View className="mt-6 border border-gray-200 p-5 rounded-2xl">
                <Text className="h3-bold text-dark-100 mb-5">
                  Payment Summary
                </Text>

                <PaymentInfoStripe
                  label={`Total Items (${totalItems})`}
                  value={`₹${totalPrice.toFixed(2)}`}
                />
                <PaymentInfoStripe label={`Delivery Fee`} value={`₹5.00`} />
                <PaymentInfoStripe
                  label={`Discount`}
                  value={`- ₹0.50`}
                  valueStyle="!text-success"
                />
                <View className="border-t border-gray-300 my-2" />
                <PaymentInfoStripe
                  label={`Total`}
                  value={`₹${(totalPrice + 5 - 0.5).toFixed(2)}`}
                  labelStyle="base-bold !text-dark-100"
                  valueStyle="base-bold !text-dark-100 !text-right"
                />
              </View>

              <CustomButton title="Order Now" onPress={handlePayment} />
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
