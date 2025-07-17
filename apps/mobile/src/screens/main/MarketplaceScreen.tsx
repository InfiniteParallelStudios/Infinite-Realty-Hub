/**
 * Marketplace Screen
 * 
 * Property marketplace and listings screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const MarketplaceScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Marketplace</Text>
          <Text style={styles.headerSubtitle}>Find your next property</Text>
        </View>

        {/* Search Bar Placeholder */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchPlaceholder}>Search properties...</Text>
          </View>
        </View>

        {/* Filter Options */}
        <View style={styles.filterContainer}>
          <View style={styles.filterButton}>
            <Text style={styles.filterButtonText}>All</Text>
          </View>
          <View style={styles.filterButton}>
            <Text style={styles.filterButtonText}>For Sale</Text>
          </View>
          <View style={styles.filterButton}>
            <Text style={styles.filterButtonText}>For Rent</Text>
          </View>
          <View style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Sold</Text>
          </View>
        </View>

        {/* Property Listings */}
        <View style={styles.listingsContainer}>
          <Text style={styles.sectionTitle}>Featured Properties</Text>
          
          {/* Property Card */}
          <View style={styles.propertyCard}>
            <View style={styles.propertyImage} />
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyPrice}>$450,000</Text>
              <Text style={styles.propertyAddress}>123 Main Street</Text>
              <Text style={styles.propertyDetails}>3 bed • 2 bath • 1,200 sqft</Text>
            </View>
          </View>

          <View style={styles.propertyCard}>
            <View style={styles.propertyImage} />
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyPrice}>$325,000</Text>
              <Text style={styles.propertyAddress}>456 Oak Avenue</Text>
              <Text style={styles.propertyDetails}>2 bed • 1 bath • 950 sqft</Text>
            </View>
          </View>

          <View style={styles.propertyCard}>
            <View style={styles.propertyImage} />
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyPrice}>$675,000</Text>
              <Text style={styles.propertyAddress}>789 Pine Road</Text>
              <Text style={styles.propertyDetails}>4 bed • 3 bath • 2,100 sqft</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#0D47A1',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#BBDEFB',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: '#999999',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#0D47A1',
    fontWeight: '600',
  },
  listingsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  propertyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  propertyImage: {
    height: 200,
    backgroundColor: '#E0E0E0',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  propertyInfo: {
    padding: 16,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D47A1',
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  propertyDetails: {
    fontSize: 14,
    color: '#666666',
  },
});

export default MarketplaceScreen;
