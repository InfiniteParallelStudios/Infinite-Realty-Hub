import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getSupabase } from '../../../shared/api/supabase';
import type { Contact } from '../../../shared/types';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
}

const getDefaultContacts = (userId: string): Omit<Contact, 'id' | 'created_at' | 'updated_at'>[] => [
  {
    user_id: userId,
    name: 'John Smith',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    company: 'Smith Real Estate',
    notes: 'Interested in downtown properties',
    tags: ['buyer', 'downtown'],
  },
  {
    user_id: userId,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '(555) 234-5678',
    company: 'Johnson Investments',
    notes: 'Looking for investment properties',
    tags: ['investor', 'commercial'],
  },
  {
    user_id: userId,
    name: 'Mike Wilson',
    email: 'mike@example.com',
    phone: '(555) 345-6789',
    company: 'Wilson Construction',
    notes: 'Potential development partner',
    tags: ['partner', 'development'],
  },
];

export default function ContactsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadContacts = async () => {
    if (!user) return;

    try {
      const supabase = getSupabase();
      const { data: existingContacts, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Database table not found, using fallback mode:', error.message);
        const fallbackContacts = getDefaultContacts(user.id).map((contact, index) => ({
          ...contact,
          id: `fallback-${index}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        setContacts(fallbackContacts);
        return;
      }

      if (existingContacts && existingContacts.length > 0) {
        setContacts(existingContacts);
      } else {
        await createDefaultContacts();
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      const fallbackContacts = getDefaultContacts(user.id).map((contact, index) => ({
        ...contact,
        id: `fallback-${index}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      setContacts(fallbackContacts);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const createDefaultContacts = async () => {
    if (!user) return;

    try {
      const supabase = getSupabase();
      const defaultContacts = getDefaultContacts(user.id);
      
      const { data: newContacts, error } = await supabase
        .from('contacts')
        .insert(defaultContacts)
        .select();

      if (error) {
        console.warn('Database not available, using fallback contacts:', error.message);
        const fallbackContacts = defaultContacts.map((contact, index) => ({
          ...contact,
          id: `fallback-${index}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        setContacts(fallbackContacts);
        return;
      }

      if (newContacts) {
        setContacts(newContacts);
      }
    } catch (error) {
      console.warn('Database unavailable, using fallback contacts:', error.message);
      const defaultContacts = getDefaultContacts(user.id);
      const fallbackContacts = defaultContacts.map((contact, index) => ({
        ...contact,
        id: `fallback-${index}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      setContacts(fallbackContacts);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      notes: '',
    });
    setEditingContact(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (contact: Contact) => {
    setFormData({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      notes: contact.notes || '',
    });
    setEditingContact(contact);
    setShowAddModal(true);
  };

  const handleSaveContact = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!user) return;

    try {
      if (editingContact) {
        // Update existing contact
        const updatedContact = {
          ...editingContact,
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          company: formData.company.trim() || null,
          notes: formData.notes.trim() || null,
          updated_at: new Date().toISOString(),
        };

        setContacts(contacts.map(c => c.id === editingContact.id ? updatedContact : c));

        if (!editingContact.id.startsWith('fallback-')) {
          const supabase = getSupabase();
          await supabase
            .from('contacts')
            .update({
              name: formData.name.trim(),
              email: formData.email.trim() || null,
              phone: formData.phone.trim() || null,
              company: formData.company.trim() || null,
              notes: formData.notes.trim() || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', editingContact.id);
        }
      } else {
        // Create new contact
        const newContactData = {
          user_id: user.id,
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          company: formData.company.trim() || null,
          notes: formData.notes.trim() || null,
        };

        try {
          const supabase = getSupabase();
          const { data: newContact, error } = await supabase
            .from('contacts')
            .insert([newContactData])
            .select()
            .single();

          if (error) {
            // Fallback mode - create contact with local ID
            const fallbackContact = {
              ...newContactData,
              id: `fallback-${Date.now()}`,
              tags: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setContacts([fallbackContact, ...contacts]);
          } else if (newContact) {
            setContacts([newContact, ...contacts]);
          }
        } catch (error) {
          // Fallback mode
          const fallbackContact = {
            ...newContactData,
            id: `fallback-${Date.now()}`,
            tags: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setContacts([fallbackContact, ...contacts]);
        }
      }

      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving contact:', error);
      Alert.alert('Error', 'Failed to save contact');
    }
  };

  const handleDeleteContact = (contact: Contact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setContacts(contacts.filter(c => c.id !== contact.id));

            if (!contact.id.startsWith('fallback-')) {
              try {
                const supabase = getSupabase();
                await supabase.from('contacts').delete().eq('id', contact.id);
              } catch (error) {
                console.error('Error deleting contact:', error);
              }
            }
          },
        },
      ]
    );
  };

  const renderContact = ({ item: contact }: { item: Contact }) => (
    <TouchableOpacity
      style={[styles.contactCard, { backgroundColor: colors.surface }]}
      onPress={() => openEditModal(contact)}
      onLongPress={() => handleDeleteContact(contact)}
    >
      <View style={styles.contactHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {contact.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.contactInfo}>
          <Text style={[styles.contactName, { color: colors.text }]} numberOfLines={1}>
            {contact.name}
          </Text>
          {contact.company && (
            <Text style={[styles.contactCompany, { color: colors.textSecondary }]} numberOfLines={1}>
              {contact.company}
            </Text>
          )}
        </View>
      </View>
      
      {contact.email && (
        <Text style={[styles.contactDetail, { color: colors.textSecondary }]} numberOfLines={1}>
          📧 {contact.email}
        </Text>
      )}
      
      {contact.phone && (
        <Text style={[styles.contactDetail, { color: colors.textSecondary }]} numberOfLines={1}>
          📞 {contact.phone}
        </Text>
      )}

      {contact.tags && contact.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {contact.tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
            </View>
          ))}
          {contact.tags.length > 2 && (
            <Text style={[styles.moreTagsText, { color: colors.textSecondary }]}>
              +{contact.tags.length - 2} more
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading Contacts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>Contacts</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={openAddModal}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {filteredContacts.length} contacts
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.text }]}
          placeholder="Search contacts..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContact}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadContacts();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No contacts found
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={openAddModal}
            >
              <Text style={styles.emptyButtonText}>Add Your First Contact</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add/Edit Contact Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface }]}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={[styles.modalHeaderButton, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingContact ? 'Edit Contact' : 'Add Contact'}
            </Text>
            <TouchableOpacity onPress={handleSaveContact}>
              <Text style={[styles.modalHeaderButton, { color: colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter full name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="email@example.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Phone</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="(555) 123-4567"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Company</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.company}
                onChangeText={(text) => setFormData({ ...formData, company: text })}
                placeholder="Company name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Notes</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Additional notes..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  contactCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactCompany: {
    fontSize: 14,
  },
  contactDetail: {
    fontSize: 14,
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeaderButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    height: 100,
    textAlignVertical: 'top',
  },
});