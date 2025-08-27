import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getSupabase } from '../../../shared/api/supabase';
import type { Lead, LeadStatus } from '../../../shared/types';

interface PipelineStage {
  id: LeadStatus;
  name: string;
  color: string;
}

const stages: PipelineStage[] = [
  { id: 'new', name: 'New Leads', color: '#3b82f6' },
  { id: 'contacted', name: 'Contacted', color: '#eab308' },
  { id: 'qualified', name: 'Qualified', color: '#f97316' },
  { id: 'presentation', name: 'Presentation', color: '#a855f7' },
  { id: 'negotiation', name: 'Negotiation', color: '#06b6d4' },
  { id: 'contract', name: 'Contract', color: '#6366f1' },
  { id: 'closed_won', name: 'Closed Won', color: '#10b981' },
  { id: 'closed_lost', name: 'Closed Lost', color: '#ef4444' },
];

const getDefaultLeads = (userId: string): Omit<Lead, 'id' | 'created_at' | 'updated_at'>[] => [
  {
    user_id: userId,
    contact_name: 'John Smith',
    contact_email: 'john@example.com',
    contact_phone: '(555) 123-4567',
    status: 'new',
    priority: 'high',
    estimated_value: 450000,
    probability: 25,
  },
  {
    user_id: userId,
    contact_name: 'Sarah Johnson',
    contact_email: 'sarah@example.com',
    contact_phone: '(555) 234-5678',
    status: 'contacted',
    priority: 'medium',
    estimated_value: 320000,
    probability: 45,
  },
  {
    user_id: userId,
    contact_name: 'Mike Wilson',
    contact_email: 'mike@example.com',
    contact_phone: '(555) 345-6789',
    status: 'qualified',
    priority: 'high',
    estimated_value: 580000,
    probability: 65,
  },
];

export default function PipelineScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const stageWidth = screenWidth * 0.8;

  useEffect(() => {
    if (user) {
      loadLeads();
    }
  }, [user]);

  const loadLeads = async () => {
    if (!user) return;

    try {
      const supabase = getSupabase();
      const { data: existingLeads, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Database table not found, using fallback mode:', error.message);
        const fallbackLeads = getDefaultLeads(user.id).map((lead, index) => ({
          ...lead,
          id: `fallback-${index}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        setLeads(fallbackLeads);
        return;
      }

      if (existingLeads && existingLeads.length > 0) {
        setLeads(existingLeads);
      } else {
        await createDefaultLeads();
      }
    } catch (error) {
      console.error('Error loading leads:', error);
      const fallbackLeads = getDefaultLeads(user.id).map((lead, index) => ({
        ...lead,
        id: `fallback-${index}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      setLeads(fallbackLeads);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const createDefaultLeads = async () => {
    if (!user) return;

    try {
      const supabase = getSupabase();
      const defaultLeads = getDefaultLeads(user.id);
      
      const { data: newLeads, error } = await supabase
        .from('leads')
        .insert(defaultLeads)
        .select();

      if (error) {
        console.warn('Database not available, using fallback leads:', error.message);
        const fallbackLeads = defaultLeads.map((lead, index) => ({
          ...lead,
          id: `fallback-${index}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        setLeads(fallbackLeads);
        return;
      }

      if (newLeads) {
        setLeads(newLeads);
      }
    } catch (error) {
      console.warn('Database unavailable, using fallback leads:', error.message);
      const defaultLeads = getDefaultLeads(user.id);
      const fallbackLeads = defaultLeads.map((lead, index) => ({
        ...lead,
        id: `fallback-${index}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      setLeads(fallbackLeads);
    }
  };

  const moveToNextStage = async (leadId: string, currentStatus: LeadStatus) => {
    const currentIndex = stages.findIndex(stage => stage.id === currentStatus);
    if (currentIndex >= stages.length - 1) return;

    const nextStatus = stages[currentIndex + 1].id;
    await updateLeadStatus(leadId, nextStatus);
  };

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    // Optimistically update UI
    const updatedLeads = leads.map(lead =>
      lead.id === leadId
        ? { ...lead, status: newStatus, updated_at: new Date().toISOString() }
        : lead
    );
    setLeads(updatedLeads);

    // Check if this is a fallback lead
    if (leadId.startsWith('fallback-')) {
      return;
    }

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) {
        console.error('Error updating lead status:', error);
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#eab308';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStageStats = () => {
    return stages.map(stage => ({
      ...stage,
      count: leads.filter(lead => lead.status === stage.id).length,
      value: leads
        .filter(lead => lead.status === stage.id)
        .reduce((sum, lead) => sum + lead.estimated_value, 0),
    }));
  };

  const totalValue = leads.reduce((sum, lead) => sum + lead.estimated_value, 0);
  const avgProbability = leads.length > 0 
    ? leads.reduce((sum, lead) => sum + lead.probability, 0) / leads.length 
    : 0;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading Pipeline...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Sales Pipeline</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {leads.length} leads • {formatCurrency(totalValue)} • {avgProbability.toFixed(0)}% avg
        </Text>
      </View>

      {/* Stats */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
        contentContainerStyle={styles.statsContent}
      >
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{leads.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Leads</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statValue, { color: '#10b981' }]}>{formatCurrency(totalValue)}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pipeline Value</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statValue, { color: colors.secondary }]}>{avgProbability.toFixed(0)}%</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg. Probability</Text>
        </View>
      </ScrollView>

      {/* Pipeline Stages */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pipelineContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadLeads} />
        }
      >
        {getStageStats().map((stage, stageIndex) => (
          <View key={stage.id} style={[styles.stageColumn, { width: stageWidth }]}>
            <View style={[styles.stageHeader, { backgroundColor: colors.surface }]}>
              <View style={styles.stageHeaderTop}>
                <View style={[styles.stageIndicator, { backgroundColor: stage.color }]} />
                <Text style={[styles.stageName, { color: colors.text }]} numberOfLines={1}>
                  {stage.name}
                </Text>
                <View style={[styles.stageCount, { backgroundColor: stage.color }]}>
                  <Text style={styles.stageCountText}>{stage.count}</Text>
                </View>
              </View>
              <Text style={[styles.stageValue, { color: colors.textSecondary }]}>
                {formatCurrency(stage.value)}
              </Text>
            </View>

            <ScrollView style={styles.leadsContainer} showsVerticalScrollIndicator={false}>
              {leads
                .filter(lead => lead.status === stage.id)
                .map((lead, leadIndex) => (
                  <TouchableOpacity
                    key={lead.id}
                    style={[styles.leadCard, { backgroundColor: colors.surface }]}
                    onPress={() => {
                      Alert.alert(
                        lead.contact_name,
                        `${lead.contact_email}\n${lead.contact_phone}\n\nValue: ${formatCurrency(lead.estimated_value)}\nProbability: ${lead.probability}%`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          ...(stageIndex < stages.length - 1 ? [
                            {
                              text: `Move to ${stages[stageIndex + 1].name}`,
                              onPress: () => moveToNextStage(lead.id, lead.status)
                            }
                          ] : [])
                        ]
                      );
                    }}
                  >
                    <View style={styles.leadHeader}>
                      <Text style={[styles.leadName, { color: colors.text }]} numberOfLines={1}>
                        {lead.contact_name}
                      </Text>
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(lead.priority) }]}>
                        <Text style={styles.priorityText}>{lead.priority}</Text>
                      </View>
                    </View>
                    
                    <Text style={[styles.leadEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                      {lead.contact_email}
                    </Text>
                    
                    <View style={styles.leadFooter}>
                      <Text style={[styles.leadValue, { color: '#10b981' }]}>
                        {formatCurrency(lead.estimated_value)}
                      </Text>
                      <Text style={[styles.leadProbability, { color: colors.textSecondary }]}>
                        {lead.probability}%
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              
              {leads.filter(lead => lead.status === stage.id).length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No leads in this stage
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  statsContainer: {
    maxHeight: 100,
  },
  statsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  pipelineContainer: {
    flex: 1,
  },
  stageColumn: {
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  stageHeader: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  stageHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stageIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  stageName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  stageCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  stageCountText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stageValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  leadsContainer: {
    flex: 1,
  },
  leadCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  leadName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  leadEmail: {
    fontSize: 12,
    marginBottom: 8,
  },
  leadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leadValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  leadProbability: {
    fontSize: 12,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});