import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Platform, StatusBar } from 'react-native';
import { useSelector } from "react-redux";
import { Ionicons } from '@expo/vector-icons';
import colors from '../commons/Colors';

const WalletPage = () => {
  const {wallet, name} = useSelector((state:any) => state.user);
  const cards = [
    {
      id: '1',
      type: 'Mastercard',
      number: '3056****5904',
      holder: name,
      expiry: '06/26',
      icon: require('../../Images/masterCard.png'),
    },
    {
      id: '2',
      type: 'Visa Electron',
      number: '5213****4854',
      holder: name,
      expiry: '06/26',
      icon: require('../../Images/visa.png'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <View style={styles.profileSection}>
            <Image
              source={require("../../Images/avtar.png")}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{name}</Text>
              <Text style={styles.accountType}>Host Account</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>Rs. {wallet}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle-outline" size={24} color={colors.themeColor} />
            <Text style={styles.actionButtonText}>Add Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="arrow-up-circle-outline" size={24} color={colors.themeColor} />
            <Text style={styles.actionButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cards Section */}
      <View style={styles.cardsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Cards</Text>
          <TouchableOpacity style={styles.addCardButton}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addCardText}>Add New</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <Image source={item.icon} style={styles.cardIcon} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardType}>{item.type}</Text>
                <Text style={styles.cardNumber}>{item.number}</Text>
                <View style={styles.cardDetails}>
                  <Text style={styles.cardHolder}>{item.holder}</Text>
                  <Text style={styles.cardExpiry}>Expires {item.expiry}</Text>
                </View>
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
  },
  balanceCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  accountType: {
    fontSize: 14,
    color: '#64748B',
  },
  settingsButton: {
    padding: 8,
  },
  balanceInfo: {
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.themeColor,
    fontWeight: '600',
  },
  cardsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.themeColor,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addCardText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardIcon: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardType: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardHolder: {
    fontSize: 14,
    color: '#64748B',
  },
  cardExpiry: {
    fontSize: 14,
    color: '#64748B',
  },
});

export default WalletPage;
