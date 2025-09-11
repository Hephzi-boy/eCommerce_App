// UploadProductScreen.tsx
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Button, Image, ScrollView, Text, TextInput } from "react-native";
import { supabase } from "../lib/supabase"; // make sure path is correct

export default function UploadProductScreen() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Pick image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);

      // --- Integrated code block ---
      const fileUri = result.assets[0].uri;
      const fileName = `${Date.now()}.jpg`;
      const fileExt = fileUri.split(".").pop();

      // Convert URI → Blob
      const response = await fetch(fileUri);
      const blob = await response.blob();

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from("products") // bucket name
        .upload(fileName, blob, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // get public URL
      const { data: publicData } = supabase.storage
        .from("products")
        .getPublicUrl(data.path);

      return publicData.publicUrl;
    }
  };

  // Upload image to Supabase Storage
  const uploadImage = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `images/${Date.now()}.jpg`;

      const { data, error } = await supabase.storage
        .from("products") // bucket name
        .upload(fileName, blob, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // get public URL
      const { data: publicData } = supabase.storage
        .from("products")
        .getPublicUrl(data.path);

      return publicData.publicUrl;
    } catch (error: any) {
      Alert.alert("Image Upload Error", error.message);
      return null;
    }
  };

  // Save product to Supabase table
  const saveProduct = async () => {
    if (!name || !price || !category || !description || !imageUri) {
      Alert.alert("Missing fields", "Please fill all fields and upload an image");
      return;
    }

    setUploading(true);

    const imageUrl = await uploadImage(imageUri);

    if (!imageUrl) {
      setUploading(false);
      return;
    }

    const { error } = await supabase.from("products").insert([
      {
        name,
        price: parseFloat(price),
        category,
        description,
        image_url: imageUrl,
      },
    ]);

    setUploading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Product uploaded successfully!");
      setName("");
      setPrice("");
      setCategory("");
      setDescription("");
      setImageUri(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, marginTop: 15, backgroundColor: "#f5f5f5" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Upload Product
      </Text>

      <TextInput
        placeholder="Product Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 8 }}
      />

      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 8 }}
      />

      <TextInput
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 8 }}
      />

      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 8 }}
      />

      <Button
        title="Pick Image"
        onPress={pickImage}
        color="#28a745" // <-- updated color
      />
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={{ width: "100%", height: 200, marginVertical: 10, borderRadius: 8 }}
        />
      )}
      <Button
        title={uploading ? "Uploading..." : "Upload Product"}
        onPress={saveProduct}
        disabled={uploading}
        color="#28a745" // <-- updated color
      />
    </ScrollView>
  );
}
