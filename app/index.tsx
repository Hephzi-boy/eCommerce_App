// ProductScreen.tsx
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase"; // adjust if needed

// Define Product type (matching your Supabase "products" table)
type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url: string;
  created_at: string;
};

// Pagination size
const PAGE_SIZE = 6;

export default function ProductScreen() {
  const router = useRouter();

  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filters and sorting
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"price" | "created_at">("created_at");
  const [ascending, setAscending] = useState(false);

  // Load products on mount + whenever filters/sorting change
  useEffect(() => {
    fetchProducts(true);
  }, [selectedCategory, sortBy, ascending]);

  // ✅ Upload an image to Supabase storage
  async function uploadProductImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return;

      const file = await fetch(result.assets[0].uri).then((r) => r.blob());
      const fileName = `images/${Date.now()}.jpg`;

      const { data, error } = await supabase.storage
        .from("products") // bucket name
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error(error);
        Alert.alert("Upload failed", error.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("products")
        .getPublicUrl(data.path);

      const publicUrl = publicUrlData.publicUrl;
      Alert.alert("Upload successful", `Image URL: ${publicUrl}`);

      return publicUrl;
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message);
    }
  }

  // ✅ Fetch products from Supabase (with filter, sort, pagination)
  async function fetchProducts(reset = false) {
    setLoading(true);

    let query = supabase
      .from("products")
      .select("id, name, price, category, image_url") // <-- updated select
      .order(sortBy, { ascending })
      .range(
        reset ? 0 : page * PAGE_SIZE,
        (reset ? 0 : page * PAGE_SIZE) + PAGE_SIZE - 1
      );

    if (selectedCategory) {
      query = query.eq("category", selectedCategory);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
    } else {
      if (reset) {
        setProducts(data);
        setPage(1);
        setHasMore(data.length === PAGE_SIZE);
      } else {
        setProducts((prev) => [...prev, ...data]);
        setPage((prev) => prev + 1);
        setHasMore(data.length === PAGE_SIZE);
      }
    }

    setLoading(false);
  }

  // ✅ Render one product card
  const renderItem = ({ item }: { item: Product }) => (
    <View
      style={{
        flex: 1,
        margin: 8,
        padding: 12,
        backgroundColor: "#fff",
        borderRadius: 10,
        elevation: 2,
      }}
    >
      <Image
        source={{ uri: item.image_url }}
        style={{ width: "100%", height: 120, borderRadius: 8 }}
        resizeMode="cover"
      />
      <Text style={{ fontWeight: "bold", marginTop: 8 }}>{item.name}</Text>
      <Text style={{ color: "gray" }}>${item.price}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: "#f5f5f5", marginTop: 50 }}>
      {/* 📸 Upload Test Button */}
      <TouchableOpacity
        onPress={() => router.push("/uploadProductScreen")}
        style={{
          padding: 12,
          backgroundColor: "#28a745",
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Upload Product Image
        </Text>
      </TouchableOpacity>

      {/* Filter Buttons */}
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        {["all", "phones", "fashion", "electronics"].map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat === "all" ? null : cat)}
            style={{
              padding: 8,
              marginRight: 6,
              borderRadius: 8,
              backgroundColor: selectedCategory === cat ? "cc" : "#ddd",
            }}
          >
            <Text style={{ color: selectedCategory === cat ? "#fff" : "#000" }}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sorting Buttons */}
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <TouchableOpacity
          onPress={() => {
            setSortBy("price");
            setAscending(true);
          }}
          style={{
            padding: 8,
            marginRight: 6,
            borderRadius: 8,
            backgroundColor: "#ddd",
          }}
        >
          <Text>Price (Low → High)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setSortBy("created_at");
            setAscending(false);
          }}
          style={{
            padding: 8,
            marginRight: 6,
            borderRadius: 8,
            backgroundColor: "#ddd",
          }}
        >
          <Text>Newest</Text>
        </TouchableOpacity>
      </View>

      {/* Product List with Pagination */}
      {loading && products.length === 0 ? (
        <ActivityIndicator size="large" color="#FA8072" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          ListFooterComponent={
            hasMore ? (
              <TouchableOpacity
                onPress={() => fetchProducts(false)}
                style={{
                  padding: 12,
                  marginVertical: 16,
                  backgroundColor: "#FA8072",
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Load More
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ textAlign: "center", marginVertical: 16 }}>
                No more products
              </Text>
            )
          }
        />
      )}
    </View>
  );
}
